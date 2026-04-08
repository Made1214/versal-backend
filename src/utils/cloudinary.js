import config from "../config/index.js";
import { v2 as cloudinary } from "cloudinary";
import { ValidationError } from "./errors.js";

// Configura Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

function createCloudinaryStream(folder, resourceType = "image") {
  let uploadStream;

  const uploadOptions = {
    folder: `versal/${folder}`,
    resource_type: resourceType,
    overwrite: false,
  };

  if (resourceType === "image") {
    uploadOptions.quality = "auto";
  }

  const resultPromise = new Promise((resolver, reject) => {
    uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolver(result);
      },
    );
  });
  return { uploadStream, resultPromise };
}

export async function uploadFromMultiPartFile(
  file,
  folder,
  resourceType = "image",
) {
  const { uploadStream, resultPromise } = createCloudinaryStream(
    folder,
    resourceType,
  );
  if (file.file && typeof file.file.pipe === "function") {
    file.file.pipe(uploadStream);
  } else {
    throw new ValidationError("El archivo no es válido o no se pudo procesar.");
  }

  const result = await resultPromise;

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadAvatar(file) {
  return uploadFromMultiPartFile(file, "avatars", "image");
}

export async function uploadCover(file) {
  return uploadFromMultiPartFile(file, "covers", "image");
}

export async function uploadChapterImage(file) {
  return uploadFromMultiPartFile(file, "chapters/images", "image");
}

export async function uploadChapterVideo(file) {
  return uploadFromMultiPartFile(file, "chapters/videos", "video");
}

export async function deleteImage(publicId, resourceType = "image") {
  if (!publicId) {
    throw new ValidationError("Public ID is required to delete an image.");
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
