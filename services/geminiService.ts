import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are an expert translator. Your task is to translate a JSON array of text strings into a specified target language. The source language will be detected automatically.
- You MUST return a valid JSON array of strings.
- The output array MUST have the exact same number of elements as the input array.
- The order of the translated strings in the output array MUST correspond to the order of the source strings in the input array.
- If a string does not require translation (e.g., it is a number, code, a proper noun, or is already in the target language), return the original string in the corresponding position in the output array.
- Do not add any explanatory text, markdown, or any characters outside of the JSON array in your response.

Example for a target language of Russian:
Input: ["Hello world", "技术规格", "100", "DN50"]
Output: ["Привет, мир", "Технические характеристики", "100", "DN50"]
`;

export const getGeminiTranslations = async (texts: string[], targetLanguage: string): Promise<string[]> => {
    if (texts.length === 0) {
        return [];
    }

    const userPrompt = `
        Translate the following JSON array into ${targetLanguage}:
        ${JSON.stringify(texts)}
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const translatedArray = JSON.parse(jsonString);

        if (!Array.isArray(translatedArray) || translatedArray.length !== texts.length) {
            throw new Error("AI response is not a valid array or has a different length.");
        }

        return translatedArray;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error(`Failed to get translations from Gemini API for ${targetLanguage}.`);
    }
};