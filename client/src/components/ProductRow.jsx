import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import { useT } from '../i18n';

/** Horizontally scrolling product carousel used on home & product pages. */
export default function ProductRow({ title, subtitle, products, loading, viewAll, extra, className = '' }) {
  const scroller = useRef(null);
  const t = useT();
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: 'smooth' });

  if (!loading && !products?.length) return null;

  return (
    <section className={`card relative ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold sm:text-[22px]">{title}</h2>
            {extra}
          </div>
          {subtitle && <p className="text-xs text-muted sm:text-sm">{subtitle}</p>}
        </div>
        {viewAll && (
          <Link to={viewAll} className="shrink-0 rounded-full bg-primary p-1.5 text-white shadow sm:rounded-sm sm:px-5 sm:py-2 sm:text-xs sm:font-semibold" aria-label={t('View all')}>
            <span className="hidden sm:inline">{t('VIEW ALL')}</span>
            <FiChevronRight className="sm:hidden" size={18} />
          </Link>
        )}
      </div>
      <div className="relative">
        <div ref={scroller} className="flex snap-x gap-2 overflow-x-auto scroll-smooth p-3 no-scrollbar sm:gap-3 sm:p-4">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="w-36 shrink-0 p-3 sm:w-44">
                  <div className="skeleton mx-auto h-28 w-28 rounded sm:h-36 sm:w-36" />
                  <div className="skeleton mx-auto mt-3 h-3 w-4/5 rounded" />
                  <div className="skeleton mx-auto mt-2 h-3 w-1/2 rounded" />
                </div>
              ))
            : products.map((p) => <ProductCard key={p._id} product={p} compact />)}
        </div>
        {!loading && products.length > 4 && (
          <>
            <button onClick={() => scroll(-1)} aria-label={t('Scroll left')} className="absolute left-0 top-1/2 hidden h-24 -translate-y-1/2 items-center rounded-r bg-white/95 px-2 shadow-pop md:flex">
              <FiChevronLeft size={22} />
            </button>
            <button onClick={() => scroll(1)} aria-label={t('Scroll right')} className="absolute right-0 top-1/2 hidden h-24 -translate-y-1/2 items-center rounded-l bg-white/95 px-2 shadow-pop md:flex">
              <FiChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
