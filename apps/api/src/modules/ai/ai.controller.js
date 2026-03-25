import { sendSuccess } from "../../utils/apiResponse.js";
import { questionDetectionService } from "./questionDetection.service.js";

export const aiController = {
  async detectQuestions(req, res) {
    const payload = await questionDetectionService.detectQuestions({
      documentId: req.params.documentId,
      userId: req.auth.userId,
      prompt: req.body.prompt,
      forceRerun: req.body.forceRerun,
    });

    return sendSuccess(res, payload, "Question detection completed successfully.");
  },
  async getDetectedQuestions(req, res) {
    const questions = await questionDetectionService.listQuestions({
      documentId: req.params.documentId,
      userId: req.auth.userId,
      filters: req.query,
    });

    return sendSuccess(res, { questions }, "Detected questions fetched successfully.");
  },
  async updateQuestionSelections(req, res) {
    const questions = await questionDetectionService.updateSelections({
      documentId: req.params.documentId,
      userId: req.auth.userId,
      questionIds: req.body.questionIds,
      selected: req.body.selected,
    });

    return sendSuccess(res, { questions }, "Question selection updated successfully.");
  },
  async resetDetectedQuestions(req, res) {
    await questionDetectionService.resetQuestions({
      documentId: req.params.documentId,
      userId: req.auth.userId,
    });

    return sendSuccess(res, {}, "Detected questions reset successfully.");
  },
};
