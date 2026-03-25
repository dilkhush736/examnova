import { HTTP_STATUS } from "../constants/http.constants.js";

export function notFoundHandler(req, res) {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
