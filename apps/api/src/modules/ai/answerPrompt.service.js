export const answerPromptService = {
  buildGenerationContext({ document, questions, prompt }) {
    return {
      documentTitle: document.documentTitle || document.originalName,
      questionCount: questions.length,
      prompt: prompt?.trim() || "",
      styleGuide: {
        tone: "exam-focused",
        length: "compact",
        clarity: "high",
      },
    };
  },
};
