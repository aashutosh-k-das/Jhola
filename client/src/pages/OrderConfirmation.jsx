import { Link, useParams } from 'react-router-dom';
import { FiCheck, FiTruck, FiMapPin, FiCreditCard } from 'react-icons/fi';
import useFetch from '../hooks/useFetch';
import { PageLoader } from '../components/Loader';
import { formatDate, formatPrice, formatNumber, PAYMENT_LABELS } from '../utils/format';
import { useT } from '../i18n';
import useLocations from '../hooks/useLocations';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, loading, error } = useFetch(`/orders/${id}`);
  const t = useT();
  const { formatAddress } = useLocations();

  if (loading) return <PageLoader />;
  if (error || !order) {
    return <div className="container-page py-4"><div className="card p-10 text-center">{t(error || 'Order not found')}</div></div>;
  }

  const placed = order.status !== 'Payment Pending';

  return (
    <div className="container-page max-w-4xl space-y-3 py-3">
      <div className="card overflow-hidden">
        <div className={`flex flex-col items-center px-4 py-8 text-center text-white ${placed ? 'bg-gradient-to-br from-success to-[#26a541]' : 'bg-accent'}`}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-success animate-pop">
            <FiCheck size={36} strokeWidth={3} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{t(placed ? 'Order Placed Successfully!' : 'Awaiting Payment')}</h1>
          <p className="mt-1 text-sm text-white/90">{placed ? `${t('Thank you for shopping with Jhola.')} ${t('Apni Marzi, Apni Shopping')}!` : t('We have not received your payment yet.')}</p>
        </div>
        <div className="grid gap-4 p-5 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted">{t('Order ID')}</p>
            <p className="mt-0.5 font-mono text-base font-semibold">{order.orderId}</p>
            <p className="text-xs text-muted">{t('Placed on {date}', { date: formatDate(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) })}</p>
          </div>
          <div className="flex gap-2">
            <FiTruck className="mt-0.5 shrink-0 text-primary" size={18} />
            <div>
              <p className="text-xs uppercase text-muted">{t('Estimated delivery')}</p>
              <p className="mt-0.5 text-base font-semibold text-success">{formatDate(order.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <FiCreditCard className="mt-0.5 shrink-0 text-primary" size={18} />
            <div>
              <p className="text-xs uppercase text-muted">{t('Payment')}</p>
              <p className="mt-0.5 font-semibold">{t(PAYMENT_LABELS[order.paymentMethod])}</p>
              <p className={`text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'text-success' : 'text-[#9a5b00]'}`}>
                {order.paymentMethod === 'COD' ? t('Pay {amount} on delivery', { amount: formatPrice(order.totalPrice) }) : t(order.paymentStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_300px]">
        <div className="card">
          <h2 className="border-b px-5 py-3 font-semibold">{t('Items in this order ({n})', { n: order.items.length })}</h2>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={`${it.product}-${it.size}-${it.color}`} className="flex gap-4 px-5 py-4">
                <img src={it.image} alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1 text-sm">
                  <Link to={`/product/${it.product}`} className="line-clamp-2 hover:text-primary">{it.name}</Link>
                  <p className="text-xs text-muted">{[it.size && `${t('Size')} ${it.size}`, it.color && t(it.color), `${t('Qty')} ${formatNumber(it.qty)}`].filter(Boolean).join(' · ')}</p>
                </div>
                <p className="font-semibold">{formatPrice(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <div className="card p-5 text-sm">
            <p className="mb-2 flex items-center gap-2 font-semibold"><FiMapPin className="text-primary" /> {t('Delivery Address')}</p>
            <p className="font-semibold">{order.shippingAddress.name}</p>
            <p>{formatAddress(order.shippingAddress)}</p>
            <p className="mt-1">{t('Phone')}: {order.shippingAddress.phone}</p>
          </div>
          <div className="card space-y-2 p-5 text-sm">
            <div className="flex justify-between"><span>{t('Items total')}</span><span>{formatPrice(order.itemsMrp)}</span></div>
            <div className="flex justify-between text-success"><span>{t('Discount')}</span><span>− {formatPrice(order.discount)}</span></div>
            <div className="flex justify-between"><span>{t('Delivery')}</span><span>{order.deliveryCharge ? formatPrice(order.deliveryCharge) : <span className="text-success">{t('Free')}</span>}</span></div>
            <div className="flex justify-between border-t border-dashed pt-2 text-base font-semibold"><span>{t('Order Total')}</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/" className="btn-primary px-10">{t('Continue Shopping')}</Link>
        <Link to={`/account/orders/${order._id}`} className="btn-outline px-10">{t('Track Order')}</Link>
      </div>
    </div>
  );
}
