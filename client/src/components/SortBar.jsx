import { SORT_OPTIONS } from '../utils/constants';
import { useT } from '../i18n';

export default function SortBar({ value = 'relevance', onChange }) {
  const t = useT();
  return (
    <div className="hidden flex-wrap items-center gap-x-6 gap-y-1 border-b px-4 text-sm md:flex">
      <span className="font-semibold">{t('Sort By')}</span>
      {SORT_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`border-b-2 py-2.5 transition ${value === o.value ? 'border-primary font-semibold text-primary' : 'border-transparent hover:text-primary'}`}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

/** Mobile bottom-sheet variant. */
export function SortSheet({ value = 'relevance', onChange, onClose }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t('Sort By')}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-xl bg-white pb-[env(safe-area-inset-bottom)] animate-slide-up">
        <p className="border-b px-4 py-3 text-xs font-semibold uppercase text-muted">{t('Sort By')}</p>
        {SORT_OPTIONS.map((o) => (
          <label key={o.value} className="flex items-center justify-between px-4 py-3 text-sm">
            {t(o.label)}
            <input type="radio" name="sort" checked={value === o.value} onChange={() => { onChange(o.value); onClose(); }} className="h-4 w-4 accent-primary" />
          </label>
        ))}
      </div>
    </div>
  );
}
