import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiArrowUpLeft, FiTrendingUp } from 'react-icons/fi';
import api from '../utils/api';
import useDebounce from '../hooks/useDebounce';
import { formatPrice } from '../utils/format';
import { useT } from '../i18n';

const TRENDING = ['iphone', 'sneakers', 'laptop', 'microwave', 'perfume', 'cricket bat'];

export default function SearchBar({ autoFocus = false }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const urlQuery = location.pathname === '/search' ? params.get('q') || '' : '';

  const [term, setTerm] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(term.trim(), 300);
  const boxRef = useRef(null);

  useEffect(() => setTerm(urlQuery), [urlQuery]);

  useEffect(() => {
    if (debounced.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const controller = new AbortController();
    api
      .get('/products', { params: { q: debounced, limit: 6, facets: false }, signal: controller.signal })
      .then((r) => { setSuggestions(r.data.products); setActive(-1); })
      .catch(() => {});
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const onClick = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (q = term) => {
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    setTerm(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const showTrending = term.trim().length < 2;
  const rows = showTrending ? TRENDING.map((t) => ({ type: 'term', value: t })) : suggestions.map((p) => ({ type: 'product', value: p }));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(rows.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[active];
      if (!row) submit();
      else if (row.type === 'term') submit(row.value);
      else { setOpen(false); navigate(`/product/${row.value.slug || row.value._id}`); }
    }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} role="search" className="flex h-9 items-center rounded-sm bg-white shadow-sm md:h-10">
        <input
          type="search"
          value={term}
          autoFocus={autoFocus}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('Search for products, brands and more')}
          aria-label={t('Search products')}
          className="h-full min-w-0 flex-1 rounded-sm bg-transparent px-4 text-sm text-ink outline-none placeholder:text-gray-500"
        />
        <button type="submit" aria-label={t('Search')} className="px-3 text-primary">
          <FiSearch size={20} />
        </button>
      </form>

      {open && rows.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-0.5 overflow-hidden rounded-b-sm bg-white text-ink shadow-pop animate-fade-in">
          {showTrending && <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase text-muted">{t('Trending searches')}</p>}
          <ul role="listbox">
            {rows.map((row, i) => (
              <li key={row.type === 'term' ? row.value : row.value._id} role="option" aria-selected={i === active}>
                {row.type === 'term' ? (
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => submit(row.value)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-primary-light ${i === active ? 'bg-primary-light' : ''}`}>
                    <FiTrendingUp className="text-muted" /> <span className="flex-1">{row.value}</span>
                  </button>
                ) : (
                  <button type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setOpen(false); navigate(`/product/${row.value.slug || row.value._id}`); }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-primary-light ${i === active ? 'bg-primary-light' : ''}`}>
                    <img src={row.value.images?.[0]} alt="" className="h-9 w-9 shrink-0 object-contain" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{row.value.name}</span>
                      <span className="text-xs text-muted">{row.value.brand} · <b className="text-ink">{formatPrice(row.value.price)}</b></span>
                    </span>
                    <FiArrowUpLeft className="text-muted" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!showTrending && (
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => submit()}
              className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-primary-light">
              <FiSearch /> {t('See all results for “{q}”', { q: term.trim() })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
