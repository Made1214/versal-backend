const transactionService = require('./transaction.service')
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY no está definido. Debe establecerse en .env'
  )
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function getStripeBalance(request, reply) {
  const result = await transactionService.getStripeBalance()
  reply.send(result)
}

async function createSubscriptionCheckout(request, reply) {
  const { userId } = request.user
  const { planId } = request.body

  const result = await transactionService.createStripeCheckoutSessionForSubscription(
    userId,
    planId
  )

  reply.code(200).send(result)
}

async function createCoinPackCheckout(request, reply) {
  const { userId } = request.user
  const { coinPackId } = request.body

  const result = await transactionService.createStripeCheckoutSessionForCoinPack(
    userId,
    coinPackId
  )

  reply.code(200).send(result)
}

async function stripeWebhook(request, reply) {
  const sig = request.headers['stripe-signature']

  const event = stripe.webhooks.constructEvent(
    request.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  )

  await transactionService.handleStripeWebhookEvent(event)

  reply.code(200).send({ received: true })
}

async function getUserTransactions(request, reply) {
  const { userId } = request.user
  const result = await transactionService.getUserTransactions(userId)

  reply.code(200).send(result)
}

async function getSubscriptionPlans(request, reply) {
  const result = await transactionService.getSubscriptionPlans()
  reply.send(result)
}

async function getCoinPacks(request, reply) {
  const result = await transactionService.getCoinPacks()
  reply.send(result)
}

module.exports = {
  createSubscriptionCheckout,
  createCoinPackCheckout,
  stripeWebhook,
  getUserTransactions,
  getSubscriptionPlans,
  getCoinPacks,
  getStripeBalance
}
