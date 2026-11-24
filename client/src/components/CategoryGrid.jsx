import { Link } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { useLang } from '../i18n';

export default function CategoryGrid() {
  const categories = useCategories();
  const { lang, t } = useLang();
  return (
    <section className="card p-3 sm:p-5">
      <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-[22px]">{t('Shop by Category')}</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-6">
        {(categories.length ? categories : Array.from({ length: 6 }, (_, i) => ({ slug: i }))).map((c) =>
          c.name ? (
            <Link key={c.slug} to={`/category/${c.slug}`} className="group flex flex-col items-center rounded-md bg-gradient-to-b from-primary-light to-white p-3 text-center transition hover:shadow-pop">
              <img src={c.image} alt="" loading="lazy" className="h-16 w-16 object-contain transition group-hover:scale-110 sm:h-24 sm:w-24" />
              <span className="mt-2 text-xs font-semibold sm:text-sm">{lang === 'ne' ? c.nameNe : c.name}</span>
              <span className="hidden text-xs text-muted sm:block">{lang === 'ne' ? c.taglineNe : c.tagline}</span>
              <span className="mt-0.5 text-[11px] font-medium text-success">{t('{n} products', { n: c.count })}</span>
            </Link>
          ) : (
            <div key={c.slug} className="skeleton h-28 rounded-md sm:h-40" />
          )
        )}
      </div>
    </section>
  );
}
