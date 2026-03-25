function extractUnit(prompt) {
  const match = prompt.match(/unit\s*(\d+)/i);
  return match ? `Unit ${match[1]}` : "";
}

function detectQuestionType(prompt) {
  if (/long/i.test(prompt)) {
    return "long";
  }
  if (/short/i.test(prompt)) {
    return "short";
  }
  if (/definition/i.test(prompt)) {
    return "definition";
  }
  if (/problem|numerical/i.test(prompt)) {
    return "problem";
  }
  return "";
}

export const detectionPromptService = {
  interpret(prompt = "") {
    const normalizedPrompt = prompt.trim();
    return {
      originalPrompt: normalizedPrompt,
      importantOnly: /important/i.test(normalizedPrompt),
      desiredQuestionType: detectQuestionType(normalizedPrompt),
      unit: extractUnit(normalizedPrompt),
      selectedTopicKeywords: normalizedPrompt
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((token) => token.length > 3)
        .slice(0, 8),
    };
  },
};
