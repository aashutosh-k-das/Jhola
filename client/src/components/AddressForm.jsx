import { useState } from 'react';
import { Spinner } from './Loader';
import useLocations from '../hooks/useLocations';
import { useT } from '../i18n';
import { NEPAL_MOBILE } from '../utils/constants';

const EMPTY = { name: '', phone: '', province: '', district: '', city: '', ward: '', address: '', landmark: '', postalCode: '', type: 'Home', isDefault: false };

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Please enter a name';
  if (!NEPAL_MOBILE.test(v.phone)) e.phone = 'Enter a valid 10-digit Nepali mobile number';
  if (!v.province) e.province = 'Please select a province';
  if (!v.district) e.district = 'Please select a district';
  if (!v.city.trim()) e.city = 'Please enter your municipality';
  if (!v.address.trim()) e.address = 'Please enter your tole / street address';
  if (v.postalCode && !/^\d{5}$/.test(v.postalCode)) e.postalCode = 'Postal code must be 5 digits';
  return e;
}

function Field({ label, error, className = '', children }) {
  const t = useT();
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{t(label)}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-[#ff6161]">{t(error)}</span>}
    </label>
  );
}

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const t = useT();
  const { provinces, pick } = useLocations();
  const [v, setV] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const digits = (k, n) => (e) => setV((s) => ({ ...s, [k]: e.target.value.replace(/\D/g, '').slice(0, n) }));

  const province = provinces.find((p) => p.en === v.province);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSubmit(v);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Full name" error={errors.name}><input className="input" value={v.name} onChange={set('name')} autoComplete="name" /></Field>
      <Field label="Mobile number (98XXXXXXXX)" error={errors.phone}>
        <input className="input" inputMode="numeric" value={v.phone} onChange={digits('phone', 10)} autoComplete="tel-national" placeholder="98XXXXXXXX" />
      </Field>
      <Field label="Province" error={errors.province}>
        <select className="input" value={v.province} onChange={(e) => setV((s) => ({ ...s, province: e.target.value, district: '' }))}>
          <option value="">{t('--Select Province--')}</option>
          {provinces.map((p) => <option key={p.en} value={p.en}>{pick(p)}</option>)}
        </select>
      </Field>
      <Field label="District" error={errors.district}>
        <select className="input" value={v.district} onChange={set('district')} disabled={!province}>
          <option value="">{t('--Select District--')}</option>
          {province?.districts.map((d) => <option key={d.en} value={d.en}>{pick(d)}</option>)}
        </select>
      </Field>
      <Field label="Municipality / Rural Municipality" error={errors.city}>
        <input className="input" value={v.city} onChange={set('city')} autoComplete="address-level2" placeholder={t('e.g. Kathmandu Metropolitan City')} />
      </Field>
      <Field label="Ward No.">
        <input className="input" inputMode="numeric" value={v.ward} onChange={digits('ward', 2)} placeholder={t('e.g. 4')} />
      </Field>
      <Field label="Tole / Street / House No." error={errors.address} className="sm:col-span-2">
        <textarea className="input min-h-20 resize-y" value={v.address} onChange={set('address')} autoComplete="street-address" />
      </Field>
      <Field label="Landmark (Optional)"><input className="input" value={v.landmark} onChange={set('landmark')} /></Field>
      <Field label="Postal Code (Optional)" error={errors.postalCode}>
        <input className="input" inputMode="numeric" value={v.postalCode} onChange={digits('postalCode', 5)} autoComplete="postal-code" placeholder="44600" />
      </Field>
      <div className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted">{t('Address Type')}</span>
        <div className="flex flex-wrap gap-6 text-sm">
          {['Home', 'Work'].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input type="radio" name="addrType" checked={v.type === type} onChange={() => setV((s) => ({ ...s, type }))} className="h-4 w-4 accent-primary" />
              {t(type === 'Home' ? 'Home (All day delivery)' : 'Work (Delivery 10 AM - 5 PM)')}
            </label>
          ))}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v.isDefault} onChange={set('isDefault')} className="h-4 w-4 accent-primary" /> {t('Make default')}
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2 sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-buy min-w-40">{saving ? <Spinner className="h-4 w-4" light /> : t(submitLabel)}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn px-6 text-primary">{t('Cancel')}</button>}
      </div>
    </form>
  );
}
