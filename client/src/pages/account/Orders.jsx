import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { PageLoader } from '../../components/Loader';
import { formatDate, formatPrice, formatNumber } from '../../utils/format';
import { useT } from '../../i18n';

export const STATUS_STYLE = {
  Placed: 'bg-primary',
  Shipped: 'bg-accent',
  'Out for Delivery': 'bg-accent',
  Delivered: 'bg-success',
  Cancelled: 'bg-[#ff6161]',
  'Payment Pending': 'bg-gray-400',
};

export function statusLine(order, t) {
  if (order.status === 'Delivered') {
    const d = order.statusHistory.find((h) => h.status === 'Delivered')?.date || order.estimatedDelivery;
    return t('Delivered on {date}', { date: formatDate(d) });
  }
  if (order.status === 'Cancelled') return t('Cancelled');
  return `${t(order.status)} · ${t('Expected by {date}', { date: formatDate(order.estimatedDelivery) })}`;
}

const FILTERS = [
  ['all', 'All'],
  ['active', 'On the way'],
  ['Delivered', 'Delivered'],
  ['Cancelled', 'Cancelled'],
];

export default function Orders() {
  const { data: orders, loading, error } = useFetch('/orders');
  const [filter, setFilter] = useState('all');
  const t = useT();

  if (loading) return <PageLoader />;
  if (error) return <div className="card p-8 text-center text-muted">{t(error)}</div>;

  const shown = (orders || []).filter((o) =>
    filter === 'all' ? true : filter === 'active' ? ['Placed', 'Shipped', 'Out for Delivery'].includes(o.status) : o.status === filter
  );

  return (
    <div className="space-y-2">
      <div className="card flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        <h1 className="mr-2 shrink-0 font-semibold">{t('My Orders')}</h1>
        {FILTERS.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${filter === id ? 'border-primary bg-primary-light text-primary' : 'border-gray-200'}`}>
            {t(label)}
          </button>
        ))}
      </div>

      {!shown.length && (
        <div className="card flex flex-col items-center p-12 text-center">
          <p className="font-semibold">{t(orders?.length ? 'No orders match this filter' : 'You have no orders yet')}</p>
          <Link to="/" className="btn-primary mt-4">{t('Start Shopping')}</Link>
        </div>
      )}

      {shown.map((o) => (
        <Link key={o._id} to={`/account/orders/${o._id}`} className="card block transition hover:shadow-pop">
          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted">
            <span>{t('Order')} <b className="font-mono text-ink">{o.orderId}</b> · {formatDate(o.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1 font-semibold text-ink">{formatPrice(o.totalPrice)} <FiChevronRight /></span>
          </div>
          {o.items.map((it) => (
            <div key={`${it.product}-${it.size}-${it.color}`} className="grid grid-cols-[64px_1fr] gap-4 px-4 py-4 sm:grid-cols-[80px_1fr_120px_1fr]">
              <img src={it.image} alt="" loading="lazy" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
              <div className="min-w-0 text-sm">
                <p className="line-clamp-2 hover:text-primary">{it.name}</p>
                <p className="mt-1 text-xs text-muted">{[it.color && `${t('Color')}: ${t(it.color)}`, it.size && `${t('Size')}: ${it.size}`, `${t('Qty')}: ${formatNumber(it.qty)}`].filter(Boolean).join(' · ')}</p>
                <p className="mt-1 text-sm font-semibold sm:hidden">{formatPrice(it.price * it.qty)}</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-medium sm:hidden"><span className={`h-2 w-2 rounded-full ${STATUS_STYLE[o.status]}`} />{statusLine(o, t)}</p>
              </div>
              <p className="hidden text-sm font-medium sm:block">{formatPrice(it.price * it.qty)}</p>
              <div className="hidden text-sm sm:block">
                <p className="flex items-center gap-2 font-medium"><span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE[o.status]}`} />{statusLine(o, t)}</p>
                <p className="mt-1 text-xs text-muted">{t(o.status === 'Delivered' ? 'Your item has been delivered' : o.status === 'Cancelled' ? (o.paymentStatus === 'Refunded' ? 'Refund initiated' : 'Order was cancelled') : 'Your item is on the way')}</p>
              </div>
            </div>
          ))}
        </Link>
      ))}
    </div>
  );
}
