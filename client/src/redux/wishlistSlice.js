import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => (await api.get('/users/wishlist')).data);

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (product, { getState }) => {
  if (!getState().auth.token) {
    const err = new Error('Please log in to save items to your wishlist');
    err.name = 'AUTH_REQUIRED';
    throw err;
  }
  return (await api.post(`/users/wishlist/${product._id}`)).data;
});

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loaded: false },
  reducers: {
    resetWishlist: () => ({ items: [], loaded: false }),
  },
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (s, { payload }) => {
      s.items = payload;
      s.loaded = true;
    });
    // Optimistic toggle
    b.addCase(toggleWishlist.pending, (s, { meta }) => {
      const p = meta.arg;
      const idx = s.items.findIndex((i) => i._id === p._id);
      if (idx >= 0) s.items.splice(idx, 1);
      else s.items.unshift(p);
    });
    b.addCase(toggleWishlist.fulfilled, (s, { payload }) => {
      s.items = payload.wishlist;
    });
    b.addCase(toggleWishlist.rejected, (s, { meta }) => {
      const p = meta.arg;
      const idx = s.items.findIndex((i) => i._id === p._id);
      if (idx >= 0) s.items.splice(idx, 1);
      else s.items.unshift(p);
    });
  },
});

export const { resetWishlist } = slice.actions;
export const selectIsWishlisted = (id) => (s) => s.wishlist.items.some((i) => i._id === id);
export default slice.reducer;
