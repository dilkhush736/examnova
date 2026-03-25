function detectFigureNeed(questionText = "", questionType = "") {
  const normalized = `${questionText} ${questionType}`.toLowerCase();

  if (/diagram|draw|illustrate|block diagram/i.test(normalized)) {
    return {
      required: true,
      type: "block_diagram",
      instructions: "Create a compact labeled block diagram showing the main components referenced by the question.",
    };
  }

  if (/process|flow|steps|life cycle|workflow/i.test(normalized)) {
    return {
      required: true,
      type: "flow_diagram",
      instructions: "Create a compact flow diagram with 4 to 6 labeled steps in sequence.",
    };
  }

  if (/tree|graph|stack|queue|data structure|algorithm/i.test(normalized)) {
    return {
      required: true,
      type: "concept_sketch",
      instructions: "Create a minimal conceptual sketch that explains the structure or algorithm visually.",
    };
  }

  return {
    required: false,
    type: "",
    instructions: "",
  };
}

export const figurePlanningService = {
  plan(question) {
    const figurePlan = detectFigureNeed(question.questionText, question.inferredQuestionType);

    return {
      figureRequired: figurePlan.required,
      figureType: figurePlan.type,
      figureInstructions: figurePlan.instructions,
      figureMetadata: figurePlan.required
        ? {
            compact: true,
            placement: "inline",
          }
        : {},
    };
  },
};
