import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { login, verifyOtp } from '../redux/authSlice';
import AuthShell, { UnderlineInput } from '../components/AuthShell';
import { Spinner } from '../components/Loader';
import { useT } from '../i18n';

function useRedirectTarget() {
  const location = useLocation();
  const from = location.state?.from;
  return from ? `${from.pathname}${from.search || ''}` : '/';
}

function PasswordLogin({ onDone }) {
  const t = useT();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError(t('Please enter your email and password'));
    setLoading(true);
    setError('');
    try {
      const { user } = await dispatch(login(form)).unwrap();
      onDone(user);
    } catch (err) {
      setError(t(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <UnderlineInput label={t('Enter Email')} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <UnderlineInput label={t('Enter Password')} type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={error} />
      <p className="text-xs text-muted">{t('By continuing, you agree to Jhola’s Terms of Use and Privacy Policy.')}</p>
      <button type="submit" disabled={loading} className="btn-buy w-full py-3.5">{loading ? <Spinner className="h-5 w-5" light /> : t('Login')}</button>
      <button type="button" onClick={() => setForm({ email: 'demo@jhola.com', password: 'demo1234' })} className="w-full rounded-sm border border-dashed border-primary/40 bg-primary-light/50 px-3 py-2 text-xs text-primary">
        {t('Try the demo account:')} <b>demo@jhola.com</b> / <b>demo1234</b> {t('(click to fill)')}
      </button>
    </form>
  );
}

function OtpLogin({ onDone }) {
  const t = useT();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(null); // { demoOtp, isNewUser }
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/otp/send', { email });
      setSent(data);
      setCooldown(30);
      if (data.demoOtp) toast(`${t('Demo OTP:')} ${data.demoOtp}`, { icon: '🔑', duration: 8000 });
    } catch (err) {
      setError(t(err.message));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError(t('Enter the 6-digit OTP'));
    setLoading(true);
    setError('');
    try {
      const { user } = await dispatch(verifyOtp({ email, otp, name })).unwrap();
      onDone(user, sent?.isNewUser);
    } catch (err) {
      setError(t(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!sent) {
    return (
      <form onSubmit={send} className="space-y-5" noValidate>
        <UnderlineInput label={t('Enter Email')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <p className="text-xs text-muted">{t('New to Jhola? Create an account with a one-time code. (Demo — the code is shown on screen.) Existing customers: please use your password.')}</p>
        <button type="submit" disabled={loading || !email} className="btn-buy w-full py-3.5">{loading ? <Spinner className="h-5 w-5" light /> : t('Request OTP')}</button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-5" noValidate>
      <p className="text-sm">
        {t('Please enter the OTP sent to')} <b>{email}</b>{' '}
        <button type="button" onClick={() => { setSent(null); setOtp(''); }} className="font-semibold text-primary">{t('Change')}</button>
      </p>
      {sent.demoOtp && <div className="rounded-sm bg-accent/10 px-3 py-2 text-xs text-[#9a5b00]">{t('Demo mode: your OTP is')} <b className="font-mono text-sm tracking-widest">{sent.demoOtp}</b></div>}
      {sent.isNewUser && <UnderlineInput label={t('Your Name (new account)')} value={name} onChange={(e) => setName(e.target.value)} />}
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="● ● ● ● ● ●"
        aria-label={t('One-time password')}
        className="w-full border-b-2 border-gray-200 py-2 text-center font-mono text-2xl tracking-[0.6em] outline-none focus:border-primary"
      />
      {error && <p className="text-xs text-[#ff6161]">{error}</p>}
      <button type="submit" disabled={loading} className="btn-buy w-full py-3.5">{loading ? <Spinner className="h-5 w-5" light /> : t('Verify')}</button>
      <p className="text-center text-sm text-muted">
        {t('Not received your code?')}{' '}
        {cooldown ? <span>{t('Resend in {n}s', { n: cooldown })}</span> : <button type="button" onClick={send} className="font-semibold text-primary">{t('Resend code')}</button>}
      </p>
    </form>
  );
}

export default function Login() {
  const t = useT();
  const token = useSelector((s) => s.auth.token);
  const navigate = useNavigate();
  const target = useRedirectTarget();
  const location = useLocation();
  const [mode, setMode] = useState('password');
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  if (token && !justLoggedIn) return <Navigate to={target} replace />;

  const onDone = (user, isNew) => {
    setJustLoggedIn(true);
    toast.success(t(isNew ? 'Welcome to Jhola, {name}!' : 'Welcome back, {name}!', { name: user.name.split(' ')[0] }));
    navigate(target, { replace: true });
  };

  return (
    <AuthShell title={t('Login')} subtitle={t('Get access to your Orders, Wishlist and Recommendations')}>
      <div className="mb-6 grid grid-cols-2 rounded-sm bg-page p-1 text-sm font-semibold" role="tablist">
        {[['password', 'Password'], ['otp', 'Login with OTP']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
            className={`rounded-sm py-2 transition ${mode === id ? 'bg-white text-primary shadow-card' : 'text-muted'}`}>
            {t(label)}
          </button>
        ))}
      </div>
      {mode === 'password' ? <PasswordLogin onDone={onDone} /> : <OtpLogin onDone={onDone} />}
      <Link to="/signup" state={{ from: location.state?.from }} className="mt-auto pt-8 text-center text-sm font-semibold text-primary">
        {t('New to Jhola? Create an account')}
      </Link>
    </AuthShell>
  );
}
