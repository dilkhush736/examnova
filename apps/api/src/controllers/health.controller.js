import { getDatabaseStatus, env, integrationConfig } from "../config/index.js";
import { API_VERSION } from "../constants/app.constants.js";
import { getHealthSummary } from "../services/health.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export function getHealth(_req, res) {
  return sendSuccess(res, getHealthSummary(), "Health check successful");
}

export function getReadiness(_req, res) {
  return sendSuccess(
    res,
    {
      service: "examnova-api",
      version: API_VERSION,
      environment: env.nodeEnv,
      database: getDatabaseStatus(),
      integrations: {
        aiEnabled: integrationConfig.ai.enabled,
        emailEnabled: integrationConfig.email.enabled,
        paymentsEnabled: integrationConfig.payments.enabled,
      },
    },
    "Readiness check successful",
  );
}
