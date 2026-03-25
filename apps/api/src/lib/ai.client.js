export function createAiClient() {
  return {
    async generate(payload) {
      console.log("AI client placeholder", payload);
      return { text: "", figures: [] };
    },
  };
}
