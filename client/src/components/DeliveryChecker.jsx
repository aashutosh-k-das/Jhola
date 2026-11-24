import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiMapPin, FiTruck } from 'react-icons/fi';
import api from '../utils/api';
import { formatDate, formatPrice } from '../utils/format';
import { loadJSON, saveJSON } from '../utils/storage';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../utils/pricing';
import useLocations from '../hooks/useLocations';
import { useT } from '../i18n';

export const DISTRICT_KEY = 'jhola_district';

/** Delivery estimate by district (defaults to the user's default address, then the last checked district). */
export default function DeliveryChecker({ price }) {
  const t = useT();
  const { provinces, pick } = useLocations();
  const user = useSelector((s) => s.auth.user);
  const defaultDistrict = (user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0])?.district;
  const [district, setDistrict] = useState(() => loadJSON(DISTRICT_KEY, '') || defaultDistrict || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!district) { setResult(null); return undefined; }
    let cancelled = false;
    api.get(`/delivery/${encodeURIComponent(district)}`)
      .then((r) => { if (!cancelled) { setResult(r.data); setError(''); saveJSON(DISTRICT_KEY, district); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setResult(null); } });
    return () => { cancelled = true; };
  }, [district]);

  const free = price >= FREE_DELIVERY_THRESHOLD;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
      <span className="w-24 shrink-0 text-sm font-medium text-muted">{t('Delivery')}</span>
      <div className="flex-1">
        <label className="flex max-w-xs items-center border-b-2 border-primary">
          <FiMapPin className="shrink-0 text-primary" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            aria-label={t('Select delivery district')}
            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm font-medium outline-none"
          >
            <option value="">{t('Select your district')}</option>
            {provinces.map((p) => (
              <optgroup key={p.en} label={t('{name} Province', { name: pick(p) })}>
                {p.districts.map((d) => <option key={d.en} value={d.en}>{pick(d)}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        {error && <p className="mt-1 text-xs text-[#ff6161]">{t(error)}</p>}
        {result && (
          <div className="mt-2 space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <FiTruck className="shrink-0 text-muted" />
              <span>
                {t('Delivery by')} <b>{formatDate(result.date)}</b> |{' '}
                {free ? <span className="text-success">{t('Free')} <span className="text-muted line-through">{formatPrice(DELIVERY_CHARGE)}</span></span> : formatPrice(DELIVERY_CHARGE)}
              </span>
            </p>
            {result.express && <p className="text-xs font-semibold text-primary">⚡ {t('Next-day delivery inside Kathmandu Valley')}</p>}
            <p className="text-xs text-muted">{t(result.codAvailable ? 'Cash on Delivery available' : 'Cash on Delivery not available in this district')}</p>
          </div>
        )}
        {!result && !error && <p className="mt-1 text-xs text-muted">{t('Select your district to check delivery date and COD availability')}</p>}
      </div>
    </div>
  );
}
