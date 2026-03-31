import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
const pump = util.promisify(pipeline);

import * as chapterService from "./chapter.service.js";
import { Story } from "../../models/story.model.js";

// Controlador para crear un nuevo capítulo
async function createChapter(request, reply) {
  const { storyId } = request.params;
  const chapterData = request.body;
  const authorId = request.user.userId;

  const result = await chapterService.createChapter({
    ...chapterData,
    storyId,
    authorId,
  });

  return reply.code(201).send({
    message: "Capítulo creado exitosamente",
    chapter: result,
  });
}

// Controlador para obtener capítulos por historia
async function getChaptersByStory(request, reply) {
  const { storyId } = request.params;
  const chapters = await chapterService.getChaptersByStory(storyId);
  reply.send({ chapters });
}

// Controlador para obtener un capítulo por ID
async function getChapterById(request, reply) {
  const { id } = request.params;
  const chapter = await chapterService.getChapterById(id);
  reply.send({ chapter });
}

// Controlador para actualizar un capítulo
async function updateChapter(request, reply) {
  const { id } = request.params;
  const { userId } = request.user;

  // Verificación de permisos
  const chapter = await chapterService.getChapterById(id);
  if (chapter.story.authorId !== userId) {
    throw new Error("No tienes permiso para editar este capítulo.");
  }

  const result = await chapterService.updateChapter(id, request.body);
  reply.send({ chapter: result });
}

// eliminar un capítulo
async function deleteChapter(request, reply) {
  const { id } = request.params;
  const { userId } = request.user;

  const chapter = await chapterService.getChapterById(id);
  if (chapter.story.authorId !== userId) {
    throw new Error("No tienes permiso para eliminar este capítulo.");
  }

  const result = await chapterService.deleteChapter(id);
  reply.send({ message: "Capítulo eliminado exitosamente", chapter: result });
}

async function uploadChapterImage(request, reply) {
  const file = await request.file();
  const result = await chapterService.uploadChapterImage(file, request);
  return reply.send(result);
}

async function getPublishedChapterCount(request, reply) {
  const { storyId } = request.params;
  const publishedChapterCount = await chapterService.getPublishedChapterCount(storyId);
  reply.send({ publishedChapterCount });
}

export {
  createChapter,
  getChaptersByStory,
  getChapterById,
  updateChapter,
  uploadChapterImage,
  deleteChapter,
  getPublishedChapterCount,
};
