import prisma from '../../config/prisma.js';
import { ValidationError, NotFoundError, ConflictError } from '../../utils/errors.js';

async function makeDonation(donatorId, storyId, amount, message) {
  if (amount <= 0) {
    throw new ValidationError('La cantidad a donar debe ser positiva.')
  }

  const [donator, story] = await Promise.all([
    prisma.user.findUnique({ where: { id: donatorId } }),
    prisma.story.findUnique({ where: { id: storyId } })
  ])

  if (!donator) throw new NotFoundError('El usuario donador no fue encontrado.')
  if (!story) throw new NotFoundError('La historia no fue encontrada.')

  const recipientId = story.authorId

  if (donatorId === recipientId) {
    throw new ConflictError('No puedes donarte monedas a ti mismo.')
  }
  if (donator.coins < amount) {
    throw new ValidationError('No tienes suficientes monedas para realizar esta donación.')
  }

  await prisma.user.update({
    where: { id: donatorId },
    data: { coins: { decrement: amount } }
  })

  await prisma.user.update({
    where: { id: recipientId },
    data: { coins: { increment: amount } }
  })

  const newDonation = await prisma.donation.create({
    data: {
      donatorId,
      recipientId,
      storyId,
      amount,
      message
    }
  })

  await prisma.transaction.create({
    data: {
      userId: donatorId,
      type: 'DONATION',
      amount: amount,
      currency: 'coins',
      status: 'COMPLETED',
      metadata: {
        recipientId,
        storyId
      }
    }
  })

  return { success: true, donation: newDonation }
}

export { makeDonation };
