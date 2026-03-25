import crypto from "node:crypto";
import { env } from "../config/index.js";

export function attachRequestContext(req, res, next) {
  const requestId = req.headers[env.requestIdHeader] || crypto.randomUUID();

  req.context = {
    requestId,
    startedAt: new Date().toISOString(),
  };

  res.setHeader(env.requestIdHeader, requestId);
  next();
}
