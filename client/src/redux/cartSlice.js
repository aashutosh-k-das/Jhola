import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';
import { loadJSON, saveJSON } from '../utils/storage';

export const GUEST_CART_KEY = 'jhola_guest_cart';
const MAX_QTY = 10;

const isAuthed = (getState) => Boolean(getState().auth.token);

// Snapshot of the product fields the cart UI needs (guest carts only).
const snapshot = (p) => ({
  _id: p._id, name: p.name, slug: p.slug, images: (p.images || []).slice(0, 1), brand: p.brand,
  price: p.price, mrp: p.mrp, discount: p.discount, stock: p.stock, variants: p.variants,
});

export const fetchCart = createAsyncThunk('cart/fetch', async () => (await api.get('/cart')).data.items);

export const addToCart = createAsyncThunk('cart/add', async ({ product, qty = 1, size = '', color = '' }, { getState }) => {
  if (isAuthed(getState)) {
    return (await api.post('/cart', { productId: product._id, qty, size, color })).data.items;
  }
  if (product.stock <= 0) throw new Error('This item is out of stock');
  if (product.variants?.sizes?.length && !size) throw new Error('Please select a size');
  const items = getState().cart.items.map((i) => ({ ...i }));
  const max = Math.min(MAX_QTY, product.stock);
  const existing = items.find((i) => i.product._id === product._id && i.size === size && i.color === color);
  if (existing) existing.qty = Math.min(max, existing.qty + qty);
  else items.push({ _id: `local-${product._id}-${size}-${color}`, product: snapshot(product), qty: Math.min(max, qty), size, color });
  return items;
});

export const updateCartQty = createAsyncThunk('cart/update', async ({ itemId, qty }, { getState }) => {
  if (isAuthed(getState)) return (await api.put(`/cart/${itemId}`, { qty })).data.items;
  return getState().cart.items.map((i) => {
    if (i._id !== itemId) return i;
    const max = Math.min(MAX_QTY, i.product.stock);
    if (qty > max) throw new Error(`Only ${max} unit(s) can be ordered`);
    return { ...i, qty };
  });
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { getState }) => {
  if (isAuthed(getState)) return (await api.delete(`/cart/${itemId}`)).data.items;
  return getState().cart.items.filter((i) => i._id !== itemId);
});

export const mergeGuestCart = createAsyncThunk('cart/merge', async (_, { getState }) => {
  const guest = getState().cart.items.filter((i) => String(i._id).startsWith('local-'));
  const { data } = guest.length
    ? await api.post('/cart/merge', {
        items: guest.map((i) => ({ productId: i.product._id, qty: i.qty, size: i.size, color: i.color })),
      })
    : await api.get('/cart');
  saveJSON(GUEST_CART_KEY, null);
  return data.items;
});

const slice = createSlice({
  name: 'cart',
  initialState: { items: loadJSON(GUEST_CART_KEY, []), loading: false, pending: {} },
  reducers: {
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.loading = true; });
    b.addCase(fetchCart.rejected, (s) => { s.loading = false; });
    [updateCartQty, removeFromCart].forEach((thunk) => {
      b.addCase(thunk.pending, (s, a) => { s.pending[a.meta.arg?.itemId ?? a.meta.arg] = true; });
      b.addCase(thunk.rejected, (s, a) => { delete s.pending[a.meta.arg?.itemId ?? a.meta.arg]; });
    });
    b.addMatcher(
      (a) => a.type.startsWith('cart/') && a.type.endsWith('/fulfilled'),
      (s, a) => {
        s.items = a.payload;
        s.loading = false;
        s.pending = {};
      }
    );
  },
});

export const { clearCart } = slice.actions;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.qty, 0);
export default slice.reducer;
