import { createAiClient } from "../../lib/index.js";

const aiClient = createAiClient();

export const answerGenerationProvider = {
  async generateForQuestion({ question, context }) {
    const response = await aiClient.generate({
      feature: "answer-generation",
      question: question.questionText,
      questionType: question.inferredQuestionType,
      context,
    });

    return {
      answerText: response?.text || "",
      providerMetadata: response?.metadata || {},
    };
  },
};
