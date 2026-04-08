import * as transactionService from "./transaction.service.js";
import Stripe from "stripe";
import { ValidationError } from "../../utils/errors.js";
import config from "../../config/index.js";

let stripeClient = null;

function getStripeClient() {
  if (!config.STRIPE_SECRET_KEY) {
    throw new ValidationError("Stripe no está configurado.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(config.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

async function getStripeBalance(request, reply) {
  const result = await transactionService.getStripeBalance();
  reply.send(result);
}

async function createSubscriptionCheckout(request, reply) {
  const { userId } = request.user;
  const { planId } = request.body;

  const result =
    await transactionService.createStripeCheckoutSessionForSubscription(
      userId,
      planId,
    );

  reply.code(200).send(result);
}

async function createCoinPackCheckout(request, reply) {
  const { userId } = request.user;
  const { coinPackId } = request.body;

  const result =
    await transactionService.createStripeCheckoutSessionForCoinPack(
      userId,
      coinPackId,
    );

  reply.code(200).send(result);
}

async function stripeWebhook(request, reply) {
  if (!config.STRIPE_WEBHOOK_SECRET) {
    throw new ValidationError("Stripe webhook no está configurado.");
  }

  const sig = request.headers["stripe-signature"];
  if (!sig) {
    throw new ValidationError("Firma de Stripe no proporcionada.");
  }

  const stripe = getStripeClient();

  const event = stripe.webhooks.constructEvent(
    request.rawBody,
    sig,
    config.STRIPE_WEBHOOK_SECRET,
  );

  await transactionService.handleStripeWebhookEvent(event);

  reply.code(200).send({ received: true });
}

async function getUserTransactions(request, reply) {
  const { userId } = request.user;
  const result = await transactionService.getUserTransactions(userId);

  reply.code(200).send(result);
}

async function getSubscriptionPlans(request, reply) {
  const result = await transactionService.getSubscriptionPlans();
  reply.send(result);
}

async function getCoinPacks(request, reply) {
  const result = await transactionService.getCoinPacks();
  reply.send(result);
}

export {
  createSubscriptionCheckout,
  createCoinPackCheckout,
  stripeWebhook,
  getUserTransactions,
  getSubscriptionPlans,
  getCoinPacks,
  getStripeBalance,
};
