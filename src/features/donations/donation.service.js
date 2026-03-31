import * as userRepo from '../../models/user.repository.js';
import * as storyRepo from '../../models/story.repository.js';
import * as transactionRepo from '../../models/transaction.repository.js';
import { ValidationError, NotFoundError, ConflictError } from '../../utils/errors.js';

async function makeDonation(donatorId, storyId, amount, message) {
  if (amount <= 0) {
    throw new ValidationError('La cantidad a donar debe ser positiva.')
  }

  const [donator, story] = await Promise.all([
    userRepo.findById(donatorId),
    storyRepo.findById(storyId)
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

  await userRepo.update(donatorId, { coins: { decrement: amount } })
  await userRepo.update(recipientId, { coins: { increment: amount } })

  const newDonation = await transactionRepo.createDonation({
    donatorId,
    recipientId,
    storyId,
    amount,
    message
  })

  await transactionRepo.create({
    userId: donatorId,
    type: 'DONATION',
    amount: amount,
    currency: 'coins',
    status: 'COMPLETED',
    metadata: {
      recipientId,
      storyId
    }
  })

  return { success: true, donation: newDonation }
}

export { makeDonation };
