const prisma = require("../../config/prisma");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);
const { NotFoundError, ValidationError } = require("../../utils/errors");

// Crear un nuevo capítulo
async function createChapter(fullChapterData) {
  const newChapter = await prisma.chapter.create({
    data: fullChapterData,
  });

  return newChapter;
}

// Obtener todos los capítulos de una historia
async function getChaptersByStory(storyId) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    orderBy: { chapterNumber: "asc" },
  });
  return chapters;
}

// Obtener un capítulo por su ID
async function getChapterById(chapterId) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { story: { select: { title: true, authorId: true } } },
  });

  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado.");
  }
  return chapter;
}

// Actualizar un capítulo por su ID
async function updateChapter(chapterId, updateData) {
  const updatedChapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: updateData,
  });

  if (updateData.status === "published") {
    await prisma.story.update({
      where: { id: updatedChapter.storyId },
      data: { status: "published" },
    });
  }

  return updatedChapter;
}

// Eliminar un capítulo por su ID
async function deleteChapter(chapterId) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado");
  }

  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  return chapter;
}

// Función para subir una imagen de capítulo
async function uploadChapterImage(file, req) {
  const uploadDir = path.join(__dirname, "../../../uploads/chapters");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFilename = `${Date.now()}-${file.filename}`;
  const uploadPath = path.join(uploadDir, uniqueFilename);

  await pump(file.file, fs.createWriteStream(uploadPath));

  const imageUrl = `${req.protocol}://${req.headers.host}/uploads/chapters/${uniqueFilename}`;

  return { url: imageUrl };
}

//Obtiene la cantidad de capítulos publicados para una historia
async function getPublishedChapterCount(storyId) {
  const count = await prisma.chapter.count({
    where: { storyId, status: "published" },
  });
  return count;
}

module.exports = {
  createChapter,
  getChaptersByStory,
  getChapterById,
  updateChapter,
  deleteChapter,
  uploadChapterImage,
  getPublishedChapterCount,
};
