import multer from "multer";
import { env } from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";

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

const adminPdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      callback(new ApiError(415, "Only PDF files are supported for admin uploads."));
      return;
    }

    callback(null, true);
  },
});

export const singleAdminPdfUpload = adminPdfUpload.single("pdf");
