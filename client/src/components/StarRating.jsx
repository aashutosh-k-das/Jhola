import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

export function ratingColor(value) {
  if (value >= 3) return 'bg-rating';
  if (value >= 2) return 'bg-accent';
  return 'bg-[#ff6161]';
}

/** Compact green "4.3 ★" badge used on cards. */
export function RatingBadge({ value = 0, className = '' }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-[3px] px-1.5 py-[1px] text-xs font-semibold text-white ${ratingColor(value)} ${className}`}>
      {formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <FaStar size={9} />
    </span>
  );
}

/** Read-only star row with fractional fill. */
export function Stars({ value = 0, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <FaStar size={size} className="absolute inset-0 text-gray-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <FaStar size={size} className="text-accent" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const LABELS = ['', 'Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'];

/** Interactive star picker for writing reviews. */
export function StarInput({ value, onChange, size = 30 }) {
  const t = useT();
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label={t('Rating')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={t('{n} star', { n })}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="transition hover:scale-110"
          >
            <FaStar size={size} className={n <= shown ? (shown >= 3 ? 'text-rating' : shown === 2 ? 'text-accent' : 'text-[#ff6161]') : 'text-gray-200'} />
          </button>
        ))}
      </div>
      {shown > 0 && <span className="text-sm font-semibold text-muted">{t(LABELS[shown])}</span>}
    </div>
  );
}
