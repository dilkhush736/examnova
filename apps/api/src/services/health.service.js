import { getDatabaseStatus, env } from "../config/index.js";

export function getHealthSummary() {
  return {
    service: "examnova-api",
    status: "ok",
    uptime: process.uptime(),
    environment: env.nodeEnv,
    database: getDatabaseStatus(),
  };
}
