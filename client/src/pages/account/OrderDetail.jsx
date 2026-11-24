import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { PageLoader } from '../../components/Loader';
import { formatDate, formatDateTime, formatPrice, formatNumber, PAYMENT_LABELS } from '../../utils/format';
import { useT } from '../../i18n';
import useLocations from '../../hooks/useLocations';

const FLOW = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered'];
const LABEL = { Placed: 'Order Confirmed', Shipped: 'Shipped', 'Out for Delivery': 'Out for Delivery', Delivered: 'Delivered' };

function Tracker({ order }) {
  const t = useT();
  const cancelled = order.status === 'Cancelled';
  const steps = cancelled
    ? ['Placed', 'Cancelled']
    : FLOW;
  const reached = (s) => order.statusHistory.find((h) => h.status === s);
  const currentIdx = cancelled ? 1 : FLOW.indexOf(order.status);

  return (
    <ol className="relative flex flex-col gap-6 sm:flex-row sm:gap-0">
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        const color = cancelled && i === 1 ? 'bg-[#ff6161]' : done ? 'bg-success' : 'bg-gray-200';
        const hist = reached(s);
        return (
          <li key={s} className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            {i > 0 && (
              <span className={`absolute -top-6 left-[9px] h-6 w-0.5 sm:-left-1/2 sm:top-[9px] sm:h-0.5 sm:w-full ${done ? (cancelled ? 'bg-[#ff6161]' : 'bg-success') : 'bg-gray-200'}`} />
            )}
            <span className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${color}`}>
              {cancelled && i === 1 ? <FiX size={12} /> : done ? <FiCheck size={12} /> : null}
            </span>
            <div className="text-sm">
              <p className={`font-semibold ${done ? '' : 'text-muted'}`}>{t(s === 'Cancelled' ? 'Cancelled' : LABEL[s])}</p>
              <p className="text-xs text-muted">
                {hist ? formatDateTime(hist.date) : s === 'Delivered' ? t('Expected by {date}', { date: formatDate(order.estimatedDelivery) }) : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, loading, error, setData } = useFetch(`/orders/${id}`);
  const [confirm, setConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const t = useT();
  const { formatAddress } = useLocations();

  if (loading) return <PageLoader />;
  if (error || !order) return <div className="card p-8 text-center text-muted">{t(error || 'Order not found')}</div>;

  const cancellable = ['Placed', 'Shipped'].includes(order.status);
  const a = order.shippingAddress;

  const cancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${order._id}/cancel`);
      setData(data);
      toast.success(t(data.paymentStatus === 'Refunded' ? 'Order cancelled. Refund initiated.' : 'Order cancelled'));
    } catch (e) {
      toast.error(t(e.message));
    } finally {
      setCancelling(false);
      setConfirm(false);
    }
  };

  return (
    <div className="space-y-2">
      <nav className="px-1 text-xs text-muted"><Link to="/account/orders" className="hover:text-primary">{t('My Orders')}</Link> › <span className="font-mono">{order.orderId}</span></nav>

      <div className="card grid gap-5 p-5 text-sm md:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold">{t('Delivery Address')}</p>
          <p className="font-semibold">{a.name}</p>
          <p>{formatAddress(a)}</p>
          <p className="mt-1"><b>{t('Phone')}</b> {a.phone}</p>
        </div>
        <div className="md:border-l md:pl-5">
          <p className="mb-2 font-semibold">{t('Payment')}</p>
          <p>{t(PAYMENT_LABELS[order.paymentMethod])}</p>
          <p className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-success' : order.paymentStatus === 'Refunded' ? 'text-primary' : 'text-[#9a5b00]'}`}>
            {t(order.paymentMethod === 'COD' && order.paymentStatus === 'Pending' ? 'Pay on delivery' : order.paymentStatus)}
          </p>
          {order.paymentResult?.paymentId && <p className="mt-1 break-all font-mono text-xs text-muted">{order.paymentResult.paymentId}</p>}
        </div>
        <div className="space-y-1 md:border-l md:pl-5">
          <p className="mb-2 font-semibold">{t('Price Details')}</p>
          <div className="flex justify-between"><span>{t('List price')}</span><span className="line-through">{formatPrice(order.itemsMrp)}</span></div>
          <div className="flex justify-between"><span>{t('Selling price')}</span><span>{formatPrice(order.itemsPrice)}</span></div>
          <div className="flex justify-between"><span>{t('Delivery')}</span><span>{order.deliveryCharge ? formatPrice(order.deliveryCharge) : t('Free')}</span></div>
          <div className="flex justify-between border-t border-dashed pt-1 font-semibold"><span>{t('Total')}</span><span>{formatPrice(order.totalPrice)}</span></div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-semibold">{t('Track Order')}</h1>
          {cancellable && <button onClick={() => setConfirm(true)} className="btn-outline px-4 py-2 text-xs">{t('Cancel Order')}</button>}
        </div>
        <Tracker order={order} />
      </div>

      <div className="card divide-y">
        {order.items.map((it) => (
          <div key={`${it.product}-${it.size}-${it.color}`} className="flex gap-4 p-4">
            <img src={it.image} alt="" className="h-20 w-20 shrink-0 object-contain" />
            <div className="min-w-0 flex-1 text-sm">
              <Link to={`/product/${it.product}`} className="line-clamp-2 hover:text-primary">{it.name}</Link>
              <p className="mt-1 text-xs text-muted">{[it.brand, it.color && t(it.color), it.size && `${t('Size')} ${it.size}`, `${t('Qty')} ${formatNumber(it.qty)}`].filter(Boolean).join(' · ')}</p>
              <p className="mt-1 font-semibold">{formatPrice(it.price * it.qty)}</p>
            </div>
            {order.status === 'Delivered' && (
              <Link to={`/product/${it.product}#reviews`} className="self-center text-xs font-semibold text-primary">★ {t('Rate & Review')}</Link>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('Cancel this order?')}
        actions={<><button onClick={() => setConfirm(false)} className="btn-outline">{t('Keep Order')}</button><button onClick={cancel} disabled={cancelling} className="btn-buy">{t(cancelling ? 'Cancelling…' : 'Yes, Cancel')}</button></>}
      >
        <p className="text-sm text-muted">
          {order.paymentStatus === 'Paid' ? t('A refund of {amount} will be initiated to your original payment method.', { amount: formatPrice(order.totalPrice) }) : t('This action cannot be undone.')}
        </p>
      </Modal>
    </div>
  );
}
