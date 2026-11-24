import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaHeart } from 'react-icons/fa';
import { selectIsWishlisted, toggleWishlist } from '../redux/wishlistSlice';
import { useT } from '../i18n';

export default function WishlistButton({ product, className = '', size = 16, bordered = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const active = useSelector(selectIsWishlisted(product._id));
  const t = useT();

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product))
      .unwrap()
      .then((r) => toast.success(t(r.added ? 'Added to your Wishlist' : 'Removed from your Wishlist')))
      .catch((err) => {
        toast.error(t(err.message));
        if (err.name === 'AUTH_REQUIRED') navigate('/login', { state: { from: location } });
      });
  };

  return (
    <button
      onClick={onClick}
      aria-label={t(active ? 'Remove from wishlist' : 'Add to wishlist')}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-full transition active:scale-90 ${bordered ? 'h-9 w-9 border border-gray-200 bg-white shadow-card' : ''} ${className}`}
    >
      <FaHeart size={size} className={`transition ${active ? 'text-[#ff4343]' : 'text-gray-300 hover:text-gray-400'}`} style={active ? undefined : { filter: 'drop-shadow(0 0 1px rgba(0,0,0,.2))' }} />
    </button>
  );
}
