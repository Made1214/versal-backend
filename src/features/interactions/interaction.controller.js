import * as interactionService from "./interaction.service.js";

async function addInteractionToChapter(request, reply) {
  const { id: chapterId } = request.params;
  const { userId } = request.user;

  let requestBody = request.body;

  if (typeof requestBody === "string") {
    requestBody = JSON.parse(requestBody);
  }

  const { interactionType, text } = requestBody;

  const result = await interactionService.addInteractionToChapter({
    chapterId,
    userId,
    interactionType,
    text,
  });

  reply.code(201).send(result);
}

// Obtener interacciones de un capítulo
async function getInteractionsForChapter(request, reply) {
  const { id: chapterId } = request.params;
  const result = await interactionService.getInteractionsForChapter(chapterId);
  reply.send(result);
}

// Borrar una interacción
async function deleteInteraction(request, reply) {
  const { interactionId } = request.params;
  const { userId, role } = request.user;

  const result = await interactionService.deleteInteraction({
    interactionId,
    userId,
    userRole: role,
  });

  reply.send(result);
}

export {
  getInteractionsForChapter,
  addInteractionToChapter,
  deleteInteraction,
};
