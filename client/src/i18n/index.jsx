import { createContext, Fragment, useContext, useEffect, useMemo, useState } from 'react';
import ne from './ne';
import { loadJSON, saveJSON } from '../utils/storage';
import { setFormatLang, formatNumber } from '../utils/format';

const LANG_KEY = 'jhola_lang';
export const LANGUAGES = { en: 'English', ne: 'नेपाली' };

const warned = new Set();

/**
 * English text is the translation key: t('Add to Cart') → 'कार्टमा राख्नुहोस्'.
 * Placeholders like {n} are filled from `vars`; numbers are shown in Devanagari digits in Nepali.
 */
export function makeT(lang) {
  return (key, vars) => {
    if (key === undefined || key === null || key === '') return '';
    let str = key;
    if (lang === 'ne') {
      if (ne[key] !== undefined) str = ne[key];
      else if (import.meta.env.DEV && !warned.has(key)) {
        warned.add(key);
        console.warn(`[i18n] Missing Nepali translation: "${key}"`);
      }
    }
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (m, k) => {
        const v = vars[k];
        if (v === undefined) return m;
        return typeof v === 'number' ? formatNumber(v) : v;
      });
    }
    return str;
  };
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: makeT('en') });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = loadJSON(LANG_KEY, null);
    return saved === 'ne' || saved === 'en' ? saved : 'en';
  });
  setFormatLang(lang); // keep formatters in sync before children render

  useEffect(() => {
    document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
    saveJSON(LANG_KEY, lang);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: makeT(lang) }), [lang]);
  // Re-mount the tree on language change so every formatted price/date refreshes.
  return (
    <LangContext.Provider value={value}>
      <Fragment key={lang}>{children}</Fragment>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
export const useT = () => useContext(LangContext).t;
