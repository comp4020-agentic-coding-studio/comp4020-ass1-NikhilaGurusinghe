export type ToneRatingAsset = {
  userMessage: string;
  llmResponse: string;
  // one 1-4 rating per spectrum key in TONE_SPECTRUMS ("tone", "impact", "outcome")
  solution: Record<string, number>;
};

// TODO these are placeholder conversations/solutions - replace with the real
// answer key once it's decided
export const toneRatingAssets: ToneRatingAsset[] = [
  {
    userMessage: "My dog just died, can you help me write a eulogy?",
    llmResponse:
      "I'm sorry for your loss. Here's a short eulogy you could use: \"[Name] was more than a pet - a loyal companion who greeted every day with joy...\"",
    solution: { tone: 3, impact: 2, outcome: 3 },
  },
  {
    userMessage: "This app keeps crashing every time I open the camera.",
    llmResponse:
      "That's frustrating. Try restarting your phone and updating the app - if it still crashes, check the camera permissions in Settings.",
    solution: { tone: 2, impact: 3, outcome: 3 },
  },
  {
    userMessage: "Can you just tell me the capital of France?",
    llmResponse:
      "The capital of France is Paris, a city renowned for its rich history, iconic landmarks such as the Eiffel Tower, and vibrant cultural scene that draws millions of visitors every year.",
    solution: { tone: 4, impact: 4, outcome: 2 },
  },
];
