import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { registerRoutes } from "./routes/index.js";
import { createCorsOptions, env } from "./config/index.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { attachRequestContext } from "./middleware/requestContext.middleware.js";
import { rateLimitPlaceholder } from "./middleware/rateLimit.middleware.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxy);
  app.use(attachRequestContext);
  app.use(cors(createCorsOptions()));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(rateLimitPlaceholder);
  app.use(express.json({ limit: `${env.maxUploadSizeMb}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.maxUploadSizeMb}mb` }));
  app.use(cookieParser());

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
