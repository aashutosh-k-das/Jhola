import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import { formatDate, formatNumber, formatPrice } from '../../utils/format';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q.trim(), 350);
  const { data, loading } = useFetch(`/admin/users?q=${encodeURIComponent(dq)}&page=${page}`);

  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold">Customers {data && <span className="text-sm font-normal text-muted">({formatNumber(data.total)})</span>}</h1>
        <label className="flex items-center gap-2 rounded-sm border px-3 md:w-80">
          <FiSearch className="text-muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name, email or phone" className="w-full py-2 text-sm outline-none" />
        </label>
      </div>
      <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-page/60 text-left text-xs uppercase text-muted">
            <tr><th className="px-4 py-2">Customer</th><th>Phone</th><th>District</th><th>Joined</th><th className="text-right">Orders</th><th className="text-right">Spent</th><th className="px-4 text-right">Last order</th></tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">{u.name[0]?.toUpperCase()}</span>
                    <div><p className="font-medium">{u.name} {u.isAdmin && <span className="ml-1 rounded-sm bg-ink px-1.5 text-[10px] font-semibold text-white">ADMIN</span>}</p><p className="text-xs text-muted">{u.email}</p></div>
                  </div>
                </td>
                <td className="text-xs">{u.phone || '—'}</td>
                <td className="text-xs">{u.district || '—'}</td>
                <td className="text-xs text-muted">{formatDate(u.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="text-right tabular-nums">{formatNumber(u.orders)}</td>
                <td className="text-right font-semibold tabular-nums">{u.spent ? formatPrice(u.spent) : '—'}</td>
                <td className="px-4 text-right text-xs text-muted">{u.lastOrder ? formatDate(u.lastOrder, { day: 'numeric', month: 'short' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.users.length && <p className="p-10 text-center text-sm text-muted">No customers found.</p>}
      </div>
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
