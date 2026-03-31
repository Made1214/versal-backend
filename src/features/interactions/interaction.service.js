import * as interactionRepo from "../../repositories/interaction.repository.js";
import * as chapterRepo from "../../repositories/chapter.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../../utils/errors.js"; 


async function updateStoryTotalLikes(storyId) {
  const totalLikes = await interactionRepo.countLikesByStory(storyId);
  await storyRepo.update(storyId, { viewCount: totalLikes });
}

async function addInteractionToChapter({ chapterId, userId, interactionType, text }) {
  if (interactionType === "like") {
    const chapter = await chapterRepo.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError("Capítulo no encontrado");
    }

    const existingLike = await interactionRepo.findLike(userId, chapterId);

    if (existingLike) {
      await interactionRepo.deleteLike(userId, chapterId);
      await updateStoryTotalLikes(chapter.storyId);
      return { status: "unliked", message: "Me gusta quitado." };
    } else {
      const like = await interactionRepo.createLike(userId, chapterId);
      await updateStoryTotalLikes(chapter.storyId);
      return { status: "liked", like, message: "¡Me gusta!" };
    }
  }

  if (interactionType === "comment") {
    if (!text) {
      throw new ValidationError("El texto del comentario es requerido.");
    }

    const chapter = await chapterRepo.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError("Capítulo no encontrado");
    }

    const comment = await interactionRepo.createComment(userId, chapterId, text);
    return { comment, message: "Comentario publicado." };
  }

  throw new ValidationError("Tipo de interacción inválido.");
}

async function getInteractionsForChapter(chapterId) {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado");
  }

  const likes = await interactionRepo.findLikesByChapter(chapterId);
  const comments = await interactionRepo.findCommentsByChapter(chapterId);

  return {
    interactions: {
      likes,
      comments,
    },
  };
}

async function deleteInteraction({ interactionId, userId, userRole }) {
  const comment = await interactionRepo.findCommentById(interactionId);

  if (!comment) {
    throw new NotFoundError("Comentario no encontrado");
  }

  if (comment.userId !== userId && userRole !== "admin") {
    throw new ForbiddenError("No autorizado para eliminar este comentario");
  }

  await interactionRepo.softDeleteComment(interactionId);
  return { message: "Comentario eliminado exitosamente." };
}

export {
  getInteractionsForChapter,
  addInteractionToChapter,
  deleteInteraction,
};
