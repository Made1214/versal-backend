import * as chapterRepo from "../../repositories/chapter.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import { uploadChapterImage as uploadChapterImageToCloudinary } from "../../utils/cloudinary.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

function isValidYouTubeUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return Boolean(url.pathname && url.pathname !== "/");
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return Boolean(url.searchParams.get("v"));
      }
      return (
        url.pathname.startsWith("/embed/") ||
        url.pathname.startsWith("/shorts/")
      );
    }

    return false;
  } catch {
    return false;
  }
}

function validateChapterVideoUrls(videos) {
  if (videos === undefined) {
    return;
  }

  if (!Array.isArray(videos)) {
    throw new ValidationError(
      "El campo 'videos' debe ser un arreglo de URLs de YouTube.",
    );
  }

  const invalid = videos.find(
    (url) => typeof url !== "string" || !isValidYouTubeUrl(url),
  );
  if (invalid) {
    throw new ValidationError(
      "Solo se permiten URLs válidas de YouTube en 'videos'.",
    );
  }
}

// Crear un nuevo capítulo
async function createChapter(fullChapterData) {
  // Fase 1: permitimos video embebido solo por URL de YouTube validada.
  validateChapterVideoUrls(fullChapterData.videos);
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
  validateChapterVideoUrls(updateData.videos);
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
async function uploadChapterImage(file) {
  return await uploadChapterImageToCloudinary(file);
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
