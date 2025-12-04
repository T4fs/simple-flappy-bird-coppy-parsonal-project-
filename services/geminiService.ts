
import { GoogleGenAI } from "@google/genai";
import { Skin } from "../types";

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

export const generateUniqueSkin = async (seed: number): Promise<Skin | null> => {
  try {
    const prompt = `
      Generate a valid JSON object representing a unique, "1-of-1" limited edition Flappy Bird skin.
      This skin is a reward for a high score of ${seed}.
      
      The JSON must follow this exact structure (do not include markdown formatting):
      {
        "name": "string (Creative, legendary name)",
        "pattern": "solid" | "gradient" | "striped" | "dots" | "checkered",
        "bodyColor": "hex string",
        "secondaryColor": "hex string",
        "wingColor": "hex string",
        "eyeColor": "hex string",
        "beakColor": "hex string",
        "border": "hex string",
        "price": number (between 5000 and 20000)
      }
      
      Make the colors visually striking and harmonious. 
      The rarity should be implicitly treated as "unique".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    // Construct the full Skin object
    const newSkin: Skin = {
        id: `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: data.name,
        pattern: data.pattern,
        bodyColor: data.bodyColor,
        secondaryColor: data.secondaryColor,
        wingColor: data.wingColor,
        eyeColor: data.eyeColor,
        beakColor: data.beakColor,
        border: data.border,
        rarity: 'unique',
        price: data.price,
        isUnique: true
    };

    return newSkin;
  } catch (error) {
    console.error("Gemini Skin Gen Error:", error);
    return null;
  }
};
