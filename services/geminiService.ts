import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameOverMessage = async (score: number): Promise<string> => {
  try {
    const prompt = `
      The player just finished a game of Flappy Bird with a score of ${score}.
      Give them a witty, sarcastic, or encouraging one-sentence comment based on their performance.
      - If score < 5: Roast them gently about being terrible.
      - If score 5-20: Tell them they are average.
      - If score > 20: Praise them as a god.
      Keep it short, under 15 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Game Over! Try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Game Over! (AI is sleeping)";
  }
};
