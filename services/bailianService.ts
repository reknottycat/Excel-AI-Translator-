/**
 * Service for calling the Alibaba Cloud Bailian (Dashscope) Application API.
 * This is based on the Application API flow, which requires an App ID.
 * Docs: https://help.aliyun.com/zh/model-studio/developer-reference/api-details-9
 */

// Credentials should be set as environment variables for security.
// BAILIAN_API_KEY: Your Alibaba Cloud API Key (e.g., sk-xxxxxxxx)
// BAILIAN_APP_ID: Your Application ID from the Bailian console.

export const getBailianTranslations = async (texts: string[], targetLanguage: string): Promise<string[]> => {
    if (texts.length === 0) {
        return [];
    }
    
    if (!process.env.BAILIAN_API_KEY || !process.env.BAILIAN_APP_ID) {
        throw new Error("Alibaba Bailian API credentials are not configured. Cannot proceed with translation. Please contact the administrator.");
    }

    const BAILIAN_API_ENDPOINT = `https://dashscope.aliyuncs.com/api/v1/apps/${process.env.BAILIAN_APP_ID}/completion`;
    
    // Construct a prompt that instructs the model to return a JSON array.
    const prompt = `
        Translate the following JSON array of text strings into ${targetLanguage}. The source language will be detected automatically.
        Return ONLY a valid JSON array of strings with the exact same number of elements and in the same order.
        Do not add any text or explanation before or after the JSON array.
        If a string does not need translation (e.g., it's a number, a formula-like string, or already in the target language), return it as is.
        
        Example Input for Russian:
        ["Hello world", "技术规格", "100", "DN50"]

        Example Response for Russian:
        ["Привет, мир", "Технические характеристики", "100", "DN50"]

        Texts to translate:
        ${JSON.stringify(texts)}
    `;

    // The request body for the Application API.
    const requestBody = {
        prompt: prompt,
        // 'stream: false' is the default, so it's not strictly necessary.
    };

    try {
        const response = await fetch(BAILIAN_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.BAILIAN_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Alibaba Bailian API request failed with status ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();

        // The response text is located in 'output.text' for the Application API.
        const jsonString = responseData.output?.text;

        if (!jsonString) {
             throw new Error("Alibaba Bailian API response does not contain the expected 'output.text' field.");
        }
        
        // The model might return the JSON string wrapped in markdown backticks.
        // This is a robust way to handle it.
        const cleanedJsonString = jsonString.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');

        const translatedArray = JSON.parse(cleanedJsonString);

        if (!Array.isArray(translatedArray) || translatedArray.length !== texts.length) {
            throw new Error("Alibaba Bailian API response is not a valid array or has a different length than the input.");
        }

        return translatedArray;

    } catch (error)
    {
        console.error("Error calling Alibaba Bailian API:", error);
        if (error instanceof SyntaxError) {
             // This error happens if JSON.parse fails
             throw new Error(`Failed to parse JSON response from Alibaba Bailian API. The model may have returned an invalid format.`);
        }
        // Re-throw other errors with a more user-friendly message
        throw new Error(`Failed to get translations from Alibaba Bailian API. Please check console for details.`);
    }
};