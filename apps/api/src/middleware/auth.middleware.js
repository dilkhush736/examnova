import { User } from "../models/index.js";
import { sendError } from "../utils/apiResponse.js";
import { verifyAccessToken } from "../lib/index.js";

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization || "";
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
}

export async function requireAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    req.auth = null;
    return sendError(res, "Authentication required.", 401);
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash");

    if (!user) {
      return sendError(res, "User not found.", 401);
    }

    if (user.isBlocked || user.status === "blocked" || user.status === "suspended") {
      return sendError(res, "Your account is blocked.", 403);
    }

    if (!user.isEmailVerified || user.status === "pending_verification") {
      return sendError(res, "Please verify your account before accessing protected resources.", 403);
    }

    req.auth = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    req.user = user;

    return next();
  } catch (_error) {
    req.auth = null;
    return sendError(res, "Invalid or expired access token.", 401);
  }
}

export function requireRole(_allowedRoles = []) {
  return function roleMiddleware(req, res, next) {
    req.auth = req.auth || null;

    if (!req.auth?.role || !_allowedRoles.includes(req.auth.role)) {
      return sendError(res, "You do not have permission to access this resource.", 403);
    }

    return next();
  };
}
