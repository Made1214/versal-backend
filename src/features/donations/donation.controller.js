import * as donationService from "./donation.service.js";

async function makeDonation(request, reply) {
  const { userId: donatorId } = request.user;
  const { storyId } = request.params;
  const { amount, message } = request.body;

  const result = await donationService.makeDonation(donatorId, storyId, amount, message);
  reply.code(201).send({ success: true, donation: result.donation });
}

export {
  makeDonation,
};
