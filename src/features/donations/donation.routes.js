import * as donationController from "./donation.controller.js";
import { makeDonationSchema } from "./donation.schema.js";

async function donationRoutes(fastify) {
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    privateRoutes.post(
      "/stories/:storyId/donate",
      { schema: makeDonationSchema },
      donationController.makeDonation
    );
  });
}

export default donationRoutes;
