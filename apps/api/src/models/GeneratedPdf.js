import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const generatedAnswerItemSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "ParsedQuestion", required: true },
    order: { type: Number, required: true },
    questionText: { type: String, required: true },
    answerText: { type: String, required: true },
    answerSummary: { type: String, default: "" },
    inferredQuestionType: { type: String, default: "general" },
    figureRequired: { type: Boolean, default: false },
    figureType: { type: String, default: "" },
    figureInstructions: { type: String, default: "" },
    figureMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    estimatedPageWeight: { type: Number, default: 1 },
    userEdited: { type: Boolean, default: false },
  },
  { _id: false },
);

const generatedPdfSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sourceDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "UploadedDocument" }],
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParsedQuestion" }],
    title: { type: String, required: true, trim: true },
    sourceDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "UploadedDocument", index: true },
    generationPrompt: { type: String, default: "" },
    answerItems: { type: [generatedAnswerItemSchema], default: [] },
    generationStatus: { type: String, default: "pending", index: true },
    failureReason: { type: String, default: "" },
    providerName: { type: String, default: "" },
    providerModel: { type: String, default: "" },
    generationStartedAt: { type: Date },
    generationCompletedAt: { type: Date },
    acceptedAt: { type: Date },
    status: { type: String, default: "draft", index: true },
    storageKey: { type: String },
    storageUrl: { type: String },
    pageCount: { type: Number, default: 0 },
    layoutVersion: { type: String, default: "v1" },
    generationSummary: { type: mongoose.Schema.Types.Mixed, default: {} },
    pdfGenerationStatus: { type: String, default: "idle", index: true },
    pdfFailureReason: { type: String, default: "" },
    pdfGenerationStartedAt: { type: Date },
    pdfGeneratedAt: { type: Date },
    pdfFileName: { type: String, default: "" },
    pdfSlug: { type: String, default: "", index: true },
    pdfDownloadName: { type: String, default: "" },
    renderVersion: { type: String, default: "compact-v1" },
    answerSetAcceptedAt: { type: Date },
    downloadUnlocked: { type: Boolean, default: false },
    listedInMarketplace: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    priceInr: { type: Number, default: 4 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.GENERATED_PDFS,
  },
);

generatedPdfSchema.index({ userId: 1, sourceDocumentId: 1, createdAt: -1 });
generatedPdfSchema.index({ userId: 1, generationStatus: 1 });
generatedPdfSchema.index({ userId: 1, pdfGenerationStatus: 1 });

export const GeneratedPdf =
  mongoose.models.GeneratedPdf || mongoose.model("GeneratedPdf", generatedPdfSchema);
