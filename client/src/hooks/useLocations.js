import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useLang } from '../i18n';
import { localize } from '../utils/format';

let cache = null;
let inflight = null;

/** Nepal provinces/districts (fetched once) plus helpers to show names in the active language. */
export default function useLocations() {
  const { lang } = useLang();
  const [provinces, setProvinces] = useState(cache || []);
  useEffect(() => {
    if (cache) return;
    inflight ||= api.get('/locations').then((r) => (cache = r.data)).catch(() => { inflight = null; return []; });
    inflight.then(setProvinces);
  }, []);

  const pick = (o) => (o ? (lang === 'ne' ? o.ne : o.en) : '');
  const districtName = (en) => pick(provinces.flatMap((p) => p.districts).find((x) => x.en === en)) || en || '';
  const provinceName = (en) => pick(provinces.find((p) => p.en === en)) || en || '';
  const formatAddress = (a) =>
    a ? [a.address, `${a.city}${a.ward ? `-${localize(a.ward)}` : ''}`, districtName(a.district), provinceName(a.province)].filter(Boolean).join(', ') + (a.postalCode ? ` ${localize(a.postalCode)}` : '') : '';

  // "Home" as an address type is घर, not गृहपृष्ठ (home page)
  const addressType = (type) => (lang === 'ne' ? { Home: 'घर', Work: 'कार्यालय' }[type] || type : type);

  return { provinces, districtName, provinceName, formatAddress, pick, addressType };
}
