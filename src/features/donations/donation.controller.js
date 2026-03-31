const donationService = require("./donation.service");

async function makeDonation(request, reply) {
  const { userId: donatorId } = request.user;
  const { storyId } = request.params;
  const { amount, message } = request.body;

  const result = await donationService.makeDonation(donatorId, storyId, amount, message);
  reply.code(201).send({ success: true, donation: result.donation });
}

module.exports = {
  makeDonation,
};
