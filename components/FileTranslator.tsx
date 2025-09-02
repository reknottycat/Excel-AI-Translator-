import React, { useState, useEffect, useCallback } from 'react';
import { TranslationEntry, TranslatedFile } from '../types';
import { translateFile } from '../services/excelService';
import Spinner from './ui/Spinner';
import { DownloadIcon, CheckCircleIcon, DownloadAllIcon } from '../constants';

declare const JSZip: any;

interface FileTranslatorProps {
  files: File[];
  dictionary: TranslationEntry[];
  onReset: () => void;
  languageCode: string;
  preserveRichTextFormatting: boolean;
}

const FileTranslator: React.FC<FileTranslatorProps> = ({ files, dictionary, onReset, languageCode, preserveRichTextFormatting }) => {
  const [translatedFiles, setTranslatedFiles] = useState<TranslatedFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const processFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const results: TranslatedFile[] = [];
    try {
      for (const file of files) {
        setCurrentFile(file.name);
        const translated = await translateFile(file, dictionary, preserveRichTextFormatting);
        results.push(translated);
      }
      setTranslatedFiles(results);
    } catch (e) {
      console.error(e);
      setError('An error occurred during translation. Some files may not have been processed.');
    } finally {
      setIsLoading(false);
      setCurrentFile('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, dictionary, preserveRichTextFormatting]);

  useEffect(() => {
    processFiles();
  }, [processFiles]);

  const handleDownload = (file: TranslatedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `[${languageCode.toUpperCase()}] ${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (translatedFiles.length < 2) return;
    setIsZipping(true);
    setError(null);

    const zip = new JSZip();
    translatedFiles.forEach(file => {
      zip.file(`[${languageCode.toUpperCase()}] ${file.name}`, file.blob);
    });

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Translated_Files_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to create zip file", e);
      setError("An error occurred while creating the zip file.");
    } finally {
        setIsZipping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <Spinner />
        <h2 className="text-2xl font-bold mt-4">Translating Files...</h2>
        {currentFile && <p className="text-slate-600 dark:text-slate-300 mt-2">Processing: {currentFile}</p>}
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait, this might take a few moments.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Translation Complete!</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Your files have been successfully translated. Download them below.</p>
        </div>

        {translatedFiles.length > 1 && (
            <div className="mb-6 text-center">
                <button
                    onClick={handleDownloadAll}
                    disabled={isZipping}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-md disabled:bg-green-300 dark:disabled:bg-green-800"
                >
                    {isZipping ? <Spinner /> : <DownloadAllIcon className="w-6 h-6 mr-2" />}
                    {isZipping ? 'Zipping...' : 'Download All as .zip'}
                </button>
            </div>
        )}
      
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        <div className="space-y-4">
            {translatedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                <p className="font-medium text-slate-700 dark:text-slate-200 truncate pr-4">{`[${languageCode.toUpperCase()}] ${file.name}`}</p>
                <button
                onClick={() => handleDownload(file)}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download
                </button>
            </div>
            ))}
        </div>
        
        <div className="mt-8 text-center">
            <button
                onClick={onReset}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
                Translate More Files
            </button>
        </div>
    </div>
  );
};

export default FileTranslator;