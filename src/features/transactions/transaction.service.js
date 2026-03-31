const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? require('stripe')(stripeKey) : null
const prisma = require('../../config/prisma')
const { ValidationError, NotFoundError } = require('../../utils/errors')
const { COIN_PACKS } = require('../../config/products')
const { SUBSCRIPTION_PLANS } = require('../../config/products')

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080'

async function getStripeBalance() {
  if (!stripe) {
    throw new ValidationError('Stripe no está configurado.')
  }
  const balance = await stripe.balance.retrieve()
  return { balance }
}

async function createStripeCheckoutSessionForSubscription(userId, planId) {
  if (!stripe) {
    throw new ValidationError('Stripe no está configurado.')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundError('Usuario no encontrado.')
  }

  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: {
        prismaUserId: userId
      }
    })
    stripeCustomerId = customer.id
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId }
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [
      {
        price: planId,
        quantity: 1
      }
    ],
    success_url: `${FRONTEND_URL}/frontend/modules/payment/payment-success.html`,
    cancel_url: `${FRONTEND_URL}/frontend/modules/payment/payment-canceled.html`,
    metadata: {
      userId: userId,
      type: 'subscription',
      planId: planId
    },
    subscription_data: {
      metadata: {
        prismaUserId: userId
      }
    }
  })

  await prisma.transaction.create({
    data: {
      userId,
      type: 'SUBSCRIPTION',
      amount: 0,
      currency: process.env.STRIPE_CURRENCY || 'usd',
      status: 'PENDING',
      metadata: {
        planId: planId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: stripeCustomerId
      }
    }
  })

  return { sessionId: session.id, url: session.url }
}

async function createStripeCheckoutSessionForCoinPack(userId, coinPackId) {
  if (!stripe) {
    throw new ValidationError('Stripe no está configurado.')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundError('Usuario no encontrado.')
  }

  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: {
        prismaUserId: userId
      }
    })
    stripeCustomerId = customer.id
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId }
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'payment',
    line_items: [
      {
        price: coinPackId,
        quantity: 1
      }
    ],
    success_url: `${FRONTEND_URL}/frontend/modules/payment/payment-success.html`,
    cancel_url: `${FRONTEND_URL}/frontend/modules/payment/payment-canceled.html`,
    metadata: {
      userId: userId,
      type: 'coin_pack_purchase',
      coinPackId: coinPackId
    }
  })

  await prisma.transaction.create({
    data: {
      userId,
      type: 'TOPUP',
      amount: 0,
      currency: process.env.STRIPE_CURRENCY || 'usd',
      status: 'PENDING',
      metadata: {
        coinPackId: coinPackId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: stripeCustomerId
      }
    }
  })

  return { sessionId: session.id, url: session.url }
}

async function handleStripeWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object

      const transaction = await prisma.transaction.findFirst({
        where: {
          metadata: {
            path: ['stripeCheckoutSessionId'],
            equals: session.id
          }
        }
      })

      if (transaction) {
        if (transaction.status === 'COMPLETED') {
          return { message: 'Evento ya procesado.' }
        }

        let paymentIntentOrSubscription
        if (session.mode === 'payment' && session.payment_intent) {
          paymentIntentOrSubscription = await stripe.paymentIntents.retrieve(
            session.payment_intent
          )
        } else if (session.mode === 'subscription' && session.subscription) {
          paymentIntentOrSubscription = await stripe.subscriptions.retrieve(
            session.subscription
          )
        }

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            amount: session.amount_total / 100,
            currency: session.currency,
            metadata: {
              ...transaction.metadata,
              stripeCustomerId: session.customer,
              stripePaymentIntentId: paymentIntentOrSubscription?.id
            }
          }
        })

        const userId = session.metadata.userId
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (user) {
          if (session.metadata.type === 'subscription') {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscriptionType: 'PREMIUM',
                subscriptionEndDate: null
              }
            })
          } else if (session.metadata.type === 'coin_pack_purchase') {
            const coinPackId = session.metadata.coinPackId
            const coinsToAdd = getCoinsForPack(coinPackId)

            if (coinsToAdd > 0) {
              await prisma.user.update({
                where: { id: userId },
                data: { coins: { increment: coinsToAdd } }
              })
            }
          }
        }
      }
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        )
        const userIdFromMetadata = subscription.metadata.prismaUserId

        if (userIdFromMetadata) {
          const user = await prisma.user.findUnique({
            where: { id: userIdFromMetadata }
          })
          if (user && user.subscriptionType !== 'PREMIUM') {
            await prisma.user.update({
              where: { id: userIdFromMetadata },
              data: { subscriptionType: 'PREMIUM' }
            })
          }

          await prisma.transaction.create({
            data: {
              userId: userIdFromMetadata,
              type: 'SUBSCRIPTION',
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: 'COMPLETED',
              metadata: {
                renewal: true,
                invoiceId: invoice.id,
                planId: subscription.items.data[0].price.id
              }
            }
          })
        }
      }
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object
      if (failedInvoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          failedInvoice.subscription
        )
        const userIdFromMetadata = subscription.metadata.prismaUserId
        if (userIdFromMetadata) {
          const user = await prisma.user.findUnique({
            where: { id: userIdFromMetadata }
          })
          if (user) {
            // Log payment failure
          }
        }
      }
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object

      const userIdSubDeleted = deletedSubscription.metadata.prismaUserId
      if (userIdSubDeleted) {
        const user = await prisma.user.findUnique({
          where: { id: userIdSubDeleted }
        })
        if (user) {
          await prisma.user.update({
            where: { id: userIdSubDeleted },
            data: {
              subscriptionType: 'BASIC',
              subscriptionEndDate: new Date()
            }
          })
        }
      }

      await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['stripeSubscriptionId'],
            equals: deletedSubscription.id
          },
          status: 'COMPLETED'
        },
        data: { status: 'CANCELED' }
      })
      break

    default:
      // Unhandled event type
  }

  return { received: true }
}

function getCoinsForPack(coinPackId) {
  const pack = COIN_PACKS.find((p) => p.stripePriceId === coinPackId)

  if (!pack) {
    console.warn(
      `Advertencia: No se encontró un paquete de monedas configurado para el Stripe Price ID: ${coinPackId}`
    )
    return 0
  }

  return pack.coins
}

async function getUserTransactions(userId) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  return { transactions }
}

async function getSubscriptionPlans() {
  return { plans: SUBSCRIPTION_PLANS }
}

async function getCoinPacks() {
  return { packs: COIN_PACKS }
}

module.exports = {
  createStripeCheckoutSessionForSubscription,
  createStripeCheckoutSessionForCoinPack,
  handleStripeWebhookEvent,
  getUserTransactions,
  getSubscriptionPlans,
  getCoinPacks,
  getStripeBalance
}
