import { FiShield } from 'react-icons/fi';
import { formatPrice } from '../utils/format';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../utils/pricing';
import { useT } from '../i18n';

export default function PriceDetails({ summary, className = '' }) {
  const t = useT();
  const { count, itemsMrp, discount, deliveryCharge, totalPrice, itemsPrice } = summary;
  return (
    <div className={className}>
      <div className="card">
        <h2 className="border-b px-5 py-3 text-sm font-semibold uppercase tracking-wide text-muted">{t('Price Details')}</h2>
        <dl className="space-y-4 px-5 py-4 text-[15px]">
          <div className="flex justify-between">
            <dt>{t(count === 1 ? 'Price ({n} item)' : 'Price ({n} items)', { n: count })}</dt>
            <dd>{formatPrice(itemsMrp)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t('Discount')}</dt>
            <dd className="text-success">− {formatPrice(discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t('Delivery Charges')}</dt>
            <dd>
              {deliveryCharge ? formatPrice(deliveryCharge) : (
                <><span className="mr-1 text-muted line-through">{formatPrice(DELIVERY_CHARGE)}</span><span className="text-success">{t('Free')}</span></>
              )}
            </dd>
          </div>
          <div className="flex justify-between border-y border-dashed py-4 text-lg font-semibold">
            <dt>{t('Total Amount')}</dt>
            <dd>{formatPrice(totalPrice)}</dd>
          </div>
          {discount > 0 && <p className="font-semibold text-success">{t('You will save {amount} on this order', { amount: formatPrice(discount + (deliveryCharge ? 0 : DELIVERY_CHARGE)) })}</p>}
          {deliveryCharge > 0 && (
            <p className="text-xs text-muted">{t('Add items worth {amount} more for FREE delivery', { amount: formatPrice(FREE_DELIVERY_THRESHOLD - itemsPrice) })}</p>
          )}
        </dl>
      </div>
      <p className="mt-3 flex items-center gap-2 px-2 text-xs font-semibold text-muted">
        <FiShield size={22} className="shrink-0" /> {t('Safe and Secure Payments. Easy returns. 100% Authentic products.')}
      </p>
    </div>
  );
}
