import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { addToCart } from '../redux/cartSlice';
import { formatPrice } from '../utils/format';
import { useT } from '../i18n';

export default function BoughtTogether({ product, others, size, color }) {
  const dispatch = useDispatch();
  const t = useT();
  // Items that need a size picked can't be bundle-added from here.
  const addable = others.filter((p) => !p.variants?.sizes?.length);
  const [selected, setSelected] = useState(() => new Set([product._id, ...addable.map((p) => p._id)]));
  const [adding, setAdding] = useState(false);

  if (!addable.length) return null;
  const all = [product, ...addable];
  const chosen = all.filter((p) => selected.has(p._id));
  const total = chosen.reduce((s, p) => s + p.price, 0);
  const mrp = chosen.reduce((s, p) => s + p.mrp, 0);

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const addAll = async () => {
    setAdding(true);
    try {
      for (const p of chosen) {
        await dispatch(addToCart({ product: p, qty: 1, ...(p._id === product._id ? { size, color } : {}) })).unwrap();
      }
      toast.success(t('{n} item(s) added to cart', { n: chosen.length }));
    } catch (e) {
      toast.error(t(e.message));
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="border-t px-4 py-5 sm:px-6">
      <h2 className="mb-4 text-xl font-semibold">{t('Frequently Bought Together')}</h2>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {all.map((p, i) => (
            <div key={p._id} className="flex items-center gap-2">
              {i > 0 && <FiPlus className="shrink-0 text-muted" />}
              <label className="relative w-28 shrink-0 cursor-pointer rounded-sm border p-2 text-center sm:w-32">
                <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggle(p._id)} className="absolute left-1.5 top-1.5 h-4 w-4 accent-primary" aria-label={p.name} />
                <img src={p.images?.[0]} alt="" loading="lazy" className="mx-auto h-20 w-20 object-contain" />
                {p._id === product._id ? (
                  <p className="mt-1 line-clamp-2 text-xs">{t('This item:')} {p.name}</p>
                ) : (
                  <Link to={`/product/${p.slug || p._id}`} className="mt-1 line-clamp-2 text-xs hover:text-primary">{p.name}</Link>
                )}
                <p className="mt-1 text-sm font-semibold">{formatPrice(p.price)}</p>
              </label>
            </div>
          ))}
        </div>
        <div className="lg:border-l lg:pl-8">
          <p className="text-sm text-muted">{t('Total price for {n} item(s)', { n: chosen.length })}</p>
          <p className="text-2xl font-semibold">{formatPrice(total)} <span className="text-sm font-normal text-muted line-through">{formatPrice(mrp)}</span></p>
          <button onClick={addAll} disabled={!chosen.length || adding} className="btn-accent mt-3">
            {adding ? t('Adding…') : t('Add {n} item(s) to cart', { n: chosen.length })}
          </button>
        </div>
      </div>
    </section>
  );
}
