import { DEVELOPER_MODE_UNLOCK_PRICE, PLATFORM_MODES } from "../../constants/app.constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { getModeAccessSnapshot, isDeveloperUnlocked } from "../../utils/userMode.js";

export const profileService = {
  getProfile(user) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isBlocked: Boolean(user.isBlocked || user.status === "blocked"),
      status: user.status,
      bio: user.bio || "",
      academicProfile: user.academicProfile || {
        university: "",
        branch: "",
        year: "",
        semester: "",
      },
      preferences: user.preferences || {
        emailNotifications: true,
        productUpdates: true,
        marketplaceAlerts: true,
      },
      modeAccess: getModeAccessSnapshot(user),
      sellerProfile: user.sellerProfile || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async updateProfile(user, payload) {
    user.name = payload.name?.trim() || user.name;
    user.phone = payload.phone?.trim() || "";
    user.avatarUrl = payload.avatarUrl?.trim() || "";
    user.bio = payload.bio?.trim() || "";
    user.academicProfile = {
      university: payload.university || "",
      branch: payload.branch || "",
      year: payload.year || "",
      semester: payload.semester || "",
    };

    await user.save();
    return this.getProfile(user);
  },

  async updateSettings(user, payload) {
    const requestedMode = payload.currentMode || user.modeAccess?.currentMode || PLATFORM_MODES.PROFESSIONAL;

    if (
      requestedMode === PLATFORM_MODES.DEVELOPER &&
      user.role !== "admin" &&
      !isDeveloperUnlocked(user)
    ) {
      throw new ApiError(403, "Unlock Developer Mode before switching to it.", {
        requiredMode: PLATFORM_MODES.DEVELOPER,
        developerUnlockAmountInr:
          user.modeAccess?.developerUnlockAmountInr || DEVELOPER_MODE_UNLOCK_PRICE,
      });
    }

    user.preferences = {
      emailNotifications: Boolean(payload.emailNotifications),
      productUpdates: Boolean(payload.productUpdates),
      marketplaceAlerts: Boolean(payload.marketplaceAlerts),
    };
    user.modeAccess = {
      ...(user.modeAccess || {}),
      currentMode:
        requestedMode === PLATFORM_MODES.DEVELOPER
          ? PLATFORM_MODES.DEVELOPER
          : PLATFORM_MODES.PROFESSIONAL,
      developerUnlockAmountInr:
        Number(user.modeAccess?.developerUnlockAmountInr) || DEVELOPER_MODE_UNLOCK_PRICE,
    };

    await user.save();
    return this.getProfile(user);
  },
};
