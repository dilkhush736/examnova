import { sendSuccess } from "../../utils/apiResponse.js";
import { profileService } from "./profile.service.js";

export const profileController = {
  getMe(req, res) {
    return sendSuccess(
      res,
      {
        user: profileService.getProfile(req.user),
      },
      "Profile fetched successfully.",
    );
  },
  async updateMe(req, res) {
    const user = await profileService.updateProfile(req.user, req.body);

    return sendSuccess(
      res,
      {
        user,
      },
      "Profile updated successfully.",
    );
  },
  async updateSettings(req, res) {
    const user = await profileService.updateSettings(req.user, req.body);

    return sendSuccess(
      res,
      {
        user,
      },
      "Account settings updated successfully.",
    );
  },
};
