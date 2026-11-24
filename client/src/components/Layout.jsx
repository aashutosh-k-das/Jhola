import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';

// Pages with their own sticky mobile action bar hide the bottom nav.
const OWN_ACTION_BAR = /^\/(product|cart|checkout)(\/|$)/;

export default function Layout() {
  const { pathname } = useLocation();
  const hideBottomNav = OWN_ACTION_BAR.test(pathname);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {!/^\/(checkout|login|signup|admin)/.test(pathname) && <CategoryBar variant={pathname === '/' ? 'home' : 'compact'} />}
      <main className="flex-1">
        <Outlet />
      </main>
      <div className={hideBottomNav ? 'pb-16 md:pb-0' : 'pb-14 md:pb-0'}>
        <Footer />
      </div>
      {!hideBottomNav && <BottomNav />}
      <MobileDrawer />
    </div>
  );
}
