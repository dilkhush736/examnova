import { normalizeBoolean } from "./common.js";
import { PLATFORM_MODES } from "../constants/app.constants.js";

export function validateProfileSettingsUpdate(req, _res, next) {
  const requestedMode = String(req.body?.currentMode || "").trim().toLowerCase();

  req.body = {
    emailNotifications: normalizeBoolean(req.body?.emailNotifications, true),
    productUpdates: normalizeBoolean(req.body?.productUpdates, true),
    marketplaceAlerts: normalizeBoolean(req.body?.marketplaceAlerts, true),
    currentMode:
      requestedMode === PLATFORM_MODES.DEVELOPER
        ? PLATFORM_MODES.DEVELOPER
        : PLATFORM_MODES.PROFESSIONAL,
  };

  return next();
}
