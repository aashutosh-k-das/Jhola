import { NavLink } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { useLang } from '../i18n';

/** Desktop category strip under the navbar. "home" shows image tiles; "compact" shows a slim text bar. */
export default function CategoryBar({ variant = 'compact' }) {
  const categories = useCategories();
  const { lang } = useLang();
  const label = (c) => (lang === 'ne' ? c.nameNe || c.name : c.name);
  if (!categories.length) return <div className={`hidden bg-white md:block ${variant === 'home' ? 'h-[104px]' : 'h-10'}`} />;

  if (variant === 'home') {
    return (
      <div className="hidden bg-white shadow-card md:block">
        <div className="container-page flex justify-between gap-4 overflow-x-auto py-3 no-scrollbar lg:justify-around">
          {categories.map((c) => (
            <NavLink key={c.slug} to={`/category/${c.slug}`} className="group flex shrink-0 flex-col items-center gap-1.5 px-2">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-light/60">
                <img src={c.image} alt="" className="h-14 w-14 object-contain transition group-hover:scale-110" />
              </span>
              <span className="text-sm font-semibold group-hover:text-primary">{label(c)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden border-b bg-white shadow-card md:block">
      <div className="container-page flex h-10 items-center justify-between gap-6 overflow-x-auto no-scrollbar lg:justify-around">
        {categories.map((c) => (
          <NavLink
            key={c.slug}
            to={`/category/${c.slug}`}
            className={({ isActive }) => `shrink-0 text-sm font-medium hover:text-primary ${isActive ? 'text-primary' : ''}`}
          >
            {label(c)}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
