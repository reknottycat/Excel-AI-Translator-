
import React, { useState, useCallback, useMemo } from 'react';
import { TranslationEntry, MatchPolicy, Language, TranslationModel } from '../types';
import { getTranslations } from '../services/translationService';
import Spinner from './ui/Spinner';
import { CheckIcon, EditIcon, SaveIcon, SparklesIcon } from '../constants';
import { LANGUAGES } from '../constants/languages';
import { useTranslation } from '../hooks/useTranslation';

interface DictionaryManagerProps {
  initialDictionary: TranslationEntry[];
  onDictionaryUpdate: (dictionary: TranslationEntry[]) => void;
  onProceed: () => void;
  targetLanguage: Language;
  onTargetLanguageChange: (languageName: string) => void;
  translationModel: TranslationModel;
  onTranslationModelChange: (model: TranslationModel) => void;
}

const DictionaryManager: React.FC<DictionaryManagerProps> = ({
  initialDictionary,
  onDictionaryUpdate,
  onProceed,
  targetLanguage,
  onTargetLanguageChange,
  translationModel,
  onTranslationModelChange
}) => {
  const [dictionary, setDictionary] = useState<TranslationEntry[]>(initialDictionary);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ target: string; policy: MatchPolicy } | null>(null);
  const { t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTargetLanguageChange(e.target.value);
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTranslationModelChange(e.target.value as TranslationModel);
  };

  const handleGenerateTranslations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sourceTexts = dictionary.map((entry) => entry.source);
      const translatedTexts = await getTranslations(sourceTexts, targetLanguage.name, translationModel);
      
      const newDictionary = dictionary.map((entry, index) => ({
        ...entry,
        target: translatedTexts[index] || entry.target,
      }));

      setDictionary(newDictionary);
      onDictionaryUpdate(newDictionary);
    } catch (e: any) {
      setError(e.message || 'Failed to generate translations. Please check your API key/endpoint and network connection.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [dictionary, onDictionaryUpdate, targetLanguage.name, translationModel]);

  const handleEditClick = (entry: TranslationEntry) => {
    setEditingId(entry.id);
    setEditFormData({ target: entry.target, policy: entry.policy });
  };

  const handleSaveClick = (id: string) => {
    if (!editFormData) return;
    const newDictionary = dictionary.map((entry) =>
      entry.id === id ? { ...entry, target: editFormData.target, policy: editFormData.policy } : entry
    );
    setDictionary(newDictionary);
    onDictionaryUpdate(newDictionary);
    setEditingId(null);
    setEditFormData(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if(!editFormData) return;
      const {name, value} = e.target;
      setEditFormData({...editFormData, [name]: value});
  }
  
  const allTargetsFilled = useMemo(() => {
    return dictionary.every(entry => entry.target.trim() !== '');
  }, [dictionary]);

  return (
    <div className="w-full bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dictionaryTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">{t('dictionaryDescription')}</p>
        </div>
        <div className="flex w-full sm:w-auto items-end space-x-2">
             <div className="flex-grow">
                <label htmlFor="model-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {t('modelLabel')}
                </label>
                <select
                    id="model-select"
                    name="model"
                    value={translationModel}
                    onChange={handleModelChange}
                    className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {Object.values(TranslationModel).map(model => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </select>
            </div>
            <div className="flex-grow">
                <label htmlFor="language-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {t('translateToLabel')}
                </label>
                <select
                    id="language-select"
                    name="language"
                    value={targetLanguage.name}
                    onChange={handleLanguageChange}
                    className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                </select>
            </div>
          <button
            onClick={handleGenerateTranslations}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center justify-center px-4 h-10 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5 md:me-2" />}
            <span className="hidden md:inline">{isLoading ? t('generateButtonLoading') : t('generateButton')}</span>
          </button>
           <button
            onClick={onProceed}
            disabled={!allTargetsFilled}
            className="flex-shrink-0 flex items-center justify-center px-4 h-10 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <CheckIcon className="w-5 h-5 md:me-2" />
            <span className="hidden md:inline">{t('proceedButton')}</span>
          </button>
        </div>
      </div>
      
       {!allTargetsFilled && (
        <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-3 rounded-md mb-4 text-sm">
          {t('emptyTargetWarning')}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
            <p className="font-bold">{t('apiErrorTitle')}</p>
            <p>{error}</p>
        </div>
       )}

      <div className="overflow-x-auto max-h-[60vh] relative">
        <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 w-2/5">{t('sourceTextHeader')}</th>
              <th scope="col" className="px-6 py-3 w-2/5">{t('targetTextHeader')} ({targetLanguage.name})</th>
              <th scope="col" className="px-6 py-3 w-1/5">{t('matchPolicyHeader')}</th>
              <th scope="col" className="px-6 py-3 text-center">{t('actionsHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {dictionary.map((entry) => (
              <tr key={entry.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-pre-wrap break-words">{entry.source}</td>
                <td className="px-6 py-4">
                  {editingId === entry.id ? (
                    <input
                      type="text"
                      name="target"
                      value={editFormData?.target}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <span className="whitespace-pre-wrap break-words">{entry.target}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === entry.id ? (
                    <select
                        name="policy"
                        value={editFormData?.policy}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value={MatchPolicy.FLEXIBLE}>{t('matchPolicyFlexible')}</option>
                        <option value={MatchPolicy.EXACT_ONLY}>{t('matchPolicyExact')}</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.policy === MatchPolicy.EXACT_ONLY ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                        {entry.policy === MatchPolicy.EXACT_ONLY ? t('matchPolicyExact') : t('matchPolicyFlexible')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {editingId === entry.id ? (
                     <button onClick={() => handleSaveClick(entry.id)} className="font-medium text-green-600 dark:text-green-500 hover:underline p-1">
                        <SaveIcon className="w-5 h-5"/>
                     </button>
                  ) : (
                     <button onClick={() => handleEditClick(entry)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline p-1">
                        <EditIcon className="w-5 h-5"/>
                     </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DictionaryManager;
