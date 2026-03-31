import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube un archivo a Cloudinary
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @param {string} folder - Carpeta en Cloudinary (ej: 'avatars', 'covers', 'chapters')
 * @returns {Promise<string>} URL del archivo subido
 * @throws {Error} Si hay error al subir el archivo
 */
export async function uploadFile(file, folder) {
  if (!file) {
    throw new Error("No file provided");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `versal/${folder}`,
        resource_type: "auto",
        quality: "auto",
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Upload failed: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convertir el stream de Fastify a stream legible
    if (file.file && typeof file.file.pipe === "function") {
      file.file.pipe(uploadStream);
    } else {
      reject(new Error("Invalid file stream"));
    }
  });
}

/**
 * Sube un avatar de usuario
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @returns {Promise<string>} URL del avatar subido
 */
export async function uploadAvatar(file) {
  return uploadFile(file, "avatars");
}

/**
 * Sube una portada de historia
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @returns {Promise<string>} URL de la portada subida
 */
export async function uploadCover(file) {
  return uploadFile(file, "covers");
}

/**
 * Sube una imagen de capítulo
 * @param {Object} file - Objeto de archivo de Fastify multipart
 * @returns {Promise<string>} URL de la imagen subida
 */
export async function uploadChapterImage(file) {
  return uploadFile(file, "chapters");
}
