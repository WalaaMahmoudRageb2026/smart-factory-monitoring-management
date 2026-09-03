import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Sparkles, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CountryLanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'compact';
}

export const CountryLanguageSelector: React.FC<CountryLanguageSelectorProps> = ({ variant = 'header' }) => {
  const { currentCountryLang, setCountryLang, autoDetectCountry, availableOptions, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = availableOptions.filter(opt => {
    const q = search.toLowerCase();
    return (
      opt.country.toLowerCase().includes(q) ||
      opt.countryNative.toLowerCase().includes(q) ||
      opt.language.toLowerCase().includes(q) ||
      opt.languageNative.toLowerCase().includes(q) ||
      opt.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === 'compact' ? (
        <button
          id="btn-language-selector-compact"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-xs font-semibold border border-slate-200/70 dark:border-slate-700/80"
          title={t('countryAndLanguage')}
        >
          <span className="text-base leading-none">{currentCountryLang.flag}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider">{currentCountryLang.langCode}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      ) : variant === 'sidebar' ? (
        <button
          id="btn-language-selector-sidebar"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl leading-none shrink-0">{currentCountryLang.flag}</span>
            <div className={`text-start min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {currentCountryLang.countryNative}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-400">
                {currentCountryLang.languageNative}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      ) : (
        <button
          id="btn-language-selector-header"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
          title={t('countryAndLanguage')}
        >
          <span className="text-base leading-none">{currentCountryLang.flag}</span>
          <span className="hidden sm:inline font-semibold">{currentCountryLang.countryNative}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono">
            {currentCountryLang.langCode.toUpperCase()}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      )}

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {t('countryAndLanguage')}
              </span>
            </div>
            <button
              onClick={() => {
                autoDetectCountry();
                setIsOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition-colors border border-indigo-200/60 dark:border-indigo-800/60"
              title={t('autoDetect')}
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('autoDetect')}</span>
            </button>
          </div>

          {/* Search box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative flex items-center">
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchCountry')}
                className={`w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 ${
                  isRTL ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'
                }`}
                autoFocus
              />
            </div>
          </div>

          {/* List of Countries & Languages */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {t('search')} - 0 results
              </div>
            ) : (
              filtered.map(opt => {
                const isSelected = currentCountryLang.code === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setCountryLang(opt.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl leading-none shrink-0">{opt.flag}</span>
                      <div className={`text-start min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {opt.countryNative}{' '}
                          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-400">
                            ({opt.country})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{opt.languageNative}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="font-mono text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                            {opt.code}
                          </span>
                          {opt.dir === 'rtl' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                              RTL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
