import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPackage, FiUser, FiMapPin, FiHeart, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { logout } from '../../redux/authSlice';
import { useT } from '../../i18n';

export const ACCOUNT_LINKS = [
  { to: '/account/orders', label: 'My Orders', icon: FiPackage },
  { to: '/account/profile', label: 'Profile Information', icon: FiUser },
  { to: '/account/addresses', label: 'Manage Addresses', icon: FiMapPin },
  { to: '/account/wishlist', label: 'My Wishlist', icon: FiHeart },
];

export function useLogout() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return () => { dispatch(logout()); toast.success(t('Logged out')); navigate('/'); };
}

export default function AccountLayout() {
  const user = useSelector((s) => s.auth.user);
  const doLogout = useLogout();
  const t = useT();
  if (!user) return null;

  return (
    <div className="container-page py-2 md:py-3">
      <div className="grid gap-3 md:grid-cols-[270px_1fr]">
        <aside className="hidden space-y-3 self-start md:block">
          <div className="card flex items-center gap-3 p-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{user.name[0]?.toUpperCase()}</span>
            <div className="min-w-0">
              <p className="text-xs text-muted">{t('Hello,')}</p>
              <p className="truncate font-semibold">{user.name}</p>
            </div>
          </div>
          <nav className="card">
            {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `flex items-center gap-4 border-b px-5 py-4 text-sm font-semibold uppercase transition hover:text-primary ${isActive ? 'bg-primary-light text-primary' : 'text-muted'}`}
              >
                <Icon className="text-primary" size={18} /> <span className="flex-1">{t(label)}</span> <FiChevronRight />
              </NavLink>
            ))}
            <button onClick={doLogout} className="flex w-full items-center gap-4 px-5 py-4 text-sm font-semibold uppercase text-muted hover:text-primary">
              <FiLogOut className="text-primary" size={18} /> {t('Logout')}
            </button>
          </nav>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
