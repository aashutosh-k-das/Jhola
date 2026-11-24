import { FiMinus, FiPlus } from 'react-icons/fi';
import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

export default function QtySelector({ qty, max = 10, onChange, disabled }) {
  const t = useT();
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(qty - 1)}
        disabled={disabled || qty <= 1}
        aria-label={t('Decrease quantity')}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white transition hover:border-primary disabled:opacity-40"
      >
        <FiMinus size={14} />
      </button>
      <span className="flex h-7 w-11 items-center justify-center border border-gray-300 bg-white text-sm font-semibold" aria-live="polite">{formatNumber(qty)}</span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={disabled || qty >= max}
        aria-label={t('Increase quantity')}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white transition hover:border-primary disabled:opacity-40"
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
}
