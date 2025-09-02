
import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, TranslationEntry, MatchPolicy, Language, TranslationModel } from './types';
import FileUploader from './components/FileUploader';
import DictionaryManager from './components/DictionaryManager';
import FileTranslator from './components/FileTranslator';
import { extractTextsFromFiles } from './services/excelService';
import { LogoIcon, UploadIcon, DictionaryIcon, TranslateIcon } from './constants';
import { LANGUAGES } from './constants/languages';
import { LanguageProvider, useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';

const AppContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [dictionary, setDictionary] = useState<TranslationEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES.find(l => l.name === 'Russian') || LANGUAGES[0]);
  const [translationModel, setTranslationModel] = useState<TranslationModel>(TranslationModel.GEMINI);
  const [translateFormulas, setTranslateFormulas] = useState<boolean>(false);
  const [preserveRichTextFormatting, setPreserveRichTextFormatting] = useState<boolean>(true);
  const [extractFromShapes, setExtractFromShapes] = useState<boolean>(true);
  const [processVisibleSheetsOnly, setProcessVisibleSheetsOnly] = useState<boolean>(true);
  
  const { t, language, dir } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const handleFilesUploaded = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setUploadedFiles(files);
    try {
      const texts = await extractTextsFromFiles(files, translateFormulas, preserveRichTextFormatting, extractFromShapes, processVisibleSheetsOnly);
      const uniqueTexts = Array.from(new Set(texts)).sort();
      setExtractedTexts(uniqueTexts);
      setDictionary(uniqueTexts.map((text, index) => ({
        id: `${Date.now()}-${index}`,
        source: text,
        target: '',
        policy: MatchPolicy.FLEXIBLE,
      })));
      setCurrentStep(AppStep.DICTIONARY);
    } catch (e) {
      setError('Failed to extract text from files. Please check the file format and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [translateFormulas, preserveRichTextFormatting, extractFromShapes, processVisibleSheetsOnly]);

  const handleDictionaryUpdated = (newDictionary: TranslationEntry[]) => {
    setDictionary(newDictionary);
  };

  const handleProceedToTranslate = () => {
    setCurrentStep(AppStep.TRANSLATE);
  };
  
  const handleReset = () => {
      setCurrentStep(AppStep.UPLOAD);
      setUploadedFiles([]);
      setExtractedTexts([]);
      setDictionary([]);
      setError(null);
      setTargetLanguage(LANGUAGES.find(l => l.name === 'Russian') || LANGUAGES[0]);
      setTranslationModel(TranslationModel.GEMINI);
      setTranslateFormulas(false);
      setPreserveRichTextFormatting(true);
      setExtractFromShapes(true);
      setProcessVisibleSheetsOnly(true);
  }
  
  const handleTargetLanguageChange = (languageName: string) => {
    const lang = LANGUAGES.find(l => l.name === languageName);
    if (lang) {
        setTargetLanguage(lang);
    }
  };

  const handleTranslationModelChange = (model: TranslationModel) => {
    setTranslationModel(model);
  };

  const handleTranslateFormulasChange = (enabled: boolean) => {
    setTranslateFormulas(enabled);
  };

  const handlePreserveRichTextFormattingChange = (enabled: boolean) => {
    setPreserveRichTextFormatting(enabled);
  };

  const handleExtractFromShapesChange = (enabled: boolean) => {
    setExtractFromShapes(enabled);
  };

  const handleProcessVisibleSheetsOnlyChange = (enabled: boolean) => {
    setProcessVisibleSheetsOnly(enabled);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case AppStep.UPLOAD:
        return (
            <FileUploader 
                onFilesUploaded={handleFilesUploaded} 
                isLoading={isLoading}
                translateFormulas={translateFormulas}
                onTranslateFormulasChange={handleTranslateFormulasChange}
                preserveRichTextFormatting={preserveRichTextFormatting}
                onPreserveRichTextFormattingChange={handlePreserveRichTextFormattingChange}
                extractFromShapes={extractFromShapes}
                onExtractFromShapesChange={handleExtractFromShapesChange}
                processVisibleSheetsOnly={processVisibleSheetsOnly}
                onProcessVisibleSheetsOnlyChange={handleProcessVisibleSheetsOnlyChange}
            />
        );
      case AppStep.DICTIONARY:
        return (
          <DictionaryManager
            initialDictionary={dictionary}
            onDictionaryUpdate={handleDictionaryUpdated}
            onProceed={handleProceedToTranslate}
            targetLanguage={targetLanguage}
            onTargetLanguageChange={handleTargetLanguageChange}
            translationModel={translationModel}
            onTranslationModelChange={handleTranslationModelChange}
          />
        );
      case AppStep.TRANSLATE:
        return <FileTranslator 
                    files={uploadedFiles} 
                    dictionary={dictionary} 
                    onReset={handleReset} 
                    languageCode={targetLanguage.code}
                    preserveRichTextFormatting={preserveRichTextFormatting}
                />;
      default:
        return <FileUploader 
                    onFilesUploaded={handleFilesUploaded} 
                    isLoading={isLoading} 
                    translateFormulas={translateFormulas} 
                    onTranslateFormulasChange={handleTranslateFormulasChange} 
                    preserveRichTextFormatting={preserveRichTextFormatting}
                    onPreserveRichTextFormattingChange={handlePreserveRichTextFormattingChange}
                    extractFromShapes={extractFromShapes}
                    onExtractFromShapesChange={handleExtractFromShapesChange}
                    processVisibleSheetsOnly={processVisibleSheetsOnly}
                    onProcessVisibleSheetsOnlyChange={handleProcessVisibleSheetsOnlyChange}
                />;
    }
  };

  const Step = ({ step, icon, label, isActive }: { step: AppStep, icon: React.ReactNode, label: string, isActive: boolean }) => (
    <div className={`flex items-center space-x-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('step')} {step}</p>
            <p className={`font-semibold ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{label}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
                <LogoIcon className="h-10 w-10 text-indigo-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {t('headerTitle')}
                </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {currentStep !== AppStep.UPLOAD && (
                  <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                  >
                      {t('startOver')}
                  </button>
              )}
            </div>
        </header>

        <div className="mb-10 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="flex justify-between items-center">
                <Step step={AppStep.UPLOAD} icon={<UploadIcon />} label={t('step1Label')} isActive={currentStep === AppStep.UPLOAD} />
                <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-4"></div>
                <Step step={AppStep.DICTIONARY} icon={<DictionaryIcon />} label={t('step2Label')} isActive={currentStep === AppStep.DICTIONARY} />
                 <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-4"></div>
                <Step step={AppStep.TRANSLATE} icon={<TranslateIcon />} label={t('step3Label')} isActive={currentStep === AppStep.TRANSLATE} />
            </div>
        </div>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">{t('errorTitle')}</p>
                <p>{error}</p>
            </div>
        )}

        <main>
            {renderStepContent()}
        </main>

         <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
            <p>{t('footerText')}</p>
            <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-200 max-w-3xl mx-auto leading-relaxed">
                <b>{t('goodNews')}</b> <span dangerouslySetInnerHTML={{ __html: t('goodNewsText') }} />
            </div>
        </footer>
      </div>
    </div>
  );
};


const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);


export default App;
