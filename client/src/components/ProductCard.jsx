import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import WishlistButton from './WishlistButton';
import { RatingBadge } from './StarRating';
import { formatPrice } from '../utils/format';
import { FREE_DELIVERY_THRESHOLD } from '../utils/pricing';
import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

/** Grid card for listings. `compact` is the narrower home-carousel tile. */
export default function ProductCard({ product: p, compact = false }) {
  const t = useT();
  const to = `/product/${p.slug || p._id}`;
  const outOfStock = p.stock === 0;

  if (compact) {
    return (
      <Link to={to} className="group flex w-36 shrink-0 snap-start flex-col items-center rounded-sm border border-gray-100 bg-white p-3 text-center transition hover:shadow-pop sm:w-44">
        <LazyImage src={p.images?.[0]} alt={p.name} className="h-28 w-28 sm:h-36 sm:w-36" imgClassName="transition-transform group-hover:scale-105" />
        <p className="mt-3 line-clamp-1 w-full text-sm font-medium group-hover:text-primary">{p.name}</p>
        <p className="mt-1 text-sm font-semibold text-success">{p.discount ? t('Min. {n}% Off', { n: p.discount }) : formatPrice(p.price)}</p>
        <p className="mt-0.5 text-xs text-muted">{formatPrice(p.price)} <span className="line-through">{p.discount ? formatPrice(p.mrp) : ''}</span></p>
      </Link>
    );
  }

  return (
    <Link to={to} className="group relative flex flex-col bg-white p-3 transition hover:z-10 hover:shadow-pop sm:p-4">
      <WishlistButton product={p} className="absolute right-3 top-3 z-10 h-8 w-8" />
      <LazyImage
        src={p.images?.[0]}
        alt={p.name}
        className={`mx-auto aspect-square w-full max-w-[220px] ${outOfStock ? 'opacity-50' : ''}`}
        imgClassName="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{p.brand}</p>
        <h3 className="line-clamp-2 text-sm leading-snug group-hover:text-primary">{p.name}</h3>
        {p.rating > 0 && (
          <div className="flex items-center gap-2">
            <RatingBadge value={p.rating} />
            <span className="text-xs font-semibold text-muted">({formatNumber(p.numReviews)})</span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-base font-semibold">{formatPrice(p.price)}</span>
          {p.discount > 0 && (
            <>
              <span className="text-xs text-muted line-through">{formatPrice(p.mrp)}</span>
              <span className="text-xs font-semibold text-success">{t('{n}% off', { n: p.discount })}</span>
            </>
          )}
        </div>
        {outOfStock ? (
          <p className="text-xs font-semibold text-[#ff6161]">{t('Currently out of stock')}</p>
        ) : p.price >= FREE_DELIVERY_THRESHOLD ? (
          <p className="text-xs text-muted">{t('Free delivery')}</p>
        ) : p.stock <= 5 ? (
          <p className="text-xs font-medium text-[#ff6161]">{t('Only {n} left', { n: p.stock })}</p>
        ) : null}
      </div>
    </Link>
  );
}
