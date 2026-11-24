import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHome, FiGrid, FiUser, FiShoppingCart } from 'react-icons/fi';
import { openDrawer } from '../redux/uiSlice';
import { selectCartCount } from '../redux/cartSlice';
import { useT } from '../i18n';

const item = 'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium';

export default function BottomNav() {
  const t = useT();
  const dispatch = useDispatch();
  const count = useSelector(selectCartCount);
  const cls = ({ isActive }) => `${item} ${isActive ? 'text-primary' : 'text-gray-600'}`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden" aria-label={t('Primary')}>
      <NavLink to="/" end className={cls}><FiHome size={20} />{t('Home')}</NavLink>
      <button onClick={() => dispatch(openDrawer())} className={`${item} text-gray-600`}><FiGrid size={20} />{t('Categories')}</button>
      <NavLink to="/account" className={cls}><FiUser size={20} />{t('Account')}</NavLink>
      <NavLink to="/cart" className={cls}>
        <span className="relative">
          <FiShoppingCart size={20} />
          {count > 0 && (
            <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6161] px-1 text-[9px] font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
        {t('Cart')}
      </NavLink>
    </nav>
  );
}
