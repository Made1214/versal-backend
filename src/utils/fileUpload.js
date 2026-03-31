import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
import { fileURLToPath } from "url";

const pump = util.promisify(pipeline);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sube un archivo a un directorio específico
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @param {string} subdirectory - Subdirectorio dentro de uploads (ej: 'avatars', 'covers', 'chapters')
 * @param {Object} request - Objeto de request de Fastify (para obtener protocol y host)
 * @returns {Promise<string>} URL del archivo subido
 * @throws {Error} Si hay error al subir el archivo
 */
export async function uploadFile(file, subdirectory, request) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Construir ruta del directorio
  const uploadDir = path.join(__dirname, `../../../uploads/${subdirectory}`);

  // Crear directorio si no existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generar nombre único para el archivo
  const uniqueFilename = `${Date.now()}-${file.filename}`;
  const uploadPath = path.join(uploadDir, uniqueFilename);

  // Guardar archivo
  await pump(file.file, fs.createWriteStream(uploadPath));

  // Construir URL del archivo
  const imageUrl = `${request.protocol}://${request.headers.host}/uploads/${subdirectory}/${uniqueFilename}`;

  return imageUrl;
}

/**
 * Sube un avatar de usuario
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @param {Object} request - Objeto de request de Fastify
 * @returns {Promise<string>} URL del avatar subido
 */
export async function uploadAvatar(file, request) {
  return uploadFile(file, "avatars", request);
}

/**
 * Sube una portada de historia
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @param {Object} request - Objeto de request de Fastify
 * @returns {Promise<string>} URL de la portada subida
 */
export async function uploadCover(file, request) {
  return uploadFile(file, "covers", request);
}

/**
 * Sube una imagen de capítulo
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @param {Object} request - Objeto de request de Fastify
 * @returns {Promise<string>} URL de la imagen subida
 */
export async function uploadChapterImage(file, request) {
  return uploadFile(file, "chapters", request);
}
