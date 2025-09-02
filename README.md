# Excel AI Translator

An AI-powered web application designed to translate text within Excel files (.xlsx, .xls, .xlsm) while preserving the original formatting. This tool streamlines the localization process for complex spreadsheets by leveraging powerful AI models like Google's Gemini and Alibaba's Bailian.

The user interface is available in English, Chinese, Russian, and Arabic.

![Excel AI Translator Screenshot](https://storage.googleapis.com/aifile-public-1/excel_translator_screenshot.png)

## ✨ Features

- **File Upload:** Supports uploading multiple Excel files simultaneously via drag-and-drop or a file selector.
- **Advanced Text Extraction:** Extracts text not only from cells but also from:
    - Shapes and Text Boxes
    - Chart Titles and Labels
    - Text embedded within formulas
- **AI-Powered Dictionary:** Automatically generates a translation dictionary using your choice of AI model (Google Gemini or Alibaba Bailian).
- **Interactive Dictionary Management:** Allows users to review, edit, and fine-tune the AI-generated translations before applying them.
- **Formatting Preservation:** Keeps most of the original file's formatting intact, including:
    - Cell styles (colors, borders, alignment)
    - Font styles (bold, italics, size, color)
    - Embedded images
- **Batch Processing:** Translates all uploaded files based on the finalized dictionary.
- **Easy Download:** Provides options to download translated files individually or as a single `.zip` archive.
- **Multi-language Interface:** The application UI supports English, Chinese, Russian, and Arabic, with right-to-left (RTL) support for Arabic.

---

## 🚀 How to Use

The translation process is broken down into three simple steps:

### Step 1: Upload Files

1.  **Drag and Drop** your Excel files onto the upload area or click to select them from your computer.
2.  **Configure Extraction Options** before uploading:
    - **Extract from shapes & charts:** Finds text in text boxes, shapes, and charts. _(Note: This text is extracted for translation but cannot be automatically replaced back into the shapes due to library limitations. You must manually copy-paste these translations)._
    - **Process visible sheets only:** Ignores any hidden sheets in your files.
    - **Translate text in formulas:** (Experimental) Translates text strings found inside formulas (e.g., `IF(A1="Hello", ...)`).
    - **Preserve rich text format:** Maintains formatting like bold or colors within a single cell. Disabling this can sometimes improve translation accuracy for sentences with mixed formatting.

### Step 2: Manage Dictionary

1.  **Select AI Model and Target Language:** Choose your preferred translation model and the language you want to translate to.
2.  **Generate Translations:** Click the "Translate with AI" button. The application will send all the extracted source texts to the selected AI model.
3.  **Review and Edit:** The table will populate with the source texts and their AI-generated translations. You can click the edit icon on any row to modify the target text or change the **Match Policy**:
    - **Flexible:** Replaces the source text even if it's part of a larger sentence in a cell.
    - **Exact:** Only replaces the text if the entire cell content is an exact match.
4.  Once you are satisfied with the dictionary, click **Proceed**.

### Step 3: Translate & Download

- The application will automatically translate your original files using the dictionary you just finalized.
- Once complete, a list of translated files will appear.
- You can **Download** each file individually or click **Download All as .zip** to get an archive of all the files.

---

## 🔧 Setup and Configuration (For Developers)

To run this application, you must configure API keys for the AI services. **Do not hardcode keys in the source code.** This project is set up to read credentials from environment variables.

### Environment Variables

1.  Create a file named `.env` in the root directory of the project.
2.  Add the following variables to the `.env` file:

    ```bash
    # For Google Gemini API
    # Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
    API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

    # For Alibaba Cloud Bailian (Dashscope) API
    # Get your key from the Dashscope console: https://dashscope.console.aliyun.com/
    BAILIAN_API_KEY="sk-YOUR_BAILIAN_API_KEY"
    BAILIAN_APP_ID="YOUR_BAILIAN_APPLICATION_ID"
    ```

3.  Replace the placeholder values with your actual keys and App ID.

The application code in `services/geminiService.ts` and `services/bailianService.ts` will automatically use these environment variables.

### Running the App

Once the `.env` file is configured, you can run the application using your standard development server. The `index.html` file is the entry point.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Excel Processing:** [ExcelJS](https://github.com/exceljs/exceljs)
- **File Archiving:** [JSZip](https://stuk.github.io/jszip/)
- **AI Models:**
    - [Google Gemini API](https://ai.google.dev/)
    - [Alibaba Bailian (Dashscope) API](https://help.aliyun.com/zh/model-studio/developer-reference/api-details-9)
