import dotenv from "dotenv";

dotenv.config();

const allowedNodeEnvs = new Set(["development", "test", "production"]);

function getEnv(name, fallback = "") {
  const value = process.env[name] || fallback;
  return typeof value === "string" ? value.trim() : value;
}

function getNumber(name, fallback) {
  const value = Number(getEnv(name, fallback));
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a valid number.`);
  }
  return value;
}

function getBoolean(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) {
    return fallback;
  }
  return value === "true";
}

function getRequiredEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getStringList(name, fallback) {
  return getEnv(name, fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const nodeEnv = getEnv("NODE_ENV", "development");

if (!allowedNodeEnvs.has(nodeEnv)) {
  throw new Error(`NODE_ENV must be one of: ${Array.from(allowedNodeEnvs).join(", ")}`);
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv === "development",
  port: getNumber("PORT", 4000),
  webAppUrl: getEnv("WEB_APP_URL", "http://localhost:5173"),
  publicSiteUrl: getEnv("PUBLIC_SITE_URL", "http://localhost:5173"),
  apiBaseUrl: getEnv("API_BASE_URL", "http://localhost:4000"),
  mongodbUri: getRequiredEnv("MONGODB_URI"),
  jwtAccessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: getRequiredEnv("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  refreshTokenCookieName: getEnv("REFRESH_TOKEN_COOKIE_NAME", "examnova_refresh"),
  refreshTokenCookieSecure: getBoolean("REFRESH_TOKEN_COOKIE_SECURE", false),
  otpTtlMinutes: getNumber("OTP_TTL_MINUTES", 10),
  otpResendCooldownSeconds: getNumber("OTP_RESEND_COOLDOWN_SECONDS", 60),
  otpMaxAttempts: getNumber("OTP_MAX_ATTEMPTS", 5),
  resetPasswordTtlMinutes: getNumber("RESET_PASSWORD_TTL_MINUTES", 15),
  smtpHost: getEnv("SMTP_HOST", "smtp.example.com"),
  smtpPort: getNumber("SMTP_PORT", 587),
  smtpSecure: getBoolean("SMTP_SECURE", false),
  smtpUser: getEnv("SMTP_USER", ""),
  smtpPass: getEnv("SMTP_PASS", ""),
  smtpFromName: getEnv("SMTP_FROM_NAME", "ExamNova AI"),
  smtpFromEmail: getEnv("SMTP_FROM_EMAIL", "noreply@example.com"),
  smtpJsonTransport: getBoolean("SMTP_JSON_TRANSPORT", true),
  razorpayKeyId: getEnv("RAZORPAY_KEY_ID", ""),
  razorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
  razorpayWebhookSecret: getEnv("RAZORPAY_WEBHOOK_SECRET", ""),
  aiProvider: getEnv("AI_PROVIDER", "openai"),
  aiApiKey: getEnv("AI_API_KEY", ""),
  aiModel: getEnv("AI_MODEL", "gpt-5.4"),
  maxUploadSizeMb: getNumber("MAX_UPLOAD_SIZE_MB", 25),
  allowedUploadMimeTypes: getStringList(
    "ALLOWED_UPLOAD_MIME_TYPES",
    "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
  ),
  fileStorageDisk: getEnv("FILE_STORAGE_DISK", "local"),
  fileStorageBucket: getEnv("FILE_STORAGE_BUCKET", "examnova-assets"),
  localUploadDir: getEnv("LOCAL_UPLOAD_DIR", "uploads"),
  logLevel: getEnv("LOG_LEVEL", "info"),
  trustProxy: getBoolean("TRUST_PROXY", false),
  requestIdHeader: getEnv("REQUEST_ID_HEADER", "x-request-id"),
};
