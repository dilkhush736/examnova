import crypto from "node:crypto";
import { ApiError } from "../../utils/ApiError.js";
import { ParsedQuestion, UploadedDocument } from "../../models/index.js";
import { detectionPromptService } from "./detectionPrompt.service.js";
import { questionDetectionProvider } from "./questionDetection.provider.js";
import { questionNormalizationService } from "./questionNormalization.service.js";

function uniqueByNormalizedText(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.normalizedText || seen.has(item.normalizedText)) {
      return false;
    }
    seen.add(item.normalizedText);
    return true;
  });
}

function matchesPromptFilter(question, promptMetadata) {
  if (promptMetadata.importantOnly && question.importanceFlag !== "high") {
    return false;
  }

  if (
    promptMetadata.desiredQuestionType &&
    question.inferredQuestionType !== promptMetadata.desiredQuestionType
  ) {
    return false;
  }

  if (
    promptMetadata.unit &&
    question.inferredUnit &&
    question.inferredUnit.toLowerCase() !== promptMetadata.unit.toLowerCase()
  ) {
    return false;
  }

  if (promptMetadata.selectedTopicKeywords.length > 0) {
    const haystack = `${question.questionText} ${question.inferredTopic}`.toLowerCase();
    const keywordMatches = promptMetadata.selectedTopicKeywords.some((keyword) => haystack.includes(keyword));
    if (!keywordMatches && promptMetadata.originalPrompt) {
      return false;
    }
  }

  return true;
}

function serializeQuestion(question) {
  return {
    id: question._id.toString(),
    questionNumber: question.questionNumber,
    questionText: question.questionText,
    normalizedText: question.normalizedText,
    inferredUnit: question.inferredUnit,
    inferredTopic: question.inferredTopic,
    inferredModule: question.inferredModule,
    inferredQuestionType: question.inferredQuestionType,
    importanceFlag: question.importanceFlag,
    confidenceScore: question.confidenceScore,
    reviewStatus: question.reviewStatus,
    selectedForGeneration: question.selectedForGeneration,
    sourcePage: question.sourcePage,
    sourceLineStart: question.sourceLineStart,
    sourceLineEnd: question.sourceLineEnd,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };
}

export const questionDetectionService = {
  async detectQuestions({ documentId, userId, prompt, forceRerun = false }) {
    const document = await UploadedDocument.findOne({
      _id: documentId,
      userId,
      status: { $ne: "archived" },
    });

    if (!document) {
      throw new ApiError(404, "Uploaded document not found.");
    }

    if (!document.normalizedText) {
      throw new ApiError(400, "This document does not contain parsed text yet.");
    }

    if (document.normalizedText.length > 250000) {
      throw new ApiError(413, "This document is too large for a single detection run. Please upload a smaller or more focused file.");
    }

    if (!forceRerun && document.detectionStatus === "processing") {
      throw new ApiError(409, "Question detection is already in progress for this document.");
    }

    if (
      !forceRerun &&
      document.detectionLastRunAt &&
      Date.now() - new Date(document.detectionLastRunAt).getTime() < 10 * 1000
    ) {
      throw new ApiError(429, "Please wait a few seconds before running detection again.");
    }

    document.detectionStatus = "processing";
    document.detectionPrompt = prompt || "";
    document.detectionError = "";
    await document.save();

    try {
      const promptMetadata = detectionPromptService.interpret(prompt);
      const rawCandidates = await questionDetectionProvider.detect({
        extractedText: document.normalizedText,
        promptMetadata,
      });

      const normalizedQuestions = uniqueByNormalizedText(
        rawCandidates
          .map((candidate) => questionNormalizationService.normalize(candidate, promptMetadata, document))
          .filter((question) => question.questionText.length > 15)
          .filter((question) => matchesPromptFilter(question, promptMetadata)),
      ).slice(0, 200);

      await ParsedQuestion.deleteMany({ documentId, userId });

      const detectionRunId = crypto.randomUUID();

      const createdQuestions = normalizedQuestions.length
        ? await ParsedQuestion.insertMany(
            normalizedQuestions.map((question) => ({
              ...question,
              userId,
              documentId,
              detectionRunId,
            })),
          )
        : [];

      document.detectionStatus = "completed";
      document.detectionLastRunAt = new Date();
      document.detectionError = normalizedQuestions.length
        ? ""
        : "No usable questions were detected from this content.";
      await document.save();

      const questionsToReturn = Array.isArray(createdQuestions)
        ? createdQuestions
        : await ParsedQuestion.find({ documentId, userId, detectionRunId });

      return {
        document: {
          id: document._id.toString(),
          documentTitle: document.documentTitle,
          detectionStatus: document.detectionStatus,
          detectionPrompt: document.detectionPrompt,
          detectionLastRunAt: document.detectionLastRunAt,
        },
        promptMetadata,
        questions: questionsToReturn.map(serializeQuestion),
      };
    } catch (error) {
      document.detectionStatus = "failed";
      document.detectionError = error.message || "Question detection failed.";
      await document.save();
      throw error;
    }
  },

  async listQuestions({ documentId, userId, filters }) {
    const query = {
      documentId,
      userId,
    };

    if (filters.search) {
      query.questionText = { $regex: filters.search, $options: "i" };
    }
    if (filters.questionType) {
      query.inferredQuestionType = filters.questionType;
    }
    if (filters.importanceFlag) {
      query.importanceFlag = filters.importanceFlag;
    }
    if (filters.selectedOnly === "true") {
      query.selectedForGeneration = true;
    }

    const questions = await ParsedQuestion.find(query).sort({ createdAt: 1 });
    return questions.map(serializeQuestion);
  },

  async updateSelections({ documentId, userId, questionIds, selected }) {
    await ParsedQuestion.updateMany(
      {
        _id: { $in: questionIds },
        documentId,
        userId,
      },
      {
        selectedForGeneration: selected,
        reviewStatus: "reviewed",
      },
    );

    const questions = await ParsedQuestion.find({ documentId, userId }).sort({ createdAt: 1 });
    return questions.map(serializeQuestion);
  },

  async resetQuestions({ documentId, userId }) {
    await ParsedQuestion.deleteMany({ documentId, userId });

    await UploadedDocument.findOneAndUpdate(
      { _id: documentId, userId },
      {
        detectionStatus: "idle",
        detectionPrompt: "",
        detectionLastRunAt: null,
        detectionError: "",
      },
    );
  },
};
