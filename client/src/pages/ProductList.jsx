import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ProductListingView from '../components/ProductListingView';
import useCategories from '../hooks/useCategories';
import { useLang } from '../i18n';

export default function ProductList() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const categories = useCategories();
  const { lang, t } = useLang();
  const cat = categories.find((c) => c.slug === category);
  const fixed = useMemo(() => ({ category }), [category]);

  const catName = cat && (lang === 'ne' ? cat.nameNe : cat.name);
  const title = catName || (params.get('deal') ? t('Deals of the Day') : params.get('featured') ? t('Featured Products') : params.get('brand') ? params.get('brand').split(',').join(', ') : t('All Products'));

  const onCategory = (slug) => {
    const next = new URLSearchParams(params);
    ['page', 'brand', 'minPrice', 'maxPrice'].forEach((k) => next.delete(k));
    const qs = next.toString();
    navigate(`${slug ? `/category/${slug}` : '/products'}${qs ? `?${qs}` : ''}`);
  };

  return (
    <ProductListingView
      fixed={fixed}
      title={title}
      onCategory={onCategory}
      breadcrumb={[{ label: t('Home'), to: '/' }, { label: catName || t('Products') }]}
    />
  );
}
