import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useFetch from '../hooks/useFetch';
import { useT } from '../i18n';

const TINTS = ['from-sky-50', 'from-amber-50', 'from-rose-50', 'from-emerald-50', 'from-violet-50', 'from-orange-50'];

export default function BrandsCarousel() {
  const { data: brands, loading } = useFetch('/products/brands');
  const t = useT();
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className="card relative">
      <div className="border-b px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-lg font-semibold sm:text-[22px]">{t('Top Brands')}</h2>
        <p className="text-xs text-muted sm:text-sm">{t('Big names, bigger discounts')}</p>
      </div>
      <div ref={ref} className="flex snap-x gap-3 overflow-x-auto p-3 no-scrollbar sm:p-4">
        {loading && Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton h-40 w-32 shrink-0 rounded-md sm:w-40" />)}
        {brands?.map((b, i) => (
          <Link
            key={b.name}
            to={`/products?brand=${encodeURIComponent(b.name)}`}
            className={`group flex w-32 shrink-0 snap-start flex-col items-center rounded-md border border-gray-100 bg-gradient-to-b to-white p-3 text-center transition hover:shadow-pop sm:w-40 ${TINTS[i % TINTS.length]}`}
          >
            <img src={b.image} alt="" loading="lazy" className="h-20 w-20 object-contain transition group-hover:scale-110 sm:h-24 sm:w-24" />
            <span className="mt-2 text-sm font-extrabold uppercase tracking-wide">{b.name}</span>
            <span className="text-xs font-semibold text-success">{b.maxDiscount ? t('Up to {n}% off', { n: b.maxDiscount }) : t('{n} products', { n: b.count })}</span>
          </Link>
        ))}
      </div>
      <button onClick={() => scroll(-1)} aria-label={t('Scroll left')} className="absolute left-0 top-1/2 hidden h-20 items-center rounded-r bg-white/95 px-2 shadow-pop md:flex"><FiChevronLeft size={22} /></button>
      <button onClick={() => scroll(1)} aria-label={t('Scroll right')} className="absolute right-0 top-1/2 hidden h-20 items-center rounded-l bg-white/95 px-2 shadow-pop md:flex"><FiChevronRight size={22} /></button>
    </section>
  );
}
