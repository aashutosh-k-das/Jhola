import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiTrash2, FiExternalLink } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import useCategories from '../../hooks/useCategories';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { Spinner } from '../../components/Loader';
import { formatNumber, formatPrice } from '../../utils/format';

function Toggle({ on, onChange, label }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on} aria-label={label}
      className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-primary' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}

/** Inline numeric cell: saves on blur / Enter. */
function NumCell({ value, onSave, className = 'w-24' }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  const commit = () => { const n = Number(v); if (v !== String(value) && Number.isFinite(n) && n >= 0) onSave(n); else setV(String(value)); };
  return (
    <input value={v} inputMode="numeric" onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ''))}
      onFocus={(e) => e.target.select()} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={`rounded-sm border border-transparent px-2 py-1 text-right hover:border-gray-300 focus:border-primary focus:outline-none ${className}`} />
  );
}

const EMPTY = { name: '', brand: '', category: 'mobiles', subCategory: '', price: '', mrp: '', stock: '', images: '', description: '', highlights: '', sizes: '', isFeatured: false, isDeal: false };

function ProductForm({ onClose, onCreated, categories }) {
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(f.price), mrp = Number(f.mrp || f.price), stock = Number(f.stock || 0);
    const images = f.images.split(/\s*\n\s*|\s*,\s*/).filter(Boolean);
    if (!f.name || !f.brand || !f.description || !images.length || !price) return toast.error('Name, brand, price, image URL and description are required');
    if (price > mrp) return toast.error('Price cannot be higher than MRP');
    setSaving(true);
    try {
      const { data } = await api.post('/products', {
        name: f.name, brand: f.brand, category: f.category, subCategory: f.subCategory, price, mrp, stock, images,
        description: f.description, highlights: f.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
        variants: { colors: [], sizes: f.sizes.split(',').map((s) => s.trim()).filter(Boolean) },
        isFeatured: f.isFeatured, isDeal: f.isDeal,
      });
      toast.success('Product created');
      onCreated(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const L = ({ label, children, span }) => <label className={`block ${span ? 'sm:col-span-2' : ''}`}><span className="mb-1 block text-xs text-muted">{label}</span>{children}</label>;
  return (
    <Modal open onClose={onClose} title="Add product" size="max-w-2xl">
      <form onSubmit={submit} className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {L({ label: 'Product name *', span: true, children: <input className="input" value={f.name} onChange={set('name')} /> })}
        {L({ label: 'Brand *', children: <input className="input" value={f.brand} onChange={set('brand')} /> })}
        {L({ label: 'Category *', children: <select className="input" value={f.category} onChange={set('category')}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select> })}
        {L({ label: 'Selling price (Rs.) *', children: <input className="input" inputMode="numeric" value={f.price} onChange={set('price')} /> })}
        {L({ label: 'MRP (Rs.)', children: <input className="input" inputMode="numeric" value={f.mrp} onChange={set('mrp')} placeholder="Same as price" /> })}
        {L({ label: 'Stock', children: <input className="input" inputMode="numeric" value={f.stock} onChange={set('stock')} placeholder="0" /> })}
        {L({ label: 'Sizes (comma-separated, optional)', children: <input className="input" value={f.sizes} onChange={set('sizes')} placeholder="S, M, L, XL" /> })}
        {L({ label: 'Image URLs * (one per line)', span: true, children: <textarea className="input min-h-16" value={f.images} onChange={set('images')} placeholder="https://…" /> })}
        {L({ label: 'Description *', span: true, children: <textarea className="input min-h-20" value={f.description} onChange={set('description')} /> })}
        {L({ label: 'Highlights (one per line)', span: true, children: <textarea className="input min-h-16" value={f.highlights} onChange={set('highlights')} /> })}
        <div className="flex gap-6 text-sm sm:col-span-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isFeatured} onChange={set('isFeatured')} className="accent-primary" /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isDeal} onChange={set('isDeal')} className="accent-primary" /> Deal of the Day</label>
        </div>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary min-w-32">{saving ? <Spinner className="h-4 w-4" light /> : 'Create product'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const { data, loading, setData, reload } = useFetch('/products?limit=48&facets=false&sort=newest');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(null);
  const sort = params.get('sort') || '';

  const rows = useMemo(() => {
    let list = data?.products || [];
    if (cat) list = list.filter((p) => p.category === cat);
    if (q.trim()) { const s = q.trim().toLowerCase(); list = list.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(s)); }
    if (sort === 'stock') list = [...list].sort((a, b) => a.stock - b.stock);
    return list;
  }, [data, q, cat, sort]);

  const save = async (p, changes) => {
    setSaving(p._id);
    try {
      const { data: updated } = await api.put(`/admin/products/${p._id}`, changes);
      setData({ ...data, products: data.products.map((x) => (x._id === p._id ? { ...x, ...updated } : x)) });
      toast.success(`Saved: ${p.name.slice(0, 32)}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone. Past orders keep their copy of the item.`)) return;
    try {
      await api.delete(`/admin/products/${p._id}`);
      setData({ ...data, products: data.products.filter((x) => x._id !== p._id) });
      toast.success('Product deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const outCount = (data?.products || []).filter((p) => p.stock === 0).length;

  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold">Products {data && <span className="text-sm font-normal text-muted">({formatNumber(data.total)} · {formatNumber(outCount)} out of stock)</span>}</h1>
        <button onClick={() => setAdding(true)} className="btn-primary px-4 py-2"><FiPlus /> Add product</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <label className="flex flex-1 items-center gap-2 rounded-sm border px-3 md:max-w-xs">
          <FiSearch className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or brand" className="w-full py-1.5 text-sm outline-none" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-sm border px-2 py-1.5 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button onClick={() => setParams(sort === 'stock' ? {} : { sort: 'stock' })} className={`rounded-full border px-3 py-1 text-xs font-medium ${sort === 'stock' ? 'border-primary bg-primary-light text-primary' : 'border-gray-200'}`}>Lowest stock first</button>
        <span className="ml-auto text-xs text-muted">Click a price or stock number to edit it</span>
      </div>

      {loading && !data ? <div className="flex justify-center p-10"><Spinner className="h-8 w-8" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-page/60 text-left text-xs uppercase text-muted">
              <tr><th className="px-4 py-2">Product</th><th>Category</th><th className="text-right">Price (Rs.)</th><th className="text-right">MRP (Rs.)</th><th className="text-right">Stock</th><th className="text-center">Featured</th><th className="text-center">Deal</th><th className="px-4" /></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className={`border-t ${saving === p._id ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="h-10 w-10 shrink-0 object-contain" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 max-w-xs font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.brand} · ★ {p.rating} ({formatNumber(p.numReviews)}) · {p.discount}% off</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs">{categories.find((c) => c.slug === p.category)?.name || p.category}</td>
                  <td className="text-right"><NumCell value={p.price} onSave={(n) => save(p, { price: n })} /></td>
                  <td className="text-right"><NumCell value={p.mrp} onSave={(n) => save(p, { mrp: n })} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.stock === 0 && <span className="rounded-sm bg-[#ff6161]/10 px-1.5 text-[10px] font-semibold text-[#d43f3f]">OUT</span>}
                      {p.stock > 0 && p.stock <= 5 && <span className="rounded-sm bg-accent/10 px-1.5 text-[10px] font-semibold text-[#9a5b00]">LOW</span>}
                      <NumCell value={p.stock} className="w-16" onSave={(n) => save(p, { stock: n })} />
                    </div>
                  </td>
                  <td className="text-center"><Toggle on={p.isFeatured} label="Featured" onChange={() => save(p, { isFeatured: !p.isFeatured })} /></td>
                  <td className="text-center"><Toggle on={p.isDeal} label="Deal of the Day" onChange={() => save(p, { isDeal: !p.isDeal })} /></td>
                  <td className="px-4">
                    <div className="flex justify-end gap-3 text-gray-400">
                      <Link to={`/product/${p.slug || p._id}`} aria-label="View in store" className="hover:text-primary"><FiExternalLink /></Link>
                      <button onClick={() => remove(p)} aria-label="Delete product" className="hover:text-[#d43f3f]"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="p-10 text-center text-sm text-muted">No products match.</p>}
        </div>
      )}
      {adding && <ProductForm categories={categories} onClose={() => setAdding(false)} onCreated={() => { setAdding(false); reload(); }} />}
      <p className="border-t px-4 py-2 text-xs text-muted">Showing up to 48 products. Prices in {formatPrice(0).split(' ')[0]}.</p>
    </div>
  );
}
