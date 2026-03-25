function buildCompactAnswer(question, prompt = "") {
  const normalizedQuestion = question.questionText.trim();
  const questionType = question.inferredQuestionType || "theory";

  if (questionType === "definition") {
    return `Definition: ${normalizedQuestion.replace(/^define\s+/i, "")}. In exam terms, explain the concept in one clear statement and add one practical point if relevant.`;
  }

  if (questionType === "short") {
    return `Answer: ${normalizedQuestion} can be addressed briefly by stating the core idea, one key characteristic, and one concise exam point.`;
  }

  if (questionType === "problem") {
    return `Approach: Start with the required formula or method, solve step by step in compact form, and end with the final result or interpretation.`;
  }

  const promptHint = prompt ? ` Focus on: ${prompt.trim()}.` : "";
  return `Introduction: State the concept directly. Main points: explain the core mechanism or theory in 3 to 5 compact points. Conclusion: end with a short exam-oriented summary.${promptHint}`;
}

export const answerNormalizationService = {
  normalize(question, generatedText, prompt) {
    const answerText = (generatedText || buildCompactAnswer(question, prompt)).trim();

    return {
      questionId: question._id,
      questionText: question.questionText,
      inferredQuestionType: question.inferredQuestionType || "general",
      answerText,
      answerSummary: answerText.slice(0, 180),
      estimatedPageWeight: Math.max(1, Math.ceil(answerText.length / 800)),
      userEdited: false,
    };
  },
};
