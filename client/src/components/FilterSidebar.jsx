import { useState } from 'react';
import { FiChevronDown, FiChevronLeft, FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { PRICE_STEPS } from '../utils/constants';
import { formatPrice, formatNumber } from '../utils/format';
import { useLang } from '../i18n';

function Section({ title, children, defaultOpen = true }) {
  const { t } = useLang();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b px-4 py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide" aria-expanded={open}>
        {t(title)}
        <FiChevronDown className={`text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Check({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" />
      <span className="flex items-center gap-1">{children}</span>
    </label>
  );
}

const RATINGS = [4, 3];
const DISCOUNTS = [50, 40, 30, 20, 10];

export default function FilterSidebar({ facets, values, onChange, categories = [], currentCategory, onCategory }) {
  const { lang, t } = useLang();
  const [brandQuery, setBrandQuery] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  const selectedBrands = values.brand ? values.brand.split(',') : [];
  const toggleBrand = (name) => {
    const next = selectedBrands.includes(name) ? selectedBrands.filter((b) => b !== name) : [...selectedBrands, name];
    onChange({ brand: next.join(',') });
  };

  const brands = (facets?.brands || []).filter((b) => b.name.toLowerCase().includes(brandQuery.toLowerCase()));
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 6);

  const chips = [
    ...selectedBrands.map((b) => ({ label: b, clear: () => toggleBrand(b) })),
    (values.minPrice || values.maxPrice) && {
      label: `${values.minPrice ? formatPrice(values.minPrice) : t('Min')} - ${values.maxPrice ? formatPrice(values.maxPrice) : t('Max')}`,
      clear: () => onChange({ minPrice: '', maxPrice: '' }),
    },
    values.rating && { label: t('{n}★ & above', { n: Number(values.rating) }), clear: () => onChange({ rating: '' }) },
    values.discount && { label: t('{n}% or more', { n: Number(values.discount) }), clear: () => onChange({ discount: '' }) },
    values.inStock && { label: t('In stock'), clear: () => onChange({ inStock: '' }) },
  ].filter(Boolean);

  const maxSteps = PRICE_STEPS.slice(1);

  return (
    <div className="text-ink">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('Filters')}</h2>
          {chips.length > 0 && (
            <button onClick={() => onChange({ brand: '', minPrice: '', maxPrice: '', rating: '', discount: '', inStock: '' })} className="text-xs font-semibold uppercase text-primary">
              {t('Clear all')}
            </button>
          )}
        </div>
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button key={c.label} onClick={c.clear} className="flex items-center gap-1 rounded-sm bg-page px-2 py-1 text-xs hover:line-through">
                <FiX size={12} /> {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <div className="border-b px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide">{t('Categories')}</p>
          {currentCategory && (
            <button onClick={() => onCategory(null)} className="mb-1 flex items-center gap-1 text-sm text-muted hover:text-primary">
              <FiChevronLeft /> {t('All Categories')}
            </button>
          )}
          <ul className={currentCategory ? 'pl-4' : ''}>
            {categories.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => onCategory(c.slug)}
                  className={`py-1 text-sm hover:text-primary ${currentCategory === c.slug ? 'font-semibold text-ink' : 'text-gray-600'}`}
                >
                  {lang === 'ne' ? c.nameNe : c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Price">
        {facets?.priceRange?.max > 0 && (
          <p className="mb-2 text-xs text-muted">{t('Range in results:')} {formatPrice(facets.priceRange.min)} – {formatPrice(facets.priceRange.max)}</p>
        )}
        <div className="flex items-center gap-2">
          <select aria-label={t('Minimum price')} value={values.minPrice || ''} onChange={(e) => onChange({ minPrice: e.target.value })} className="input min-w-0 py-1.5">
            <option value="">{t('Min')}</option>
            {PRICE_STEPS.filter((p) => !values.maxPrice || p < Number(values.maxPrice)).map((p) => (
              <option key={p} value={p || ''}>{p ? formatPrice(p) : t('Min')}</option>
            ))}
          </select>
          <span className="text-muted">{t('to')}</span>
          <select aria-label={t('Maximum price')} value={values.maxPrice || ''} onChange={(e) => onChange({ maxPrice: e.target.value })} className="input min-w-0 py-1.5">
            <option value="">{t('Max')}</option>
            {maxSteps.filter((p) => !values.minPrice || p > Number(values.minPrice)).map((p) => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>
        </div>
      </Section>

      {facets?.brands?.length > 0 && (
        <Section title="Brand">
          {facets.brands.length > 6 && (
            <input value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} placeholder={t('Search Brand')} className="input mb-2 py-1.5 text-xs" />
          )}
          {visibleBrands.map((b) => (
            <Check key={b.name} checked={selectedBrands.some((s) => s.toLowerCase() === b.name.toLowerCase())} onChange={() => toggleBrand(b.name)}>
              {b.name} <span className="text-xs text-muted">({formatNumber(b.count)})</span>
            </Check>
          ))}
          {brands.length > 6 && (
            <button onClick={() => setShowAllBrands(!showAllBrands)} className="mt-1 text-xs font-semibold text-primary">
              {showAllBrands ? t('SHOW LESS') : t('{n} MORE', { n: brands.length - 6 })}
            </button>
          )}
        </Section>
      )}

      <Section title="Customer Ratings">
        {RATINGS.map((r) => (
          <Check key={r} checked={Number(values.rating) === r} onChange={() => onChange({ rating: Number(values.rating) === r ? '' : r })}>
            {formatNumber(r)}<FaStar size={11} /> {t('& above')}
          </Check>
        ))}
      </Section>

      <Section title="Discount">
        {DISCOUNTS.map((d) => (
          <Check key={d} checked={Number(values.discount) === d} onChange={() => onChange({ discount: Number(values.discount) === d ? '' : d })}>
            {t('{n}% or more', { n: d })}
          </Check>
        ))}
      </Section>

      <Section title="Availability" defaultOpen={false}>
        <Check checked={values.inStock === 'true'} onChange={() => onChange({ inStock: values.inStock ? '' : 'true' })}>
          {t('Exclude Out of Stock')}
        </Check>
      </Section>
    </div>
  );
}
