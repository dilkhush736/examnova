import { ApiError } from "../../utils/ApiError.js";
import { GeneratedPdf, ParsedQuestion, UploadedDocument } from "../../models/index.js";
import { answerPromptService } from "./answerPrompt.service.js";
import { answerGenerationProvider } from "./answerGeneration.provider.js";
import { answerNormalizationService } from "./answerNormalization.service.js";
import { figurePlanningService } from "./figurePlanning.service.js";

function serializeGeneration(record) {
  return {
    id: record._id.toString(),
    title: record.title,
    sourceDocumentId: record.sourceDocumentId?.toString?.() || null,
    generationPrompt: record.generationPrompt || "",
    generationStatus: record.generationStatus,
    failureReason: record.failureReason || "",
    pdfGenerationStatus: record.pdfGenerationStatus || "idle",
    pdfFailureReason: record.pdfFailureReason || "",
    pdfGenerationStartedAt: record.pdfGenerationStartedAt || null,
    pdfGeneratedAt: record.pdfGeneratedAt || null,
    pdfFileName: record.pdfFileName || "",
    pdfSlug: record.pdfSlug || "",
    pdfDownloadName: record.pdfDownloadName || "",
    renderVersion: record.renderVersion || "compact-v1",
    pageCount: record.pageCount || 0,
    storageKey: record.storageKey || "",
    storageUrl: record.storageUrl || "",
    downloadUnlocked: Boolean(record.downloadUnlocked),
    isPaid: Boolean(record.isPaid),
    priceInr: record.priceInr || 4,
    listedInMarketplace: Boolean(record.listedInMarketplace),
    answerSetAcceptedAt: record.answerSetAcceptedAt || null,
    providerName: record.providerName || "",
    providerModel: record.providerModel || "",
    generationStartedAt: record.generationStartedAt,
    generationCompletedAt: record.generationCompletedAt,
    answerItems: (record.answerItems || []).map((item) => ({
      questionId: item.questionId?.toString?.() || item.questionId,
      order: item.order,
      questionText: item.questionText,
      answerText: item.answerText,
      answerSummary: item.answerSummary,
      inferredQuestionType: item.inferredQuestionType,
      figureRequired: item.figureRequired,
      figureType: item.figureType,
      figureInstructions: item.figureInstructions,
      figureMetadata: item.figureMetadata,
      estimatedPageWeight: item.estimatedPageWeight,
      userEdited: item.userEdited,
    })),
    questionIds: (record.questionIds || []).map((id) => id.toString()),
    generationSummary: record.generationSummary || {},
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const answerGenerationService = {
  async generateAnswers({ documentId, userId, prompt, questionIds, forceRegenerate = false }) {
    const document = await UploadedDocument.findOne({
      _id: documentId,
      userId,
      status: { $ne: "archived" },
    });

    if (!document) {
      throw new ApiError(404, "Uploaded document not found.");
    }

    const questionQuery = {
      documentId,
      userId,
      selectedForGeneration: true,
    };

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      questionQuery._id = { $in: questionIds };
    }

    const questions = await ParsedQuestion.find(questionQuery).sort({ createdAt: 1 });
    if (!questions.length) {
      throw new ApiError(400, "Please select at least one detected question for answer generation.");
    }

    if (questions.length > 50) {
      throw new ApiError(413, "Please generate answers for 50 questions or fewer at a time.");
    }

    if (!forceRegenerate) {
      const existing = await GeneratedPdf.findOne({
        sourceDocumentId: documentId,
        userId,
        generationStatus: { $in: ["pending", "processing"] },
      });

      if (existing) {
        throw new ApiError(409, "Answer generation is already in progress for this document.");
      }
    }

    const context = answerPromptService.buildGenerationContext({
      document,
      questions,
      prompt,
    });

    let generationRecord = await GeneratedPdf.findOne({
      sourceDocumentId: documentId,
      userId,
    }).sort({ createdAt: -1 });

    if (!generationRecord || forceRegenerate) {
      generationRecord = new GeneratedPdf({
        userId,
        sourceDocumentId: documentId,
        sourceDocumentIds: [documentId],
        questionIds: questions.map((question) => question._id),
        title: `${document.documentTitle || document.originalName} - Answer Draft`,
      });
    }

    generationRecord.generationPrompt = prompt?.trim() || "";
    generationRecord.questionIds = questions.map((question) => question._id);
    generationRecord.generationStatus = "processing";
    generationRecord.failureReason = "";
    generationRecord.generationStartedAt = new Date();
    generationRecord.providerName = "abstracted-ai";
    generationRecord.providerModel = "answer-generation-phase-8";
    await generationRecord.save();

    try {
      const answerItems = [];

      for (const [index, question] of questions.entries()) {
        const providerOutput = await answerGenerationProvider.generateForQuestion({
          question,
          context,
        });

        const normalized = answerNormalizationService.normalize(
          question,
          providerOutput.answerText,
          prompt,
        );
        const figurePlan = figurePlanningService.plan(question);

        answerItems.push({
          questionId: question._id,
          order: index + 1,
          questionText: normalized.questionText,
          answerText: normalized.answerText,
          answerSummary: normalized.answerSummary,
          inferredQuestionType: normalized.inferredQuestionType,
          estimatedPageWeight: normalized.estimatedPageWeight,
          userEdited: false,
          ...figurePlan,
        });
      }

      generationRecord.answerItems = answerItems;
      generationRecord.generationStatus = "completed";
      generationRecord.generationCompletedAt = new Date();
      generationRecord.generationSummary = {
        totalAnswers: answerItems.length,
        figurePlannedCount: answerItems.filter((item) => item.figureRequired).length,
        estimatedPageWeight: answerItems.reduce((sum, item) => sum + (item.estimatedPageWeight || 1), 0),
      };
      await generationRecord.save();

      return serializeGeneration(generationRecord);
    } catch (error) {
      generationRecord.generationStatus = "failed";
      generationRecord.failureReason = error.message || "Answer generation failed.";
      await generationRecord.save();
      throw error;
    }
  },

  async listGenerations(userId) {
    const generations = await GeneratedPdf.find({ userId }).sort({ createdAt: -1 });
    return generations.map(serializeGeneration);
  },

  async getGeneration(userId, generationId) {
    const generation = await GeneratedPdf.findOne({ _id: generationId, userId });

    if (!generation) {
      throw new ApiError(404, "Generated answer set not found.");
    }

    return serializeGeneration(generation);
  },

  async getLatestGenerationForDocument(userId, documentId) {
    const generation = await GeneratedPdf.findOne({
      sourceDocumentId: documentId,
      userId,
    }).sort({ createdAt: -1 });

    if (!generation) {
      return null;
    }

    return serializeGeneration(generation);
  },

  async updateAnswerItems(userId, generationId, answerItems) {
    const generation = await GeneratedPdf.findOne({ _id: generationId, userId });
    if (!generation) {
      throw new ApiError(404, "Generated answer set not found.");
    }

    generation.answerItems = generation.answerItems.map((item) => {
      const update = answerItems.find(
        (candidate) => String(candidate.questionId) === String(item.questionId),
      );

      if (!update) {
        return item;
      }

      return {
        ...item.toObject(),
        order: update.order ?? item.order,
        answerText: update.answerText ?? item.answerText,
        userEdited: typeof update.answerText === "string" ? true : item.userEdited,
      };
    });

    await generation.save();
    return serializeGeneration(generation);
  },
};
