import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function normalizeDetectedQuestion(question, index = 0) {
  const questionText =
    question?.questionText ||
    question?.text ||
    question?.rawQuestionText ||
    "";

  const normalizedId =
    question?.id ||
    question?._id ||
    question?.questionId ||
    `detected-question-${index}`;

  const confidenceScore = Number(question?.confidenceScore);

  return {
    ...question,
    id: String(normalizedId),
    questionNumber: question?.questionNumber || question?.number || "",
    questionText: String(questionText).trim(),
    normalizedText: question?.normalizedText || String(questionText).trim().toLowerCase(),
    inferredUnit: question?.inferredUnit || question?.unit || "",
    inferredTopic: question?.inferredTopic || question?.topic || "",
    inferredModule: question?.inferredModule || question?.module || "",
    inferredQuestionType: question?.inferredQuestionType || question?.questionType || "general",
    importanceFlag: question?.importanceFlag || question?.importance || "normal",
    confidenceScore: Number.isFinite(confidenceScore) ? confidenceScore : 0,
    reviewStatus: question?.reviewStatus || question?.status || "pending",
    selectedForGeneration:
      typeof question?.selectedForGeneration === "boolean"
        ? question.selectedForGeneration
        : typeof question?.selected === "boolean"
          ? question.selected
          : typeof question?.isSelected === "boolean"
            ? question.isSelected
            : false,
    sourcePage: question?.sourcePage ?? null,
    sourceLineStart: question?.sourceLineStart ?? null,
    sourceLineEnd: question?.sourceLineEnd ?? null,
  };
}

function extractDetectedQuestionArray(response) {
  const data = response?.data ?? {};
  const questionCollections = [
    data.questions,
    data.detectedQuestions,
    data.items,
    data.results,
    data.document?.questions,
    data.document?.detectedQuestions,
    Array.isArray(data) ? data : null,
  ];

  const questions = questionCollections.find(Array.isArray) || [];

  return questions
    .filter(Boolean)
    .map((question, index) => normalizeDetectedQuestion(question, index))
    .filter((question) => Boolean(question.questionText));
}

function withNormalizedQuestions(response) {
  return {
    ...response,
    data: {
      ...(response?.data || {}),
      questions: extractDetectedQuestionArray(response),
    },
  };
}

export function detectQuestions(accessToken, documentId, payload) {
  return apiRequest(`/ai/documents/${documentId}/detect`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  }).then(withNormalizedQuestions);
}

export function listDetectedQuestions(accessToken, documentId) {
  return apiRequest(`/ai/documents/${documentId}/questions`, {
    headers: authHeaders(accessToken),
  }).then(withNormalizedQuestions);
}

export function updateQuestionSelections(accessToken, documentId, payload) {
  return apiRequest(`/ai/documents/${documentId}/questions/selection`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  }).then(withNormalizedQuestions);
}

export function resetDetectedQuestions(accessToken, documentId) {
  return apiRequest(`/ai/documents/${documentId}/questions`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
