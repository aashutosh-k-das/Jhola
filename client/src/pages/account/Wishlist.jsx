import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import { toggleWishlist } from '../../redux/wishlistSlice';
import { addToCart } from '../../redux/cartSlice';
import { RatingBadge } from '../../components/StarRating';
import LazyImage from '../../components/LazyImage';
import { formatPrice, formatNumber } from '../../utils/format';
import { useT } from '../../i18n';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.wishlist.items);
  const t = useT();

  const remove = (p) => dispatch(toggleWishlist(p)).unwrap().then(() => toast.success(t('Removed from your Wishlist'))).catch((e) => toast.error(t(e.message)));
  const moveToCart = async (p) => {
    try {
      await dispatch(addToCart({ product: p, qty: 1, color: p.variants?.colors?.[0]?.name || '' })).unwrap();
      await dispatch(toggleWishlist(p)).unwrap();
      toast.success(t('Moved to cart'));
    } catch (e) {
      toast.error(t(e.message === 'Please select a size' ? 'Please choose a size on the product page' : e.message));
      if (e.message === 'Please select a size') navigate(`/product/${p.slug || p._id}`);
    }
  };

  return (
    <div className="card">
      <h1 className="border-b px-5 py-4 text-lg font-semibold">{t('My Wishlist ({n})', { n: items.length })}</h1>
      {!items.length && (
        <div className="flex flex-col items-center p-12 text-center">
          <p className="font-semibold">{t('Empty Wishlist')}</p>
          <p className="mt-1 text-sm text-muted">{t('You have no items in your wishlist. Start adding!')}</p>
          <Link to="/" className="btn-primary mt-4">{t('Explore products')}</Link>
        </div>
      )}
      <ul className="divide-y">
        {items.map((p) => (
          <li key={p._id} className="flex gap-4 px-5 py-4">
            <Link to={`/product/${p.slug || p._id}`} className="shrink-0"><LazyImage src={p.images?.[0]} alt={p.name} className="h-20 w-20 sm:h-24 sm:w-24" /></Link>
            <div className="min-w-0 flex-1">
              <Link to={`/product/${p.slug || p._id}`} className="line-clamp-2 text-sm hover:text-primary sm:text-base">{p.name}</Link>
              <div className="mt-1 flex items-center gap-2"><RatingBadge value={p.rating} /><span className="text-xs text-muted">({formatNumber(p.numReviews)})</span></div>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-semibold">{formatPrice(p.price)}</span>
                {p.discount > 0 && <><span className="text-sm text-muted line-through">{formatPrice(p.mrp)}</span><span className="text-sm font-semibold text-success">{t('{n}% off', { n: p.discount })}</span></>}
              </div>
              {p.stock > 0 ? (
                <button onClick={() => moveToCart(p)} className="mt-2 text-xs font-semibold uppercase text-primary">{t('Move to cart')}</button>
              ) : (
                <p className="mt-2 text-xs font-semibold text-[#ff6161]">{t('Currently unavailable')}</p>
              )}
            </div>
            <button onClick={() => remove(p)} aria-label={t('Remove')} className="self-start p-2 text-gray-400 hover:text-ink"><FiTrash2 /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
