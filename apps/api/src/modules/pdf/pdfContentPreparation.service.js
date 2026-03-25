import { slugify } from "../../utils/slugify.js";

function normalizeText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function splitParagraphs(answerText) {
  return String(answerText || "")
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function estimateFigureHeight(item) {
  if (!item.figureRequired) {
    return 0;
  }

  const type = item.figureType || item.figureMetadata?.type || "concept";
  if (type.includes("flow")) {
    return 54;
  }
  if (type.includes("block")) {
    return 44;
  }
  return 36;
}

export const pdfContentPreparationService = {
  prepare(generation) {
    const answerItems = [...(generation.answerItems || [])]
      .sort((left, right) => (left.order || 0) - (right.order || 0))
      .map((item, index) => {
        const normalizedQuestion = normalizeText(item.questionText);
        const normalizedAnswer = String(item.answerText || "").trim();

        return {
          questionId: item.questionId?.toString?.() || String(item.questionId),
          order: item.order || index + 1,
          questionText: normalizedQuestion,
          answerText: normalizedAnswer,
          questionLine: `${item.order || index + 1}. ${normalizedQuestion}`,
          answerParagraphs: splitParagraphs(normalizedAnswer),
          inferredQuestionType: item.inferredQuestionType || "general",
          figureRequired: Boolean(item.figureRequired),
          figureType: item.figureType || item.figureMetadata?.type || "",
          figureInstructions: item.figureInstructions || "",
          figureMetadata: item.figureMetadata || {},
          estimatedPageWeight: item.estimatedPageWeight || 1,
          figureHeight: estimateFigureHeight(item),
        };
      });

    const titleBase = generation.title || "Exam Answer Draft";
    const title = titleBase.replace(/\s+/g, " ").trim();

    return {
      title,
      slug: slugify(title),
      layoutVersion: "compact-v1",
      blocks: answerItems,
      stats: {
        totalQuestions: answerItems.length,
        figureCount: answerItems.filter((item) => item.figureRequired).length,
        estimatedWeight: answerItems.reduce(
          (sum, item) => sum + (item.estimatedPageWeight || 1),
          0,
        ),
      },
    };
  },
};
