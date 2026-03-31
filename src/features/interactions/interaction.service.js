import prisma from "../../config/prisma.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../../utils/errors.js"; 


async function updateStoryTotalLikes(storyId) {
  const totalLikes = await prisma.chapterLike.count({
    where: {
      chapter: {
        storyId,
      },
    },
  });

  await prisma.story.update({
    where: { id: storyId },
    data: { viewCount: totalLikes },
  });
}

async function addInteractionToChapter({ chapterId, userId, interactionType, text }) {
  if (interactionType === "like") {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { storyId: true },
    });

    if (!chapter) {
      throw new NotFoundError("Capítulo no encontrado");
    }

    const existingLike = await prisma.chapterLike.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    if (existingLike) {
      await prisma.chapterLike.delete({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
      });
      await updateStoryTotalLikes(chapter.storyId);
      return { status: "unliked", message: "Me gusta quitado." };
    } else {
      const like = await prisma.chapterLike.create({
        data: {
          userId,
          chapterId,
        },
      });
      await updateStoryTotalLikes(chapter.storyId);
      return { status: "liked", like, message: "¡Me gusta!" };
    }
  }

  if (interactionType === "comment") {
    if (!text) {
      throw new ValidationError("El texto del comentario es requerido.");
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundError("Capítulo no encontrado");
    }

    const comment = await prisma.comment.create({
      data: {
        content: text,
        userId,
        chapterId,
      },
      include: {
        user: { select: { username: true, profileImage: true } },
      },
    });

    return { comment, message: "Comentario publicado." };
  }

  throw new ValidationError("Tipo de interacción inválido.");
}

async function getInteractionsForChapter(chapterId) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado");
  }

  const likes = await prisma.chapterLike.findMany({
    where: { chapterId },
    include: {
      user: { select: { username: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const comments = await prisma.comment.findMany({
    where: { chapterId, isDeleted: false },
    include: {
      user: { select: { username: true, profileImage: true } },
      replies: {
        where: { isDeleted: false },
        include: {
          user: { select: { username: true, profileImage: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    interactions: {
      likes,
      comments,
    },
  };
}

async function deleteInteraction({ interactionId, userId, userRole }) {
  const comment = await prisma.comment.findUnique({
    where: { id: interactionId },
    include: { chapter: { select: { storyId: true } } },
  });

  if (!comment) {
    throw new NotFoundError("Comentario no encontrado");
  }

  if (comment.userId !== userId && userRole !== "admin") {
    throw new ForbiddenError("No autorizado para eliminar este comentario");
  }

  await prisma.comment.update({
    where: { id: interactionId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return { message: "Comentario eliminado exitosamente." };
}

export {
  getInteractionsForChapter,
  addInteractionToChapter,
  deleteInteraction,
};
