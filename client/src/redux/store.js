import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import auth, { login, register, verifyOtp, logout } from './authSlice';
import cart, { mergeGuestCart, clearCart, GUEST_CART_KEY } from './cartSlice';
import wishlist, { fetchWishlist, resetWishlist } from './wishlistSlice';
import ui from './uiSlice';
import { saveJSON } from '../utils/storage';

const listener = createListenerMiddleware();

// After any successful login: merge the guest cart into the account and load the wishlist.
listener.startListening({
  matcher: isAnyOf(login.fulfilled, register.fulfilled, verifyOtp.fulfilled),
  effect: async (_, api) => {
    await api.dispatch(mergeGuestCart());
    api.dispatch(fetchWishlist());
  },
});

listener.startListening({
  actionCreator: logout,
  effect: (_, api) => {
    api.dispatch(clearCart());
    api.dispatch(resetWishlist());
  },
});

export const store = configureStore({
  reducer: { auth, cart, wishlist, ui },
  middleware: (gDM) => gDM().prepend(listener.middleware),
});

// Persist the guest cart (logged-in carts live on the server).
let lastItems;
store.subscribe(() => {
  const { auth: a, cart: c } = store.getState();
  if (a.token || c.items === lastItems) return;
  lastItems = c.items;
  saveJSON(GUEST_CART_KEY, c.items);
});
