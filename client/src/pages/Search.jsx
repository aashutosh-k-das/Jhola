import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductListingView from '../components/ProductListingView';
import { useT } from '../i18n';

export default function Search() {
  const [params] = useSearchParams();
  const t = useT();
  const q = params.get('q') || '';
  const fixed = useMemo(() => ({ q }), [q]);
  return (
    <ProductListingView
      fixed={fixed}
      title={q ? <>{t('Search results for')} “<span className="text-primary">{q}</span>”</> : t('All Products')}
      breadcrumb={[{ label: t('Home'), to: '/' }, { label: t('Search') }]}
    />
  );
}
