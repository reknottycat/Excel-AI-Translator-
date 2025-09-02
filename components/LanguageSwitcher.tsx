
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { languageList, LanguageCode } from '../localization/translations';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as LanguageCode);
    };

    return (
        <div className="relative">
            <select
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none h-10 ps-3 pe-8 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                aria-label="Select language"
            >
                {languageList.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-2 text-slate-700 dark:text-slate-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
