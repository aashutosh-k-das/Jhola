import { useState } from 'react';
import { formatDate, formatPrice, formatNumber } from '../../utils/format';

/** Single-series daily revenue bar chart with hover tooltip and a table view. */
export default function SalesChart({ data }) {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.revenue));
  // nice rounded top for the axis
  const mag = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / mag) * mag;
  const ticks = [top, top / 2, 0];
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">Sales, last 14 days</h2>
          <p className="text-xs text-muted">{formatPrice(total)} from {formatNumber(data.reduce((s, d) => s + d.orders, 0))} orders (excludes cancelled)</p>
        </div>
        <button onClick={() => setAsTable(!asTable)} className="text-xs font-semibold text-primary">{asTable ? 'View as chart' : 'View as table'}</button>
      </div>

      {asTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-muted"><tr><th className="py-1.5">Date</th><th className="text-right">Orders</th><th className="text-right">Revenue</th></tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-t"><td className="py-1.5">{formatDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td><td className="text-right">{formatNumber(d.orders)}</td><td className="text-right">{formatPrice(d.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex h-56 flex-col justify-between pb-6 text-right text-[10px] text-muted">
            {ticks.map((t) => <span key={t}>{t >= 100000 ? `${formatNumber(t / 100000)}L` : formatNumber(t)}</span>)}
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
              {ticks.map((t) => <div key={t} className={`border-t ${t === 0 ? 'border-gray-300' : 'border-dashed border-gray-100'}`} />)}
            </div>
            <div className="relative flex h-56 items-end gap-[2px] pb-6" onMouseLeave={() => setHover(null)}>
              {data.map((d, i) => (
                <div
                  key={d.date}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  tabIndex={0}
                  aria-label={`${d.date}: ${formatPrice(d.revenue)}, ${d.orders} orders`}
                >
                  <div
                    className={`w-full max-w-[28px] rounded-t-[4px] transition-colors ${hover === i ? 'bg-primary-dark' : 'bg-primary'}`}
                    style={{ height: `${(d.revenue / top) * 100}%`, minHeight: d.revenue ? 2 : 0 }}
                  />
                  {(data.length - 1 - i) % 2 === 0 && (
                    <span className="absolute -bottom-5 whitespace-nowrap text-[10px] text-muted">{formatDate(d.date, { day: 'numeric', month: 'short' })}</span>
                  )}
                  {hover === i && (
                    <div className={`pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs text-white shadow-pop ${i > data.length - 4 ? 'right-0' : i < 3 ? 'left-0' : ''}`}>
                      <p className="font-semibold">{formatDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p>{formatPrice(d.revenue)} · {formatNumber(d.orders)} orders</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
