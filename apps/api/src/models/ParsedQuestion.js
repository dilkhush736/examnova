import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const parsedQuestionSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "UploadedDocument", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sourceDocumentName: { type: String, default: "" },
    questionNumber: { type: String, trim: true },
    questionText: { type: String, required: true },
    rawQuestionText: { type: String, required: true },
    normalizedText: { type: String, required: true },
    inferredUnit: { type: String, default: "", index: true },
    inferredTopic: { type: String, default: "", index: true },
    inferredModule: { type: String, default: "" },
    inferredQuestionType: { type: String, default: "general", index: true },
    importanceFlag: { type: String, default: "normal", index: true },
    sourcePage: { type: Number },
    sourceLineStart: { type: Number },
    sourceLineEnd: { type: Number },
    confidenceScore: { type: Number, default: 0 },
    reviewStatus: { type: String, default: "pending", index: true },
    selectedForGeneration: { type: Boolean, default: false },
    detectionRunId: { type: String, default: "", index: true },
    filterPrompt: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.PARSED_QUESTIONS,
  },
);

parsedQuestionSchema.index({ userId: 1, documentId: 1, selectedForGeneration: 1 });
parsedQuestionSchema.index({ userId: 1, documentId: 1, normalizedText: 1 });

export const ParsedQuestion =
  mongoose.models.ParsedQuestion || mongoose.model("ParsedQuestion", parsedQuestionSchema);
