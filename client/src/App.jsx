import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/Loader';
import { fetchMe, logout } from './redux/authSlice';
import { fetchCart } from './redux/cartSlice';
import { fetchWishlist } from './redux/wishlistSlice';
import Home from './pages/Home';

const ProductList = lazy(() => import('./pages/ProductList'));
const Search = lazy(() => import('./pages/Search'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountHome = lazy(() => import('./pages/account/AccountHome'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Wishlist = lazy(() => import('./pages/account/Wishlist'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const Profile = lazy(() => import('./pages/account/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const InfoPage = lazy(() => import('./pages/info/InfoPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchMe());
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    // Only on boot / token change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onUnauthorized = () => dispatch(logout());
    window.addEventListener('jhola:unauthorized', onUnauthorized);
    return () => window.removeEventListener('jhola:unauthorized', onUnauthorized);
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="category/:category" element={<ProductList />} />
          <Route path="search" element={<Search />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="pages/:slug" element={<InfoPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id/confirmation" element={<OrderConfirmation />} />
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<AccountHome />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="customers" element={<AdminUsers />} />
            </Route>
            <Route path="wishlist" element={<Navigate to="/account/wishlist" replace />} />
            <Route path="orders" element={<Navigate to="/account/orders" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
