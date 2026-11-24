import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiCheck, FiPlus, FiLock } from 'react-icons/fi';
import api from '../utils/api';
import { setAddresses } from '../redux/authSlice';
import { clearCart, fetchCart } from '../redux/cartSlice';
import { summarizeCart } from '../utils/pricing';
import { formatDate, formatPrice, PAYMENT_LABELS } from '../utils/format';
import { BANKS, NEPAL_MOBILE } from '../utils/constants';
import PriceDetails from '../components/PriceDetails';
import AddressForm from '../components/AddressForm';
import { CartLine } from './Cart';
import Modal from '../components/Modal';
import { Spinner, PageLoader } from '../components/Loader';
import { useT } from '../i18n';
import useLocations from '../hooks/useLocations';

function Step({ n, title, active, done, summary, onChange, children }) {
  const t = useT();
  return (
    <section className="card overflow-hidden">
      <header className={`flex items-center gap-4 px-4 py-3 sm:px-6 ${active ? 'bg-primary text-white' : ''}`}>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-xs font-semibold ${active ? 'bg-white text-primary' : 'bg-page text-primary'}`}>{n}</span>
        <div className="min-w-0 flex-1">
          <h2 className={`flex items-center gap-2 text-sm font-semibold uppercase ${active ? '' : 'text-muted'}`}>
            {title} {done && !active && <FiCheck className="text-primary" size={18} />}
          </h2>
          {done && !active && summary && <div className="mt-0.5 truncate text-sm text-ink">{summary}</div>}
        </div>
        {done && !active && onChange && (
          <button onClick={onChange} className="rounded-sm border px-4 py-1.5 text-xs font-semibold uppercase text-primary">{t('Change')}</button>
        )}
      </header>
      {active && <div className="animate-fade-in">{children}</div>}
    </section>
  );
}

const luhn = (num) => {
  let sum = 0;
  [...num].reverse().forEach((d, i) => { let n = Number(d); if (i % 2) { n *= 2; if (n > 9) n -= 9; } sum += n; });
  return sum % 10 === 0;
};

function validatePayment(method, f) {
  if (method === 'ESEWA' && !NEPAL_MOBILE.test(f.wallet) && !/^\S+@\S+\.\S+$/.test(f.wallet)) return 'Enter your eSewa ID (mobile number or email)';
  if (method === 'KHALTI' && !NEPAL_MOBILE.test(f.wallet)) return 'Enter your Khalti registered mobile number';
  if (method === 'CARD') {
    const num = f.card.replace(/\s/g, '');
    if (!/^\d{12,19}$/.test(num) || !luhn(num)) return 'Enter a valid card number';
    const m = f.expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m || new Date(2000 + Number(m[2]), Number(m[1])) <= new Date()) return 'Enter a valid expiry date (MM/YY)';
    if (!/^\d{3,4}$/.test(f.cvv)) return 'Enter a valid CVV';
  }
  if (method === 'CONNECTIPS' && !f.bank) return 'Please select your bank';
  return null;
}

const METHODS = [
  { id: 'ESEWA', sub: 'Pay with your eSewa wallet', badge: 'bg-[#60bb46] text-white', badgeText: 'eSewa' },
  { id: 'KHALTI', sub: 'Pay with your Khalti wallet', badge: 'bg-[#5c2d91] text-white', badgeText: 'Khalti' },
  { id: 'CONNECTIPS', sub: 'Pay directly from your bank account', badge: 'bg-[#1a4f9c] text-white', badgeText: 'connectIPS' },
  { id: 'CARD', sub: 'Visa, Mastercard & UnionPay cards' },
  { id: 'COD', sub: 'Pay in cash when your order arrives' },
];

function PaymentGateway({ open, amount, method, onResult }) {
  const t = useT();
  const [processing, setProcessing] = useState(false);
  useEffect(() => { if (open) setProcessing(false); }, [open]);
  const m = METHODS.find((x) => x.id === method);
  const run = (success) => {
    setProcessing(true);
    setTimeout(() => onResult(success), 1200);
  };
  return (
    <Modal open={open} onClose={() => !processing && onResult(null)} title={t('Jhola Test Payment Gateway')}>
      <div className="text-center">
        {m?.badge ? (
          <span className={`inline-block rounded-md px-4 py-2 text-lg font-extrabold ${m.badge}`}>{m.badgeText}</span>
        ) : (
          <FiLock className="mx-auto text-primary" size={36} />
        )}
        <p className="mt-3 text-sm text-muted">{t('Paying via')} <b className="text-ink">{t(PAYMENT_LABELS[method])}</b></p>
        <p className="text-3xl font-semibold">{formatPrice(amount)}</p>
        <p className="mx-auto mt-3 max-w-xs rounded-sm bg-accent/10 px-3 py-2 text-xs text-[#9a5b00]">
          {t('Test mode: no real money is charged. Connect eSewa / Khalti merchant accounts to accept real payments.')}
        </p>
        {processing ? (
          <div className="mt-6 flex flex-col items-center gap-2 pb-2">
            <Spinner className="h-10 w-10" />
            <p className="text-sm text-muted">{t('Processing payment…')}</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => run(false)} className="btn-outline">{t('Simulate Failure')}</button>
            <button onClick={() => run(true)} className="btn bg-success text-white">{t('Pay {amount}', { amount: formatPrice(amount) })}</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Checkout() {
  const t = useT();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { districtName, formatAddress, addressType } = useLocations();
  const user = useSelector((s) => s.auth.user);
  const { items, loading: cartLoading } = useSelector((s) => s.cart);
  const addresses = useMemo(() => user?.addresses || [], [user]);

  const [step, setStep] = useState(2);
  const [addressId, setAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [method, setMethod] = useState('ESEWA');
  const [payForm, setPayForm] = useState({ wallet: '', card: '', expiry: '', cvv: '', bank: '' });
  const [placing, setPlacing] = useState(false);
  const [gateway, setGateway] = useState(null); // { order, amount }

  const summary = summarizeCart(items);
  const address = addresses.find((a) => a._id === addressId);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  useEffect(() => {
    if (!addressId && addresses.length) setAddressId((addresses.find((a) => a.isDefault) || addresses[0])._id);
    if (!addresses.length) setShowForm(true);
  }, [addresses, addressId]);

  useEffect(() => {
    if (!address?.district) { setDelivery(null); return; }
    api.get(`/delivery/${encodeURIComponent(address.district)}`).then((r) => setDelivery(r.data)).catch(() => setDelivery(null));
  }, [address]);

  useEffect(() => {
    if (delivery && !delivery.codAvailable && method === 'COD') setMethod('ESEWA');
  }, [delivery, method]);

  if (cartLoading && !items.length) return <PageLoader />;
  if (!items.length && !placing && !gateway) {
    return (
      <div className="container-page py-4">
        <div className="card flex flex-col items-center p-12 text-center">
          <p className="text-lg font-semibold">{t('Your cart is empty!')}</p>
          <Link to="/" className="btn-primary mt-4">{t('Shop now')}</Link>
        </div>
      </div>
    );
  }

  const saveAddress = async (values) => {
    try {
      const { data } = await api.post('/users/addresses', values);
      dispatch(setAddresses(data.addresses));
      setAddressId(data.address._id);
      setShowForm(false);
      toast.success(t('Address saved'));
    } catch (e) {
      toast.error(t(e.message));
    }
  };

  const success = (order) => {
    navigate(`/order/${order._id}/confirmation`, { replace: true });
    dispatch(clearCart());
    toast.success(t('Order placed successfully!'));
  };

  const finishPayment = async (ok) => {
    const pending = gateway;
    if (ok === null) { setGateway(null); setPlacing(false); toast(t('Payment cancelled')); return; }
    try {
      const { data } = await api.post(`/orders/${pending.order._id}/pay`, { simulated: true, success: ok });
      setGateway(null);
      success(data.order);
    } catch (e) {
      setGateway(null);
      setPlacing(false);
      toast.error(t(e.message));
    }
  };

  const placeOrder = async () => {
    const err = validatePayment(method, payForm);
    if (err) return toast.error(t(err));
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { addressId, paymentMethod: method });
      if (!data.payment) return success(data.order); // COD
      setGateway({ order: data.order, amount: data.order.totalPrice });
    } catch (e) {
      toast.error(t(e.message));
      setPlacing(false);
      dispatch(fetchCart());
    }
  };

  const setPF = (k, fmt = (v) => v) => (e) => setPayForm((f) => ({ ...f, [k]: fmt(e.target.value) }));
  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const fmtExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
  const codBlocked = delivery && !delivery.codAvailable;

  return (
    <div className="container-page py-2 pb-6 md:py-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <Step n={1} title={t('Login')} done summary={<><b>{user.name}</b> <span className="text-muted">{user.email}</span></>} />

          <Step
            n={2}
            title={t('Delivery Address')}
            active={step === 2}
            done={step > 2 && address}
            onChange={() => setStep(2)}
            summary={address && <><b>{address.name}</b> {formatAddress(address)}</>}
          >
            <ul>
              {addresses.map((a) => (
                <li key={a._id} className={`border-b px-4 py-4 sm:px-6 ${a._id === addressId ? 'bg-primary-light/40' : ''}`}>
                  <label className="flex cursor-pointer gap-4">
                    <input type="radio" name="address" checked={a._id === addressId} onChange={() => setAddressId(a._id)} className="mt-1 h-4 w-4 accent-primary" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="flex flex-wrap items-center gap-2">
                        <b>{a.name}</b>
                        <span className="rounded-sm bg-page px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">{addressType(a.type)}</span>
                        <b>{a.phone}</b>
                      </p>
                      <p className="mt-1">{formatAddress(a)}</p>
                      {!a.district && <p className="mt-1 text-xs font-semibold text-[#ff6161]">{t('Please update this address with a district')}</p>}
                      {a._id === addressId && a.district && (
                        <button onClick={() => setStep(3)} className="btn-buy mt-3 px-10 py-3">{t('Deliver Here')}</button>
                      )}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            {showForm ? (
              <div className="bg-primary-light/40 px-4 py-4 sm:px-6">
                <p className="mb-3 text-sm font-semibold uppercase text-primary">{t('Add a new address')}</p>
                <AddressForm onSubmit={saveAddress} onCancel={addresses.length ? () => setShowForm(false) : undefined} submitLabel="Save and Deliver Here" initial={{ name: user.name, phone: user.phone }} />
              </div>
            ) : (
              <button onClick={() => setShowForm(true)} className="flex w-full items-center gap-3 px-4 py-4 text-sm font-semibold text-primary sm:px-6">
                <FiPlus /> {t('Add a new address')}
              </button>
            )}
          </Step>

          <Step n={3} title={t('Order Summary')} active={step === 3} done={step > 3} onChange={() => setStep(3)} summary={t('{n} item(s)', { n: summary.count })}>
            {delivery && (
              <p className="border-b bg-page/50 px-4 py-2 text-sm sm:px-6">
                {t('Delivery to {district} by', { district: districtName(delivery.district) })} <b>{formatDate(delivery.date)}</b>{' '}
                {delivery.express && <span className="font-semibold text-primary">· ⚡ {t('Express')}</span>}
              </p>
            )}
            {items.map((i) => <CartLine key={i._id} item={i} />)}
            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm">{t('Order confirmation email will be sent to')} <b>{user.email}</b></p>
              <button
                onClick={() => (items.some((i) => i.product.stock <= 0 || i.qty > i.product.stock) ? toast.error(t('Please remove unavailable items')) : setStep(4))}
                className="btn-buy px-12 py-3"
              >
                {t('Continue')}
              </button>
            </div>
          </Step>

          <Step n={4} title={t('Payment Options')} active={step === 4}>
            {METHODS.map((m) => {
              const disabled = m.id === 'COD' && codBlocked;
              return (
                <div key={m.id} className={`border-b ${method === m.id ? 'bg-primary-light/40' : ''} ${disabled ? 'opacity-50' : ''}`}>
                  <label className="flex cursor-pointer items-start gap-4 px-4 py-4 sm:px-6">
                    <input type="radio" name="pay" disabled={disabled} checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 h-4 w-4 accent-primary" />
                    <div className="flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {m.badge && <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${m.badge}`}>{m.badgeText}</span>}
                        {t(PAYMENT_LABELS[m.id])}
                      </p>
                      <p className="text-xs text-muted">{disabled ? t('Not available in {district}', { district: districtName(delivery.district) }) : t(m.sub)}</p>
                    </div>
                  </label>
                  {method === m.id && (
                    <div className="space-y-3 px-4 pb-4 pl-12 sm:px-6 sm:pl-14">
                      {m.id === 'ESEWA' && (
                        <input className="input block max-w-sm" placeholder={t('eSewa ID (mobile number or email)')} value={payForm.wallet} onChange={setPF('wallet')} />
                      )}
                      {m.id === 'KHALTI' && (
                        <input className="input block max-w-sm" inputMode="numeric" placeholder={t('Khalti mobile number')} value={payForm.wallet} onChange={setPF('wallet', (v) => v.replace(/\D/g, '').slice(0, 10))} />
                      )}
                      {m.id === 'CARD' && (
                        <div className="grid max-w-sm grid-cols-2 gap-3">
                          <input className="input col-span-2" inputMode="numeric" autoComplete="cc-number" placeholder={t('Card number')} value={payForm.card} onChange={setPF('card', fmtCard)} />
                          <input className="input" inputMode="numeric" autoComplete="cc-exp" placeholder={t('Valid thru (MM/YY)')} value={payForm.expiry} onChange={setPF('expiry', fmtExpiry)} />
                          <input className="input" inputMode="numeric" autoComplete="cc-csc" type="password" placeholder="CVV" value={payForm.cvv} onChange={setPF('cvv', (v) => v.replace(/\D/g, '').slice(0, 4))} />
                          <p className="col-span-2 text-xs text-muted">{t('Test card: 4111 1111 1111 1111 · any future expiry · any CVV. Card details stay in your browser.')}</p>
                        </div>
                      )}
                      {m.id === 'CONNECTIPS' && (
                        <select className="input block max-w-sm" value={payForm.bank} onChange={setPF('bank')}>
                          <option value="">{t('Select your bank')}</option>
                          {BANKS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      )}
                      <button onClick={placeOrder} disabled={placing} className="btn-buy px-10 py-3">
                        {placing ? <Spinner className="h-4 w-4" light /> : m.id === 'COD' ? t('Confirm Order') : <><FiLock /> {t('Pay {amount}', { amount: formatPrice(summary.totalPrice) })}</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </Step>
        </div>

        <PriceDetails summary={summary} className="lg:sticky lg:top-[80px] lg:self-start" />
      </div>

      <PaymentGateway open={Boolean(gateway)} amount={gateway?.amount} method={method} onResult={finishPayment} />
    </div>
  );
}
