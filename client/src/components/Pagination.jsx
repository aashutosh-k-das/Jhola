import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, pages, onChange }) {
  const t = useT();
  if (pages <= 1) return null;
  return (
    <nav className="flex flex-col items-center gap-3 border-t px-4 py-4 sm:flex-row sm:justify-between" aria-label={t('Pagination')}>
      <span className="text-sm text-muted">{t('Page {page} of {pages}', { page, pages })}</span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 text-sm font-semibold uppercase text-primary disabled:invisible">{t('Previous')}</button>
        {pageList(page, pages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-8 w-8 rounded-full text-sm font-medium ${p === page ? 'bg-primary text-white' : 'hover:bg-page'}`}
            >
              {formatNumber(p)}
            </button>
          )
        )}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 text-sm font-semibold uppercase text-primary disabled:invisible">{t('Next')}</button>
      </div>
      <span className="hidden w-24 sm:block" />
    </nav>
  );
}
