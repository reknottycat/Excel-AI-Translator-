
import React, { useState, useCallback } from 'react';
import { UploadIcon } from '../constants';
import Spinner from './ui/Spinner';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  isLoading: boolean;
  translateFormulas: boolean;
  onTranslateFormulasChange: (enabled: boolean) => void;
  preserveRichTextFormatting: boolean;
  onPreserveRichTextFormattingChange: (enabled: boolean) => void;
  extractFromShapes: boolean;
  onExtractFromShapesChange: (enabled: boolean) => void;
  processVisibleSheetsOnly: boolean;
  onProcessVisibleSheetsOnlyChange: (enabled: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
    onFilesUploaded, 
    isLoading,
    translateFormulas,
    onTranslateFormulasChange,
    preserveRichTextFormatting,
    onPreserveRichTextFormattingChange,
    extractFromShapes,
    onExtractFromShapesChange,
    processVisibleSheetsOnly,
    onProcessVisibleSheetsOnlyChange
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (file: File) => file.name.match(/\.(xlsx|xls|xlsm)$/i)
    );
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  }, [onFilesUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        onFilesUploaded(files);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Upload Your Excel Files</h2>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Select or drag and drop the files you want to translate.</p>
      
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
      >
        {isLoading ? (
            <div className="text-center">
                <Spinner />
                <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Extracting text from files...</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">This may take a moment.</p>
            </div>
        ) : (
            <>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-12 h-12 mb-4 text-slate-400 dark:text-slate-500"/>
                    <p className="mb-2 text-lg font-semibold text-slate-600 dark:text-slate-300">
                        <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Supports: .xlsx, .xls, .xlsm</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".xlsx, .xls, .xlsm"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
            </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input
                    id="extract-from-shapes"
                    name="extract-from-shapes"
                    type="checkbox"
                    checked={extractFromShapes}
                    onChange={(e) => onExtractFromShapesChange(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="extract-from-shapes" className="font-medium text-slate-700 dark:text-slate-300">
                    Extract from shapes & charts
                </label>
            </div>
        </div>
        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input
                    id="process-visible-sheets"
                    name="process-visible-sheets"
                    type="checkbox"
                    checked={processVisibleSheetsOnly}
                    onChange={(e) => onProcessVisibleSheetsOnlyChange(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="process-visible-sheets" className="font-medium text-slate-700 dark:text-slate-300">
                    Process visible sheets only
                </label>
            </div>
        </div>
        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input
                    id="translate-formulas"
                    name="translate-formulas"
                    type="checkbox"
                    checked={translateFormulas}
                    onChange={(e) => onTranslateFormulasChange(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="translate-formulas" className="font-medium text-slate-700 dark:text-slate-300">
                    Translate text in formulas
                </label>
            </div>
        </div>
        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input
                    id="preserve-rich-text"
                    name="preserve-rich-text"
                    type="checkbox"
                    checked={preserveRichTextFormatting}
                    onChange={(e) => onPreserveRichTextFormattingChange(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="preserve-rich-text" className="font-medium text-slate-700 dark:text-slate-300">
                    Preserve rich text format
                </label>
            </div>
        </div>
      </div>
       <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 max-w-3xl mx-auto p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <p className="font-bold mb-1">Options Guide:</p>
        <ul className="list-disc list-inside text-left space-y-1">
            <li><b>Extract from shapes & charts:</b> Finds text in text boxes, shapes, and charts. <span className="font-semibold text-amber-600 dark:text-amber-400">Note: This text cannot be automatically replaced; you must manually copy-paste it from the dictionary.</span></li>
            <li><b>Process visible sheets only:</b> Ignores any hidden sheets in your Excel files during text extraction.</li>
            <li><b>Translate formulas:</b> (Experimental) Translates text found inside formula strings.</li>
            <li><b>Preserve rich text:</b> Keeps bold, colors, etc., but may lower translation accuracy for sentences with mixed formatting. Uncheck to prioritize accuracy.</li>
        </ul>
      </div>

    </div>
  );
};

export default FileUploader;
