import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiMapPin } from 'react-icons/fi';
import { removeFromCart, updateCartQty } from '../redux/cartSlice';
import { summarizeCart } from '../utils/pricing';
import { formatPrice } from '../utils/format';
import PriceDetails from '../components/PriceDetails';
import QtySelector from '../components/QtySelector';
import LazyImage from '../components/LazyImage';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Loader';
import { BagIcon } from '../components/Logo';
import { loadJSON } from '../utils/storage';
import { useT } from '../i18n';
import useLocations from '../hooks/useLocations';
import { DISTRICT_KEY } from '../components/DeliveryChecker';
import { formatNumber } from '../utils/format';

export function CartLine({ item, compact = false }) {
  const t = useT();
  const dispatch = useDispatch();
  const pending = useSelector((s) => s.cart.pending[item._id]);
  const [confirm, setConfirm] = useState(false);
  const p = item.product;
  const max = Math.min(10, p.stock);
  const variant = [item.size && `${t('Size')}: ${item.size}`, item.color && `${t('Color')}: ${t(item.color)}`].filter(Boolean).join(', ');

  const changeQty = (qty) => dispatch(updateCartQty({ itemId: item._id, qty })).unwrap().catch((e) => toast.error(t(e.message)));
  const remove = () =>
    dispatch(removeFromCart(item._id)).unwrap()
      .then(() => toast.success(t('Item removed from cart')))
      .catch((e) => toast.error(t(e.message)))
      .finally(() => setConfirm(false));

  return (
    <div className={`flex gap-4 border-b px-4 py-5 last:border-0 sm:px-6 ${pending ? 'opacity-60' : ''}`}>
      <div className="flex w-20 shrink-0 flex-col items-center gap-3 sm:w-28">
        <Link to={`/product/${p.slug || p._id}`}><LazyImage src={p.images?.[0]} alt={p.name} className="h-20 w-20 sm:h-28 sm:w-28" /></Link>
        {!compact && <QtySelector qty={item.qty} max={max} onChange={changeQty} disabled={pending || max <= 0} />}
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${p.slug || p._id}`} className="line-clamp-2 text-sm hover:text-primary sm:text-base">{p.name}</Link>
        {variant && <p className="mt-1 text-xs text-muted">{variant}</p>}
        <p className="mt-1 text-xs text-muted">{t('Seller')}: JholaRetail</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          {p.discount > 0 && <span className="text-sm text-muted line-through">{formatPrice(p.mrp * item.qty)}</span>}
          <span className="text-lg font-semibold">{formatPrice(p.price * item.qty)}</span>
          {p.discount > 0 && <span className="text-sm font-semibold text-success">{t('{n}% off', { n: p.discount })}</span>}
        </div>
        {compact && <p className="mt-1 text-sm">{t('Qty')}: {formatNumber(item.qty)}</p>}
        {p.stock <= 0 ? (
          <p className="mt-1 text-xs font-semibold text-[#ff6161]">{t('Out of stock — please remove to continue')}</p>
        ) : item.qty > p.stock ? (
          <p className="mt-1 text-xs font-semibold text-[#ff6161]">{t('Only {n} left in stock', { n: p.stock })}</p>
        ) : null}
        {!compact && (
          <div className="mt-3 flex gap-6 text-sm font-semibold uppercase">
            <button onClick={() => setConfirm(true)} disabled={pending} className="hover:text-primary">{t('Remove')}</button>
          </div>
        )}
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('Remove Item')}
        actions={<><button onClick={() => setConfirm(false)} className="btn-outline">{t('Cancel')}</button><button onClick={remove} className="btn-primary">{t('Remove')}</button></>}
      >
        <p className="text-sm text-muted">{t('Are you sure you want to remove this item?')}</p>
      </Modal>
    </div>
  );
}

export default function Cart() {
  const t = useT();
  const { districtName } = useLocations();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { token, user } = useSelector((s) => s.auth);
  const summary = summarizeCart(items);
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const district = defaultAddress?.district || loadJSON(DISTRICT_KEY, '');
  const blocked = items.some((i) => i.product.stock <= 0 || i.qty > i.product.stock);

  const placeOrder = () => {
    if (blocked) return toast.error(t('Some items are unavailable. Please update your cart.'));
    if (!token) {
      toast(t('Please log in to place your order'), { icon: '🔐' });
      return navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
    navigate('/checkout');
  };

  if (loading && !items.length) return <PageLoader />;

  if (!items.length) {
    return (
      <div className="container-page py-3">
        <div className="card flex flex-col items-center px-4 py-14 text-center">
          <BagIcon className="h-32 w-32" bag="#e0ebff" handle="#2874f0" smile="#2874f0" />
          <h1 className="mt-4 text-lg font-semibold">{t('Your cart is empty!')}</h1>
          <p className="mt-1 text-sm text-muted">{t(token ? 'Add items to it now.' : 'Login to see the items you added previously.')}</p>
          <div className="mt-6 flex gap-3">
            {!token && <Link to="/login" state={{ from: { pathname: '/cart' } }} className="btn-buy px-10">{t('Login')}</Link>}
            <Link to="/" className="btn-primary px-10">{t('Shop now')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-2 pb-20 md:py-3 md:pb-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_380px]">
        <div className="card self-start">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
            <h1 className="text-lg font-semibold">{t('My Cart ({n})', { n: summary.count })}</h1>
            <span className="flex items-center gap-1.5 text-sm">
              <FiMapPin className="text-primary" />
              {district ? <>{t('Deliver to')} <b>{districtName(district)}</b></> : <span className="text-muted">{t('Choose district at checkout')}</span>}
            </span>
          </div>
          {items.map((item) => <CartLine key={item._id} item={item} />)}
          <div className="sticky bottom-0 hidden justify-end border-t bg-white px-6 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:flex">
            <button onClick={placeOrder} className="btn-buy px-14 py-4 text-base">{t('Place Order')}</button>
          </div>
        </div>
        <PriceDetails summary={summary} className="lg:sticky lg:top-[120px] lg:self-start" />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t bg-white px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
        <div>
          <p className="text-xs text-muted line-through">{formatPrice(summary.itemsMrp)}</p>
          <p className="text-lg font-semibold">{formatPrice(summary.totalPrice)}</p>
        </div>
        <button onClick={placeOrder} className="btn-buy px-8 py-3">{t('Place Order')}</button>
      </div>
    </div>
  );
}
