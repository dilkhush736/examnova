import { HTTP_STATUS } from "../constants/http.constants.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const safeMessage =
    statusCode >= 500 && process.env.NODE_ENV !== "development"
      ? "An unexpected error occurred."
      : error.message || "Something went wrong.";

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    details: error.details || null,
    meta: {
      requestId: res.req?.context?.requestId || null,
      timestamp: new Date().toISOString(),
    },
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
}
