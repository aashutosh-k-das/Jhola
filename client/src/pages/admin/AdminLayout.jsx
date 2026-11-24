import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiExternalLink, FiShield } from 'react-icons/fi';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
];

export default function AdminLayout() {
  const user = useSelector((s) => s.auth.user);

  if (!user?.isAdmin) {
    return (
      <div className="container-page py-6">
        <div className="card mx-auto flex max-w-md flex-col items-center p-10 text-center">
          <FiShield size={40} className="text-muted" />
          <h1 className="mt-3 text-lg font-semibold">Admins only</h1>
          <p className="mt-1 text-sm text-muted">You’re signed in as {user?.email}. Log in with an admin account to open the admin panel.</p>
          <Link to="/" className="btn-primary mt-5">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-2 md:py-3">
      <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
        <aside className="card min-w-0 self-start lg:sticky lg:top-[80px]">
          <div className="hidden items-center gap-2 border-b px-4 py-3 lg:flex">
            <FiShield className="text-primary" />
            <span className="font-semibold">Jhola Admin</span>
          </div>
          <nav className="flex overflow-x-auto no-scrollbar lg:flex-col">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 border-b-2 px-4 py-3 text-sm font-medium transition lg:border-b-0 lg:border-l-4 ${
                    isActive ? 'border-primary bg-primary-light text-primary' : 'border-transparent text-gray-600 hover:text-primary'
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            ))}
            <Link to="/" className="flex shrink-0 items-center gap-3 px-4 py-3 text-sm text-muted hover:text-primary lg:border-t">
              <FiExternalLink /> View store
            </Link>
          </nav>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
