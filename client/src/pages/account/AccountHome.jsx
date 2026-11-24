import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiChevronRight, FiLogOut } from 'react-icons/fi';
import { ACCOUNT_LINKS, useLogout } from './AccountLayout';
import Profile from './Profile';
import { useT } from '../../i18n';

/** Mobile: Flipkart-style account menu. Desktop: profile information. */
export default function AccountHome() {
  const user = useSelector((s) => s.auth.user);
  const doLogout = useLogout();
  const t = useT();
  return (
    <>
      <div className="space-y-2 md:hidden">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{user.name[0]?.toUpperCase()}</span>
          <div>
            <p className="font-semibold">{t('Hey! {name}', { name: user.name })}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_LINKS.slice(0, 4).map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="card flex items-center gap-2 p-3 text-sm font-medium">
              <Icon className="text-primary" /> {t(label === 'Profile Information' ? 'Profile' : label)}
            </Link>
          ))}
        </div>
        <div className="card">
          {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 border-b px-4 py-3.5 text-sm">
              <Icon className="text-primary" /> <span className="flex-1">{t(label)}</span> <FiChevronRight className="text-muted" />
            </Link>
          ))}
          <button onClick={doLogout} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm">
            <FiLogOut className="text-primary" /> {t('Logout')}
          </button>
        </div>
      </div>
      <div className="hidden md:block"><Profile /></div>
    </>
  );
}
