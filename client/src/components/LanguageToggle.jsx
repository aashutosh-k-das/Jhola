import { useLang } from '../i18n';

/** Switches between English and Nepali. */
export default function LanguageToggle({ className = '', variant = 'light' }) {
  const { lang, setLang } = useLang();
  const next = lang === 'en' ? 'ne' : 'en';
  return (
    <button
      onClick={() => setLang(next)}
      lang={next}
      aria-label={next === 'ne' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
      title={next === 'ne' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
      className={`flex items-center gap-1 rounded-sm border px-2 py-1 text-xs font-semibold transition ${
        variant === 'light' ? 'border-white/60 text-white hover:bg-white/10' : 'border-gray-300 text-ink hover:border-primary hover:text-primary'
      } ${className}`}
    >
      <span aria-hidden="true">🌐</span>
      {next === 'ne' ? 'नेपाली' : 'English'}
    </button>
  );
}
