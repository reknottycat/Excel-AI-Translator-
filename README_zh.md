<a href="https://aistudio.google.com/new" target="_blank">
  <img src="https://st-studio.gu-web.com/static/img/run-in-aistudio-button.svg" alt="在 AI Studio 中运行" />
</a>

[English](./README.md) | [中文](./README_zh.md)

# Excel AI 翻译器

一个由 AI 驱动的 Web 应用程序，旨在翻译 Excel 文件（.xlsx, .xls, .xlsm）中的文本，同时保留原始格式。该工具通过利用谷歌的 Gemini 和阿里巴巴的百炼等强大的人工智能模型，简化了复杂电子表格的本地化流程。

用户界面支持英语、中文、俄语和阿拉伯语。

![Excel AI Translator Screenshot](https://storage.googleapis.com/aifile-public-1/excel_translator_screenshot.png)

## ✨ 功能特性

- **文件上传:** 支持通过拖放或文件选择器同时上传多个 Excel 文件。
- **高级文本提取:** 不仅从单元格中提取文本，还支持从以下位置提取：
    - 形状和文本框
    - 图表标题和标签
    - 嵌入在公式中的文本
- **AI 驱动的词典:** 使用您选择的 AI 模型（Google Gemini 或阿里巴巴百炼）自动生成翻译词典。
- **交互式词典管理:** 允许用户在应用翻译之前审查、编辑和微调 AI 生成的翻译。
- **格式保留:** 保持原始文件的大部分格式不变，包括：
    - 单元格样式（颜色、边框、对齐方式）
    - 字体样式（粗体、斜体、大小、颜色）
    - 嵌入的图片
- **批量处理:** 根据最终确定的词典翻译所有上传的文件。
- **便捷下载:** 提供单独下载翻译文件或将所有文件打包为单个 `.zip` 压缩文件的选项。
- **多语言界面:** 应用程序 UI 支持英语、中文、俄语和阿拉伯语，并为阿拉伯语提供从右到左（RTL）的支持。

---

## 🚀 如何使用

翻译过程分为三个简单步骤：

### 第 1 步：上传文件

1.  **拖放**您的 Excel 文件到上传区域，或单击从您的计算机中选择它们。
2.  在上传前**配置提取选项**：
    - **从形状和图表中提取:** 查找文本框、形状和图表中的文本。_（注意：提取此文本是为了翻译，但由于库的限制，无法自动替换回形状中。您必须手动复制粘贴这些翻译）。_
    - **仅处理可见工作表:** 忽略文件中的任何隐藏工作表。
    - **翻译公式中的文本:** (实验性) 翻译在公式字符串中找到的文本字符串（例如 `IF(A1="Hello", ...)`）。
    - **保留富文本格式:** 在单个单元格内保持粗体或颜色等格式。禁用此选项有时可以提高混合格式句子的翻译准确性。

### 第 2 步：管理词典

1.  **选择 AI 模型和目标语言:** 选择您偏好的翻译模型和您想要翻译成的语言。
2.  **生成翻译:** 点击“使用 AI 翻译”按钮。应用程序会将所有提取的源文本发送到选定的 AI 模型。
3.  **审查和编辑:** 表格将填充源文本及其 AI 生成的翻译。您可以点击任何行上的编辑图标来修改目标文本或更改**匹配策略**：
    - **灵活:** 即使源文本是单元格中更长句子的一部分，也会替换它。
    - **精确:** 仅当整个单元格内容完全匹配时才替换文本。
4.  当您对词典满意后，点击**继续**。

### 第 3 步：翻译与下载

- 应用程序将使用您刚刚最终确定的词典自动翻译您的原始文件。
- 完成后，将出现一个翻译文件的列表。
- 您可以单独**下载**每个文件，或点击**全部下载为 .zip** 以获取包含所有文件的压缩包。

---

## 🔧 设置与配置 (针对开发者)

要运行此应用程序，您必须为 AI 服务配置 API 密钥。**不要在源代码中硬编码密钥。** 本项目设置为从环境变量中读取凭据。

### 环境变量

1.  在项目的根目录中创建一个名为 `.env` 的文件。
2.  将以下变量添加到 `.env` 文件中：

    ```bash
    # 适用于 Google Gemini API
    # 从 Google AI Studio 获取您的密钥: https://aistudio.google.com/app/apikey
    API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

    # 适用于阿里云百炼 (Dashscope) API
    # 从 Dashscope 控制台获取您的密钥: https://dashscope.console.aliyun.com/
    BAILIAN_API_KEY="sk-YOUR_BAILIAN_API_KEY"
    BAILIAN_APP_ID="YOUR_BAILIAN_APPLICATION_ID"
    ```

3.  将占位符值替换为您的实际密钥和应用 ID。

`services/geminiService.ts` 和 `services/bailianService.ts` 中的应用程序代码将自动使用这些环境变量。

### 运行应用

配置好 `.env` 文件后，您可以使用标准的开发服务器来运行该应用程序。`index.html` 文件是入口点。

---

## 🛠️ 技术栈

- **前端:** React, TypeScript, Tailwind CSS
- **Excel 处理:** [ExcelJS](https://github.com/exceljs/exceljs)
- **文件压缩:** [JSZip](https://stuk.github.io/jszip/)
- **AI 模型:**
    - [Google Gemini API](https://ai.google.dev/)
    - [阿里巴巴百炼 (Dashscope) API](https://help.aliyun.com/zh/model-studio/developer-reference/api-details-9)
