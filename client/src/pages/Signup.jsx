import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { register } from '../redux/authSlice';
import AuthShell, { UnderlineInput } from '../components/AuthShell';
import { Spinner } from '../components/Loader';
import { useT } from '../i18n';
import { NEPAL_MOBILE } from '../utils/constants';

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address';
  if (f.phone && !NEPAL_MOBILE.test(f.phone)) e.phone = 'Enter a valid 10-digit Nepali mobile number';
  if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  return e;
}

export default function Signup() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((s) => s.auth.token);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search || ''}` : '/';
  if (token && !done) return <Navigate to={target} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { confirm, ...body } = form;
      const { user } = await dispatch(register(body)).unwrap();
      setDone(true);
      toast.success(t('Welcome to Jhola, {name}!', { name: user.name.split(' ')[0] }));
      navigate(target, { replace: true });
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t("Looks like you're new here!")} subtitle={t('Sign up with your email to get started')}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <UnderlineInput label={t('Full Name')} autoComplete="name" value={form.name} onChange={set('name')} error={t(errors.name)} />
        <UnderlineInput label={t('Email Address')} type="email" autoComplete="email" value={form.email} onChange={set('email')} error={t(errors.email)} />
        <UnderlineInput label={t('Mobile Number (optional)')} inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={set('phone')} error={t(errors.phone)} />
        <UnderlineInput label={t('Password (min. 6 characters)')} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={t(errors.password)} />
        <UnderlineInput label={t('Confirm Password')} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={t(errors.confirm)} />
        <p className="text-xs text-muted">{t('By continuing, you agree to Jhola’s Terms of Use and Privacy Policy.')}</p>
        <button type="submit" disabled={loading} className="btn-buy w-full py-3.5">{loading ? <Spinner className="h-5 w-5" light /> : t('Continue')}</button>
      </form>
      <Link to="/login" state={{ from }} className="mt-4 rounded-sm py-3 text-center text-sm font-semibold text-primary shadow-card">
        {t('Existing User? Log in')}
      </Link>
    </AuthShell>
  );
}
