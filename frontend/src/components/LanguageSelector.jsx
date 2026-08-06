import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function LanguageSelector({ variant = 'header' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'settings') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {LANGUAGES.map((lang) => {
          const isSelected = i18n.language === lang.code || (i18n.language.startsWith(lang.code));
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition text-left focus:outline-none ${
                isSelected
                  ? 'bg-brand-50 border-brand-500 text-brand-900 font-extrabold shadow-sm dark:bg-brand-950/60 dark:border-brand-500 dark:text-brand-300'
                  : 'bg-white dark:bg-brand-900/20 border-slate-200 dark:border-brand-900/40 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-800'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-xs font-bold flex-1">{lang.name}</span>
              {isSelected && <Check size={14} className="text-brand-600 dark:text-brand-400" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-brand-900/20 border border-slate-200 dark:border-brand-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-900/40 transition text-xs font-bold focus:outline-none shadow-sm"
        title="Change Language"
      >
        <Globe size={14} className="text-brand-700 dark:text-brand-400" />
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="hidden sm:inline-block">{currentLang.name}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-900/60 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-brand-900/30">
            Select Language
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code || i18n.language.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-900 dark:text-brand-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-900/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && <Check size={13} className="text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
