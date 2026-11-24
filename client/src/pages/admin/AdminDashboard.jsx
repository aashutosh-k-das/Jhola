import { Link } from 'react-router-dom';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { PageLoader } from '../../components/Loader';
import { formatDate, formatNumber, formatPrice, PAYMENT_LABELS } from '../../utils/format';
import SalesChart from './SalesChart';
import { StatusBadge } from './AdminOrders';

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="card min-w-0 p-3 sm:p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted"><Icon className="text-primary" /> {label}</p>
      <p className="mt-2 break-words text-lg font-semibold sm:text-2xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

const STATUSES = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminDashboard() {
  const { data: s, loading, error, reload } = useFetch('/admin/stats');
  if (loading && !s) return <PageLoader />;
  if (error) return <div className="card p-8 text-center"><p className="text-muted">{error}</p><button onClick={reload} className="btn-primary mt-3">Retry</button></div>;

  const maxMethod = Math.max(1, ...s.byMethod.map((m) => m.revenue));
  const totalOrders = STATUSES.reduce((n, k) => n + (s.byStatus[k] || 0), 0);

  return (
    <div className="space-y-3">
      <h1 className="px-1 text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Tile icon={FiTrendingUp} label="Revenue" value={formatPrice(s.revenue)} sub={`${formatNumber(s.units)} items sold`} />
        <Tile icon={FiShoppingBag} label="Orders" value={formatNumber(s.orders)} sub={`Avg. ${formatPrice(s.avgOrder)} per order`} />
        <Tile icon={FiUsers} label="Customers" value={formatNumber(s.customers)} sub={`${formatNumber(s.newCustomers)} joined in 14 days`} />
        <Tile icon={FiAlertTriangle} label="Low stock" value={formatNumber(s.lowStock.length)} sub={`${formatNumber(s.lowStock.filter((p) => p.stock === 0).length)} out of stock`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <SalesChart data={s.daily} />
        <div className="card p-4 sm:p-5">
          <h2 className="mb-3 font-semibold">Orders by status</h2>
          <ul className="space-y-2.5 text-sm">
            {STATUSES.map((k) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <StatusBadge status={k} />
                <span className="font-semibold tabular-nums">{formatNumber(s.byStatus[k] || 0)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t pt-2 text-muted"><span>Total</span><span className="tabular-nums">{formatNumber(totalOrders)}</span></li>
          </ul>
          <h2 className="mb-3 mt-6 font-semibold">Revenue by payment method</h2>
          <ul className="space-y-3 text-sm">
            {s.byMethod.map((m) => (
              <li key={m.method}>
                <div className="flex justify-between gap-2"><span>{PAYMENT_LABELS[m.method]}</span><span className="text-muted">{formatPrice(m.revenue)} · {formatNumber(m.count)}</span></div>
                <div className="mt-1 h-2 rounded-full bg-page"><div className="h-2 rounded-full bg-primary" style={{ width: `${(m.revenue / maxMethod) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Recent orders</h2><Link to="/admin/orders" className="text-xs font-semibold text-primary">View all</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody>
                {s.recent.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{o.orderId}</td>
                    <td className="py-2.5"><p className="font-medium">{o.user?.name}</p><p className="text-xs text-muted">{o.shippingAddress?.district}</p></td>
                    <td className="py-2.5 text-xs text-muted">{formatDate(o.createdAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</td>
                    <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Low stock</h2><Link to="/admin/products?sort=stock" className="text-xs font-semibold text-primary">Restock</Link></div>
          <ul className="divide-y">
            {s.lowStock.length === 0 && <li className="p-4 text-sm text-muted">All products are well stocked.</li>}
            {s.lowStock.map((p) => (
              <li key={p._id} className="flex items-center gap-3 px-4 py-2">
                <img src={p.images?.[0]} alt="" className="h-9 w-9 shrink-0 object-contain" />
                <span className="line-clamp-1 flex-1 text-sm">{p.name}</span>
                <span className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${p.stock === 0 ? 'bg-[#ff6161]/10 text-[#d43f3f]' : 'bg-accent/10 text-[#9a5b00]'}`}>{p.stock === 0 ? 'Out' : `${formatNumber(p.stock)} left`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="border-b px-4 py-3 font-semibold">Top products by revenue</h2>
        <ul className="divide-y">
          {s.topProducts.map((p, i) => (
            <li key={p._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="w-5 text-muted">{formatNumber(i + 1)}</span>
              <img src={p.image} alt="" className="h-9 w-9 shrink-0 object-contain" />
              <span className="line-clamp-1 flex-1">{p.name}</span>
              <span className="text-muted">{formatNumber(p.units)} sold</span>
              <span className="w-28 text-right font-semibold">{formatPrice(p.revenue)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
