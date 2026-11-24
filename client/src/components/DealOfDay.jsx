import { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import ProductRow from './ProductRow';
import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

function msUntilMidnight() {
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  return end - Date.now();
}

function Countdown() {
  const t = useT();
  const [ms, setMs] = useState(msUntilMidnight);
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(ms / 1000);
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => formatNumber(v).padStart(2, formatNumber(0)));
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted" aria-live="off">
      <FiClock className="text-ink" />
      <span className="flex items-center gap-0.5 font-semibold text-ink">
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-0.5">
            <span className="rounded-sm bg-ink px-1.5 py-0.5 font-mono text-xs text-white tabular-nums">{p}</span>
            {i < 2 && <span>:</span>}
          </span>
        ))}
      </span>
      <span className="hidden sm:inline">{t('Left')}</span>
    </span>
  );
}

export default function DealOfDay({ products, loading }) {
  const t = useT();
  return (
    <ProductRow
      title={t('Deals of the Day')}
      subtitle={t('Hurry! Prices go back up at midnight')}
      products={products}
      loading={loading}
      viewAll="/products?deal=true&sort=discount"
      extra={<Countdown />}
    />
  );
}
