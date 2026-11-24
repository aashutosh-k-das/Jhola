import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiMenu, FiShoppingCart, FiChevronDown, FiUser, FiPackage, FiHeart, FiMapPin, FiLogOut, FiShield } from 'react-icons/fi';
import Logo from './Logo';
import SearchBar from './SearchBar';
import { selectCartCount } from '../redux/cartSlice';
import { openDrawer } from '../redux/uiSlice';
import { logout } from '../redux/authSlice';
import LanguageToggle from './LanguageToggle';
import { useT } from '../i18n';

function UserMenu({ user }) {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = [
    ...(user.isAdmin ? [{ to: '/admin', label: 'Admin Dashboard', icon: FiShield }] : []),
    { to: '/account/profile', label: 'My Profile', icon: FiUser },
    { to: '/account/orders', label: 'Orders', icon: FiPackage },
    { to: '/account/wishlist', label: 'Wishlist', icon: FiHeart },
    { to: '/account/addresses', label: 'Saved Addresses', icon: FiMapPin },
  ];
  return (
    <div className="group relative">
      <Link to="/account" className="flex items-center gap-1 py-2 font-semibold">
        <FiUser className="md:hidden" size={20} />
        <span className="hidden max-w-[120px] truncate md:inline">{user.name.split(' ')[0]}</span>
        <FiChevronDown className="hidden transition group-hover:rotate-180 md:block" />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 max-md:hidden">
        <div className="relative rounded-sm bg-white text-ink shadow-pop">
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="relative flex items-center gap-3 border-b px-4 py-3 text-sm hover:bg-page">
              <Icon className="text-primary" /> {t(label)}
            </Link>
          ))}
          <button
            onClick={() => { dispatch(logout()); toast.success(t('Logged out')); navigate('/'); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-page"
          >
            <FiLogOut className="text-primary" /> {t('Logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const t = useT();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const count = useSelector(selectCartCount);

  return (
    <header className="sticky top-0 z-40 bg-primary text-white shadow-md">
      <div className="container-page flex items-center gap-3 py-2 md:gap-8 md:py-2.5">
        <button onClick={() => dispatch(openDrawer())} className="-ml-1 p-1 md:hidden" aria-label={t('Open menu')}>
          <FiMenu size={22} />
        </button>
        <Logo />
        <div className="hidden max-w-2xl flex-1 md:block">
          <SearchBar />
        </div>
        <nav className="ml-auto flex items-center gap-3 md:gap-6">
          <LanguageToggle className="max-md:px-1.5" />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link to="/login" className="rounded-sm bg-white px-4 py-1 text-sm font-semibold text-primary shadow-sm md:px-10">
              {t('Login')}
            </Link>
          )}
          <Link to="/cart" className="relative flex items-center gap-1.5 font-semibold" aria-label={t('Cart, {n} items', { n: count })}>
            <FiShoppingCart size={22} />
            <span className="hidden md:inline">{t('Cart')}</span>
            {count > 0 && (
              <span className="absolute -left-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-[#ff6161] px-1 text-[10px] font-bold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <div className="px-2 pb-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
