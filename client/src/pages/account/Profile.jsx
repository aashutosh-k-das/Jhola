import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { updateProfile } from '../../redux/authSlice';
import { Spinner } from '../../components/Loader';
import { useT } from '../../i18n';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const t = useT();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', gender: user.gender || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(null);

  const save = async (e, body, kind) => {
    e.preventDefault();
    setSaving(kind);
    try {
      await dispatch(updateProfile(body)).unwrap();
      toast.success(t(kind === 'pw' ? 'Password updated' : 'Profile updated'));
      if (kind === 'pw') setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(t(err.message));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="card space-y-10 p-5 sm:p-8">
      <form onSubmit={(e) => save(e, form, 'info')} className="space-y-4">
        <h1 className="text-lg font-semibold">{t('Personal Information')}</h1>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-xs text-muted">{t('Full name')}</span><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-xs text-muted">{t('Mobile number (98XXXXXXXX)')}</span><input className="input" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></label>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm">{t('Your Gender')}</legend>
          <div className="flex gap-6 text-sm">
            {['Male', 'Female', 'Other'].map((g) => (
              <label key={g} className="flex items-center gap-2"><input type="radio" name="gender" checked={form.gender === g} onChange={() => setForm({ ...form, gender: g })} className="h-4 w-4 accent-primary" />{t(g)}</label>
            ))}
          </div>
        </fieldset>
        <label className="block max-w-xs"><span className="mb-1 block text-xs text-muted">{t('Email Address')}</span><input className="input bg-page" value={user.email} disabled /></label>
        <button disabled={saving === 'info'} className="btn-primary px-10">{saving === 'info' ? <Spinner className="h-4 w-4" light /> : t('Save')}</button>
      </form>

      <form onSubmit={(e) => save(e, pw, 'pw')} className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-semibold">{t('Change Password')}</h2>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <input className="input" type="password" autoComplete="current-password" placeholder={t('Current password')} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <input className="input" type="password" autoComplete="new-password" placeholder={t('New password (min. 6)')} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        </div>
        <button disabled={saving === 'pw' || !pw.newPassword} className="btn-primary px-10">{saving === 'pw' ? <Spinner className="h-4 w-4" light /> : t('Update Password')}</button>
      </form>
    </div>
  );
}
