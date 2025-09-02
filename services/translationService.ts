
import { TranslationModel } from '../types';
import { getGeminiTranslations } from './geminiService';
import { getBailianTranslations } from './bailianService';

/**
 * Dispatches the translation request to the appropriate service based on the selected model.
 * @param texts - Array of texts to translate.
 * @param targetLanguage - The language to translate into.
 * @param model - The selected translation model (Gemini or Alibaba Bailian).
 * @returns A promise that resolves to an array of translated strings.
 */
export const getTranslations = async (
    texts: string[],
    targetLanguage: string,
    model: TranslationModel
): Promise<string[]> => {
    switch (model) {
        case TranslationModel.GEMINI:
            return getGeminiTranslations(texts, targetLanguage);
        case TranslationModel.BAILIAN:
            return getBailianTranslations(texts, targetLanguage);
        default:
            // This case should not be reachable if the UI is correctly implemented.
            console.error(`Unsupported translation model: ${model}`);
            throw new Error(`Unsupported translation model: ${model}`);
    }
};
