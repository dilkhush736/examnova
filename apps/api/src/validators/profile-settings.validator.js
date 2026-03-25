import { normalizeBoolean } from "./common.js";

export function validateProfileSettingsUpdate(req, _res, next) {
  req.body = {
    emailNotifications: normalizeBoolean(req.body?.emailNotifications, true),
    productUpdates: normalizeBoolean(req.body?.productUpdates, true),
    marketplaceAlerts: normalizeBoolean(req.body?.marketplaceAlerts, true),
  };

  return next();
}
