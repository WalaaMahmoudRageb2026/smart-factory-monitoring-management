import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeToggleProps {
  variant?: 'simple' | 'dropdown' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'simple' }) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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

  if (variant === 'segmented') {
    return (
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={t('lightMode')}
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('lightMode')}</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={t('darkMode')}
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('darkMode')}</span>
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={t('systemTheme')}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('systemTheme')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick toggle / dropdown trigger */}
      <button
        id="btn-theme-toggle"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/70 dark:border-slate-700/80 relative"
        title={`${t('toggleTheme')} (${effectiveTheme === 'dark' ? t('darkMode') : t('lightMode')})`}
      >
        {effectiveTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-90 duration-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-90 duration-200" />
        )}
      </button>

      {/* Optional dropdown menu on long press or right click */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('theme')}
          </div>

          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('lightMode')}</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
              theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>{t('darkMode')}</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
              theme === 'system'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-500" />
              <span>{t('systemTheme')}</span>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
