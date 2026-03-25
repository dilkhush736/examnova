function normalizeQuestionText(value = "") {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[0-9]+[\).\s-]*/, "")
    .trim();
}

function inferQuestionType(questionText) {
  const normalized = questionText.toLowerCase();
  if (normalized.length > 180) {
    return "long";
  }
  if (normalized.startsWith("define") || normalized.includes("what is")) {
    return "definition";
  }
  if (normalized.includes("calculate") || normalized.includes("solve")) {
    return "problem";
  }
  if (normalized.length < 90) {
    return "short";
  }
  return "theory";
}

function inferImportance(questionText, promptMetadata) {
  if (promptMetadata.importantOnly || /important|frequent|viva/i.test(questionText)) {
    return "high";
  }
  return "normal";
}

export const questionNormalizationService = {
  normalize(candidate, promptMetadata, sourceDocument) {
    const normalizedText = normalizeQuestionText(candidate.questionText);

    return {
      sourceDocumentName: sourceDocument.originalName,
      questionNumber: candidate.questionNumber || "",
      questionText: normalizedText,
      rawQuestionText: candidate.questionText,
      normalizedText: normalizedText.toLowerCase(),
      inferredUnit: candidate.inferredUnit || promptMetadata.unit || "",
      inferredTopic: candidate.inferredTopic || "",
      inferredModule: candidate.inferredModule || "",
      inferredQuestionType: candidate.inferredQuestionType || inferQuestionType(normalizedText),
      importanceFlag: candidate.importanceFlag || inferImportance(normalizedText, promptMetadata),
      sourcePage: candidate.sourcePage || null,
      sourceLineStart: candidate.sourceLineStart || null,
      sourceLineEnd: candidate.sourceLineEnd || null,
      confidenceScore: candidate.confidenceScore ?? 0.72,
      reviewStatus: "pending",
      selectedForGeneration: true,
      filterPrompt: promptMetadata.originalPrompt || "",
    };
  },
};
