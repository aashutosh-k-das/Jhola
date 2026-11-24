import { Fragment, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import api from '../../utils/api';
import Pagination from '../../components/Pagination';
import { Spinner } from '../../components/Loader';
import useDebounce from '../../hooks/useDebounce';
import { formatDate, formatPrice, formatNumber, PAYMENT_LABELS } from '../../utils/format';

const STYLE = {
  Placed: 'bg-primary-light text-primary',
  Shipped: 'bg-accent/10 text-[#9a5b00]',
  'Out for Delivery': 'bg-accent/10 text-[#9a5b00]',
  Delivered: 'bg-success/10 text-success',
  Cancelled: 'bg-[#ff6161]/10 text-[#d43f3f]',
  'Payment Pending': 'bg-page text-muted',
};

export function StatusBadge({ status }) {
  return <span className={`inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold ${STYLE[status] || ''}`}>{status}</span>;
}

const NEXT = { Placed: ['Shipped', 'Cancelled'], Shipped: ['Out for Delivery', 'Cancelled'], 'Out for Delivery': ['Delivered'] };
const FILTERS = ['', 'Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const [q, setQ] = useState(params.get('q') || '');
  const dq = useDebounce(q.trim(), 350);
  const { data, loading, setData } = useFetch(`/admin/orders?status=${encodeURIComponent(status)}&q=${encodeURIComponent(dq)}&page=${page}`);
  const [busy, setBusy] = useState(null);
  const [open, setOpen] = useState(null);

  const set = (k, v) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setParams(n); };

  const change = async (order, next) => {
    if (next === 'Cancelled' && !window.confirm(`Cancel order ${order.orderId}? Stock will be returned${order.paymentStatus === 'Paid' ? ' and the payment marked refunded' : ''}.`)) return;
    setBusy(order._id);
    try {
      const { data: updated } = await api.put(`/admin/orders/${order._id}/status`, { status: next });
      setData({ ...data, orders: data.orders.map((o) => (o._id === updated._id ? updated : o)) });
      toast.success(`${order.orderId} → ${next}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold">Orders {data && <span className="text-sm font-normal text-muted">({formatNumber(data.total)})</span>}</h1>
        <label className="flex items-center gap-2 rounded-sm border px-3 md:w-80">
          <FiSearch className="text-muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); if (page > 1) set('page', ''); }} placeholder="Order ID, customer, email or phone" className="w-full py-2 text-sm outline-none" />
        </label>
      </div>
      <div className="flex gap-2 overflow-x-auto border-b px-4 py-2 no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => set('status', f)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${status === f ? 'border-primary bg-primary-light text-primary' : 'border-gray-200'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-page/60 text-left text-xs uppercase text-muted">
            <tr><th className="px-4 py-2">Order</th><th>Customer</th><th>Items</th><th>Payment</th><th className="text-right">Total</th><th className="pl-4">Status</th><th className="px-4">Update</th></tr>
          </thead>
          <tbody>
            {data?.orders.map((o) => (
              <Fragment key={o._id}>
                <tr className="cursor-pointer border-t hover:bg-page/40" onClick={() => setOpen(open === o._id ? null : o._id)}>
                  <td className="px-4 py-2.5"><p className="font-mono text-xs">{o.orderId}</p><p className="text-xs text-muted">{formatDate(o.createdAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p></td>
                  <td><p className="font-medium">{o.user?.name || o.shippingAddress?.name}</p><p className="text-xs text-muted">{o.shippingAddress?.district} · {o.shippingAddress?.phone}</p></td>
                  <td className="text-xs">{formatNumber(o.items.reduce((n, i) => n + i.qty, 0))} item(s)</td>
                  <td><p className="text-xs">{PAYMENT_LABELS[o.paymentMethod]}</p><p className={`text-xs font-semibold ${o.paymentStatus === 'Paid' ? 'text-success' : 'text-muted'}`}>{o.paymentStatus}</p></td>
                  <td className="text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                  <td className="pl-4"><StatusBadge status={o.status} /></td>
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    {busy === o._id ? <Spinner className="h-4 w-4" /> : NEXT[o.status] ? (
                      <div className="flex gap-1.5">
                        {NEXT[o.status].map((n) => (
                          <button key={n} onClick={() => change(o, n)} className={`whitespace-nowrap rounded-sm border px-2 py-1 text-xs font-semibold ${n === 'Cancelled' ? 'border-[#ff6161]/40 text-[#d43f3f] hover:bg-[#ff6161]/10' : 'border-primary/40 text-primary hover:bg-primary-light'}`}>
                            {n === 'Cancelled' ? 'Cancel' : `Mark ${n}`}
                          </button>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                </tr>
                {open === o._id && (
                  <tr className="bg-page/40">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
                        <ul className="space-y-1.5">
                          {o.items.map((it) => (
                            <li key={`${it.product}-${it.size}-${it.color}`} className="flex items-center gap-3 text-xs">
                              <img src={it.image} alt="" className="h-9 w-9 object-contain" />
                              <Link to={`/product/${it.product}`} className="flex-1 hover:text-primary">{it.name}{it.size && ` · ${it.size}`}{it.color && ` · ${it.color}`}</Link>
                              <span>× {formatNumber(it.qty)}</span>
                              <span className="w-24 text-right font-semibold">{formatPrice(it.price * it.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs">
                          <p className="font-semibold">Ship to</p>
                          <p>{o.shippingAddress?.name}, {o.shippingAddress?.phone}</p>
                          <p>{o.shippingAddress?.address}, {o.shippingAddress?.city}{o.shippingAddress?.ward && `-${o.shippingAddress.ward}`}, {o.shippingAddress?.district}, {o.shippingAddress?.province}</p>
                          <p className="mt-2 text-muted">{o.user?.email}</p>
                          <p className="text-muted">Estimated delivery {formatDate(o.estimatedDelivery)}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {data && !data.orders.length && <p className="p-10 text-center text-sm text-muted">No orders found.</p>}
      </div>
      {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => set('page', String(p))} />}
    </div>
  );
}
