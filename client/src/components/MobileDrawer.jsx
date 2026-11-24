import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiChevronRight, FiPackage, FiHeart, FiUser, FiShoppingCart, FiMapPin, FiLogOut, FiHome, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCategories from '../hooks/useCategories';
import { closeDrawer } from '../redux/uiSlice';
import { logout } from '../redux/authSlice';
import { BagIcon } from './Logo';
import LanguageToggle from './LanguageToggle';
import { useLang } from '../i18n';

export default function MobileDrawer() {
  const open = useSelector((s) => s.ui.drawerOpen);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const categories = useCategories();
  const { lang, t } = useLang();

  useEffect(() => { dispatch(closeDrawer()); }, [pathname, search, dispatch]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const close = () => dispatch(closeDrawer());

  const links = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/account/orders', label: 'My Orders', icon: FiPackage },
    { to: '/account/wishlist', label: 'My Wishlist', icon: FiHeart },
    { to: '/cart', label: 'My Cart', icon: FiShoppingCart },
    { to: '/account/addresses', label: 'Saved Addresses', icon: FiMapPin },
    { to: '/account', label: 'My Account', icon: FiUser },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin Dashboard', icon: FiShield }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t('Menu')}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={close} />
      <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col overflow-y-auto bg-white shadow-xl animate-slide-right">
        <div className="flex items-center gap-3 bg-primary px-4 py-4 text-white">
          <BagIcon className="h-9 w-9" />
          <div className="flex-1">
            {user ? (
              <>
                <p className="text-xs opacity-80">{t('Hello,')}</p>
                <p className="font-semibold">{user.name}</p>
              </>
            ) : (
              <Link to="/login" className="font-semibold">{t('Login & Signup')}</Link>
            )}
          </div>
          <button onClick={close} aria-label={t('Close menu')} className="p-1"><FiX size={22} /></button>
        </div>

        <p className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('Shop by Category')}</p>
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to={`/category/${c.slug}`} className="flex items-center gap-3 px-4 py-2.5 active:bg-page">
                <img src={c.image} alt="" className="h-8 w-8 rounded-full bg-page object-contain p-0.5" />
                <span className="flex-1 font-medium">{lang === 'ne' ? c.nameNe : c.name}</span>
                <FiChevronRight className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-2" />
        <ul>
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-3 px-4 py-2.5 active:bg-page">
                <Icon className="text-primary" size={18} /> {t(label)}
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <button
                onClick={() => { dispatch(logout()); close(); toast.success(t('Logged out')); navigate('/'); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-page"
              >
                <FiLogOut className="text-primary" size={18} /> {t('Logout')}
              </button>
            </li>
          )}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-2 px-4 py-4">
          <p className="text-xs italic text-muted">{t('Jhola')} — {t('Apni Marzi, Apni Shopping')}</p>
          <LanguageToggle variant="dark" />
        </div>
      </aside>
    </div>
  );
}
