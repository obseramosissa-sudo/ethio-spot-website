import React from 'react';

interface LanguageSwitcherProps {
  lang: 'EN' | 'አማ';
  setLang: (lang: 'EN' | 'አማ') => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ lang, setLang }) => {
  return (
    <div className="flex items-center bg-[#f0f2f5] dark:bg-gray-800 p-0.5 rounded-xl border border-[#eceef0] dark:border-gray-700 shadow-xs">
      <div className="px-2 text-gray-500 dark:text-gray-400 flex items-center">
        <span className="material-symbols-outlined text-[16px]">translate</span>
      </div>
      <button
        onClick={() => {
          setLang('EN');
          localStorage.setItem('ethiospot_lang', 'EN');
        }}
        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
          lang === 'EN'
            ? 'bg-white dark:bg-gray-900 text-[#005f2a] dark:text-emerald-400 shadow-xs'
            : 'text-[#3f493f] dark:text-gray-300 hover:text-[#191c1e]'
        }`}
        type="button"
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => {
          setLang('አማ');
          localStorage.setItem('ethiospot_lang', 'አማ');
        }}
        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
          lang === 'አማ'
            ? 'bg-white dark:bg-gray-900 text-[#005f2a] dark:text-emerald-400 shadow-xs'
            : 'text-[#3f493f] dark:text-gray-300 hover:text-[#191c1e]'
        }`}
        type="button"
        title="ወደ አማርኛ ቀይር"
      >
        አማ
      </button>
    </div>
  );
};
