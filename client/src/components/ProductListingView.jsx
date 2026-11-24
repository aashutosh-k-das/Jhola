import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiChevronRight } from 'react-icons/fi';
import { BiSortAlt2 } from 'react-icons/bi';
import useFetch from '../hooks/useFetch';
import useCategories from '../hooks/useCategories';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import SortBar, { SortSheet } from './SortBar';
import Pagination from './Pagination';
import { ProductGridSkeleton, Spinner } from './Loader';
import { SORT_OPTIONS } from '../utils/constants';
import { formatNumber } from '../utils/format';
import { BagIcon } from './Logo';
import { useT } from '../i18n';

const FILTER_KEYS = ['brand', 'minPrice', 'maxPrice', 'rating', 'discount', 'inStock', 'deal', 'featured'];
const PAGE_SIZE = 12;

/**
 * Shared listing UI for category pages and search results.
 * `fixed` holds filters from the route (e.g. { category } or { q }); the rest live in the query string.
 */
export default function ProductListingView({ fixed = {}, title, breadcrumb, onCategory }) {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const t = useT();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const values = Object.fromEntries(params);
  const page = Number(values.page) || 1;
  const sort = values.sort || 'relevance';

  const apiUrl = useMemo(() => {
    const q = new URLSearchParams(params);
    Object.entries(fixed).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
    q.set('limit', PAGE_SIZE);
    return `/products?${q}`;
  }, [params, fixed]);

  const { data, loading, error, reload } = useFetch(apiUrl);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.overflow = showFilters ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showFilters]);

  const currentCategory = fixed.category || values.category;
  const handleCategory = onCategory || ((slug) => update({ category: slug || '' }));
  const activeFilterCount = FILTER_KEYS.filter((k) => values[k]).length;
  const products = data?.products || [];
  const total = data?.total ?? 0;
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, total);

  const sidebar = (
    <FilterSidebar
      facets={data?.facets}
      values={values}
      onChange={update}
      categories={categories}
      currentCategory={currentCategory}
      onCategory={handleCategory}
    />
  );

  return (
    <div className="container-page py-2 md:py-3">
      {/* Mobile sort/filter bar */}
      <div className="sticky top-[100px] z-30 -mx-2 mb-2 grid grid-cols-2 divide-x border-b bg-white text-sm font-medium shadow-card md:hidden">
        <button onClick={() => setShowSort(true)} className="flex items-center justify-center gap-2 py-3">
          <BiSortAlt2 size={18} /> {t('Sort')}
          <span className="max-w-[90px] truncate text-xs text-muted">{sort !== 'relevance' && t(SORT_OPTIONS.find((o) => o.value === sort)?.label)}</span>
        </button>
        <button onClick={() => setShowFilters(true)} className="flex items-center justify-center gap-2 py-3">
          <FiFilter size={16} /> {t('Filter')} {activeFilterCount > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-white">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-[250px_1fr] lg:grid-cols-[270px_1fr]">
        <aside className="card hidden self-start md:block">{sidebar}</aside>

        <section className="card min-w-0">
          <div className="px-4 pt-3">
            {breadcrumb && (
              <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted" aria-label={t('Breadcrumb')}>
                {breadcrumb.map((b, i) => (
                  <span key={b.label} className="flex items-center gap-1">
                    {i > 0 && <FiChevronRight size={11} />}
                    {b.to ? <Link to={b.to} className="hover:text-primary">{b.label}</Link> : <span>{b.label}</span>}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-base font-semibold">
              {title}{' '}
              <span className="text-xs font-normal text-muted">
                {loading && !data ? '' : total ? t('(Showing {from} – {to} products of {total})', { from, to, total }) : ''}
              </span>
            </h1>
          </div>
          <SortBar value={sort} onChange={(v) => update({ sort: v === 'relevance' ? '' : v })} />

          <div className="relative">
            {loading && data && (
              <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/60 pt-24"><Spinner className="h-8 w-8" /></div>
            )}
            {error ? (
              <div className="p-10 text-center">
                <p className="text-muted">{error}</p>
                <button onClick={reload} className="btn-primary mt-4">{t('Retry')}</button>
              </div>
            ) : loading && !data ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-16 text-center">
                <BagIcon className="h-28 w-28 opacity-40" bag="#c2c8d0" handle="#c2c8d0" smile="#fff" />
                <p className="mt-4 text-lg font-semibold">{t('Sorry, no results found!')}</p>
                <p className="mt-1 text-sm text-muted">{t('Please check the spelling or try searching for something else')}</p>
                {activeFilterCount > 0 && (
                  <button onClick={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])))} className="btn-primary mt-5">{t('Clear filters')}</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-gray-100 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
          {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => update({ page: p })} />}
        </section>
      </div>

      {showSort && <SortSheet value={sort} onChange={(v) => update({ sort: v === 'relevance' ? '' : v })} onClose={() => setShowSort(false)} />}

      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in md:hidden" role="dialog" aria-modal="true" aria-label={t('Filters')}>
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
          <div className="flex items-center justify-between border-t px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
            <div>
              <p className="text-base font-semibold">{formatNumber(total)}</p>
              <p className="text-xs text-muted">{t('products found')}</p>
            </div>
            <button onClick={() => setShowFilters(false)} className="btn-buy px-10">{t('Apply')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
