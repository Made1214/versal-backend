import * as chapterRepo from "../../repositories/chapter.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
const pump = util.promisify(pipeline);
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
  const count = await chapterRepo.countPublished(storyId);
  return count;
}

export {
  createChapter,
  getChaptersByStory,
  getChapterById,
  updateChapter,
  deleteChapter,
  uploadChapterImage,
  getPublishedChapterCount,
};
