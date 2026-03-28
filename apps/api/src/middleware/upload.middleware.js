import multer from "multer";
import { env } from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_COVER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_SERVICE_ARCHIVE_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!env.allowedUploadMimeTypes.includes(file.mimetype)) {
      callback(new ApiError(415, `Unsupported file type: ${file.mimetype}`));
      return;
    }

    callback(null, true);
  },
});

export const singleDocumentUpload = upload.single("document");

function isValidCoverImage(file) {
  return ALLOWED_COVER_IMAGE_TYPES.has(String(file?.mimetype || "").toLowerCase());
}

const adminUploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 2,
  },
  fileFilter(_req, file, callback) {
    if (file.fieldname === "pdf") {
      if (file.mimetype !== "application/pdf") {
        callback(new ApiError(415, "Only PDF files are supported for admin uploads."));
        return;
      }

      callback(null, true);
      return;
    }

    if (file.fieldname === "coverImage") {
      if (!isValidCoverImage(file)) {
        callback(new ApiError(415, "Only JPG, PNG, WEBP, or AVIF images are supported as cover images."));
        return;
      }

      callback(null, true);
      return;
    }

    callback(new ApiError(415, `Unsupported upload field: ${file.fieldname}`));
  },
});

const marketplaceCoverUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (file.fieldname !== "coverImage") {
      callback(new ApiError(415, `Unsupported upload field: ${file.fieldname}`));
      return;
    }

    if (!isValidCoverImage(file)) {
      callback(new ApiError(415, "Only JPG, PNG, WEBP, or AVIF images are supported as cover images."));
      return;
    }

    callback(null, true);
  },
});

const serviceListingFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 2,
  },
  fileFilter(_req, file, callback) {
    if (file.fieldname === "image") {
      if (!isValidCoverImage(file)) {
        callback(new ApiError(415, "Only JPG, PNG, WEBP, or AVIF images are supported for service images."));
        return;
      }

      callback(null, true);
      return;
    }

    if (file.fieldname === "zipFile") {
      if (!ALLOWED_SERVICE_ARCHIVE_TYPES.has(String(file?.mimetype || "").toLowerCase())) {
        callback(new ApiError(415, "Only ZIP files are supported for downloadable website packages."));
        return;
      }

      callback(null, true);
      return;
    }

    callback(new ApiError(415, `Unsupported upload field: ${file.fieldname}`));
  },
});

export const adminUploadFieldFiles = adminUploadFiles.fields([
  { name: "pdf", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
export const marketplaceCoverImageUpload = marketplaceCoverUpload.fields([{ name: "coverImage", maxCount: 1 }]);
export const serviceListingFieldFiles = serviceListingFiles.fields([
  { name: "image", maxCount: 1 },
  { name: "zipFile", maxCount: 1 },
]);
