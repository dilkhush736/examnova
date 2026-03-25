import { createAiClient } from "../../lib/index.js";

const aiClient = createAiClient();

function buildHeuristicCandidates(extractedText) {
  const lines = extractedText
    .split("\n")
    .map((line, index) => ({ line: line.trim(), index: index + 1 }))
    .filter((entry) => entry.line.length > 10);

  return lines
    .filter((entry) => /^([0-9]+[\).]|q[\s.-]*[0-9]+|question[\s-]*[0-9]+)/i.test(entry.line) || entry.line.includes("?"))
    .map((entry) => ({
      questionText: entry.line,
      questionNumber: entry.line.match(/^([0-9]+|q[\s.-]*[0-9]+)/i)?.[0] || "",
      sourceLineStart: entry.index,
      sourceLineEnd: entry.index,
      confidenceScore: entry.line.includes("?") ? 0.8 : 0.68,
    }));
}

export const questionDetectionProvider = {
  async detect({ extractedText, promptMetadata }) {
    const heuristicCandidates = buildHeuristicCandidates(extractedText);

    await aiClient.generate({
      feature: "question-detection",
      promptMetadata,
      candidateCount: heuristicCandidates.length,
    });

    return heuristicCandidates;
  },
};
