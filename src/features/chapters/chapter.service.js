import * as chapterRepo from "../../repositories/chapter.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import { uploadChapterImage } from "../../utils/fileUpload.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

// Crear un nuevo capítulo
async function createChapter(fullChapterData) {
  const newChapter = await chapterRepo.create(fullChapterData);
  return newChapter;
}

// Obtener todos los capítulos de una historia
async function getChaptersByStory(storyId) {
  const chapters = await chapterRepo.findByStory(storyId);
  return chapters;
}

// Obtener un capítulo por su ID
async function getChapterById(chapterId) {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado.");
  }
  return chapter;
}

// Actualizar un capítulo por su ID
async function updateChapter(chapterId, updateData) {
  const updatedChapter = await chapterRepo.update(chapterId, updateData);

  if (updateData.status === "published") {
    await storyRepo.update(updatedChapter.storyId, { status: "published" });
  }

  return updatedChapter;
}

// Eliminar un capítulo por su ID
async function deleteChapter(chapterId) {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) {
    throw new NotFoundError("Capítulo no encontrado");
  }

  await chapterRepo.remove(chapterId);
  return chapter;
}

// Función para subir una imagen de capítulo
async function uploadChapterImageWrapper(file) {
  const url = await uploadChapterImage(file);
  return { url };
}

//Obtiene la cantidad de capítulos publicados para una historia
async function getPublishedChapterCount(storyId) {
  const count = await chapterRepo.countPublished(storyId);
  return count;
}

export {
  createChapter,
  getChaptersByStory,
  getChapterById,
  updateChapter,
  deleteChapter,
  uploadChapterImageWrapper as uploadChapterImage,
  getPublishedChapterCount,
};
