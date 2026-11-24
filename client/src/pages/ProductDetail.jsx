import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiChevronRight, FiZap, FiTag, FiShare2, FiCheck } from 'react-icons/fi';
import useFetch from '../hooks/useFetch';
import { addToCart } from '../redux/cartSlice';
import ImageGallery from '../components/ImageGallery';
import WishlistButton from '../components/WishlistButton';
import DeliveryChecker from '../components/DeliveryChecker';
import RatingsReviews from '../components/RatingsReviews';
import BoughtTogether from '../components/BoughtTogether';
import ProductRow from '../components/ProductRow';
import { RatingBadge } from '../components/StarRating';
import { PageLoader } from '../components/Loader';
import useCategories from '../hooks/useCategories';
import { formatPrice, formatNumber } from '../utils/format';
import { useLang } from '../i18n';

const OFFERS = [
  ['Bank Offer', '10% instant discount on Nabil Bank & NIC Asia credit cards, up to {a} on orders of {b} and above', 2500, 8000],
  ['Wallet Offer', 'Flat {a} cashback on paying with eSewa (min. order {b})', 150, 3000],
  ['Wallet Offer', '5% cashback up to {a} with Khalti', 500],
  ['Special Price', 'Get extra discount (price inclusive of cashback/coupon)'],
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categories = useCategories();
  const { lang, t } = useLang();
  const { data, loading, error, reload } = useFetch(`/products/${id}`);
  const cartItems = useSelector((s) => s.cart.items);

  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [busy, setBusy] = useState(null); // 'cart' | 'buy'
  const sizeRef = useRef(null);

  const product = data?.product;

  useEffect(() => {
    if (!product) return;
    setColor(product.variants?.colors?.[0]?.name || '');
    setSize('');
    setSizeError(false);
    document.title = `${product.name} | Jhola`;
    return () => { document.title = 'Jhola — Apni Marzi, Apni Shopping'; };
  }, [product]);

  const stale = data && data.product._id !== id && data.product.slug !== id;
  if (loading && (!data || stale)) return <PageLoader />;
  if (error || !product) {
    return (
      <div className="container-page py-4">
        <div className="card p-10 text-center">
          <p className="text-lg font-semibold">{t(error || 'Product not found')}</p>
          <Link to="/" className="btn-primary mt-4">{t('Continue shopping')}</Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === product.category);
  const sizes = product.variants?.sizes || [];
  const colors = product.variants?.colors || [];
  const outOfStock = product.stock <= 0;
  const inCart = cartItems.some((i) => i.product?._id === product._id && i.size === size && i.color === color);

  const requireSize = () => {
    if (sizes.length && !size) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error(t('Please select a size'));
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (inCart) return navigate('/cart');
    if (!requireSize()) return;
    setBusy('cart');
    try {
      await dispatch(addToCart({ product, qty: 1, size, color })).unwrap();
      toast.success(t('Item added to your cart'));
    } catch (e) {
      toast.error(t(e.message));
    } finally {
      setBusy(null);
    }
  };

  const handleBuy = async () => {
    if (!requireSize()) return;
    setBusy('buy');
    try {
      if (!inCart) await dispatch(addToCart({ product, qty: 1, size, color })).unwrap();
      navigate('/checkout');
    } catch (e) {
      toast.error(t(e.message));
      setBusy(null);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); toast.success(t('Link copied to clipboard')); }
    } catch { /* user cancelled */ }
  };

  const actionButtons = (mobile) => (
    <>
      <button onClick={handleAdd} disabled={outOfStock || busy} className={`btn-accent flex-1 ${mobile ? 'rounded-none py-4' : 'py-4 text-base'}`}>
        <FiShoppingCart /> {t(busy === 'cart' ? 'Adding…' : inCart ? 'Go to Cart' : 'Add to Cart')}
      </button>
      <button onClick={handleBuy} disabled={outOfStock || busy} className={`btn-buy flex-1 ${mobile ? 'rounded-none py-4' : 'py-4 text-base'}`}>
        <FiZap /> {t(outOfStock ? 'Out of Stock' : busy === 'buy' ? 'Please wait…' : 'Buy Now')}
      </button>
    </>
  );

  return (
    <div className="container-page py-0 pb-16 md:py-3 md:pb-3">
      <div className="card md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6 md:p-4">
        {/* Left: images + actions */}
        <div className="md:sticky md:top-[130px] md:self-start">
          <ImageGallery
            images={product.images}
            name={product.name}
            overlay={
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                <WishlistButton product={product} bordered size={18} />
                <button onClick={share} aria-label={t('Share')} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-card"><FiShare2 /></button>
              </div>
            }
          />
          <div className="mt-3 hidden gap-3 md:flex">{actionButtons(false)}</div>
        </div>

        {/* Right: details */}
        <div className="min-w-0 space-y-5 px-4 py-4 md:px-0 md:py-0">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted" aria-label={t('Breadcrumb')}>
            <Link to="/" className="hover:text-primary">{t('Home')}</Link>
            <FiChevronRight size={11} />
            <Link to={`/category/${product.category}`} className="hover:text-primary">{(lang === 'ne' ? category?.nameNe : category?.name) || product.category}</Link>
            <FiChevronRight size={11} />
            <Link to={`/category/${product.category}?brand=${encodeURIComponent(product.brand)}`} className="hover:text-primary">{product.brand}</Link>
          </nav>

          <div>
            <p className="text-sm font-semibold uppercase text-muted">{product.brand}</p>
            <h1 className="text-lg leading-snug sm:text-xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingBadge value={product.rating} />
              {product.numReviews > 0 && (
                <a href="#reviews" className="text-sm font-semibold text-muted hover:text-primary">
                  {t('{n} Ratings & Reviews', { n: product.numReviews })}
                </a>
              )}
              {product.isFeatured && <span className="rounded-sm bg-primary-light px-2 py-0.5 text-[11px] font-bold italic text-primary">{t('Jhola Assured')}</span>}
            </div>
          </div>

          <div>
            {product.discount > 0 && <p className="text-sm font-semibold text-success">{t('Special price')}</p>}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-base text-muted line-through">{formatPrice(product.mrp)}</span>
                  <span className="text-base font-semibold text-success">{t('{n}% off', { n: product.discount })}</span>
                </>
              )}
            </div>
            {outOfStock ? (
              <p className="mt-1 text-sm font-semibold text-[#ff6161]">{t('Sold out — this item is currently out of stock')}</p>
            ) : product.stock <= 5 ? (
              <p className="mt-1 text-sm font-semibold text-[#ff6161]">{t('Hurry, only {n} left!', { n: product.stock })}</p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-base font-semibold">{t('Available offers')}</p>
            <ul className="space-y-2 text-sm">
              {OFFERS.map(([tag, text, a, b]) => (
                <li key={text} className="flex gap-2"><FiTag className="mt-0.5 shrink-0 text-success" /><span><b>{t(tag)}</b> {t(text, { a: a && formatPrice(a), b: b && formatPrice(b) })} <span className="font-semibold text-primary">{t('T&C')}</span></span></li>
              ))}
            </ul>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
              <span className="w-24 shrink-0 text-sm font-medium text-muted">{t('Color')}</span>
              <div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      aria-label={t(c.name)}
                      aria-pressed={color === c.name}
                      title={t(c.name)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${color === c.name ? 'border-primary' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10" style={{ background: c.hex }}>
                        {color === c.name && <FiCheck className={['White', 'Silver', 'Gold'].includes(c.name) ? 'text-ink' : 'text-white'} />}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">{t('Selected:')} <b className="text-ink">{t(color)}</b></p>
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div ref={sizeRef} className="flex flex-col gap-2 sm:flex-row sm:gap-10">
              <span className="w-24 shrink-0 text-sm font-medium text-muted">{t('Size')}</span>
              <div>
                <div className={`flex flex-wrap gap-2 rounded-sm ${sizeError ? 'p-1 ring-2 ring-[#ff6161]' : ''}`}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSize(s); setSizeError(false); }}
                      aria-pressed={size === s}
                      className={`min-w-12 rounded-sm border-2 px-3 py-2 text-sm font-semibold transition ${size === s ? 'border-primary text-primary' : 'border-gray-200 hover:border-primary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="mt-1 text-xs text-[#ff6161]">{t('Please select a size to continue')}</p>}
              </div>
            </div>
          )}

          <DeliveryChecker price={product.price} />

          {product.highlights?.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
              <span className="w-24 shrink-0 text-sm font-medium text-muted">{t('Highlights')}</span>
              <ul className="list-disc space-y-1.5 pl-4 text-sm marker:text-gray-300">
                {product.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
            <span className="w-24 shrink-0 text-sm font-medium text-muted">{t('Seller')}</span>
            <div className="text-sm">
              <p className="font-semibold text-primary">JholaRetail <RatingBadge value={4.6} className="ml-1 align-middle" /></p>
              <ul className="mt-1 list-disc pl-4 text-muted marker:text-gray-300"><li>{t('7 Days Replacement Policy')}</li><li>{t('VAT bill available')}</li></ul>
            </div>
          </div>

          <div className="rounded-sm border">
            <h2 className="border-b px-4 py-3 text-xl font-semibold sm:px-6">{t('Product Description')}</h2>
            <p className="px-4 py-4 text-sm leading-relaxed sm:px-6">{product.description}</p>
          </div>

          {product.specifications?.length > 0 && (
            <div className="rounded-sm border">
              <h2 className="border-b px-4 py-3 text-xl font-semibold sm:px-6">{t('Specifications')}</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((s) => (
                    <tr key={s.key} className="border-b last:border-0">
                      <td className="w-2/5 px-4 py-2.5 text-muted sm:px-6">{t(s.key)}</td>
                      <td className="px-4 py-2.5">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="-mx-4 rounded-sm border md:mx-0">
            <BoughtTogether key={product._id} product={product} others={data.boughtTogether} size={size} color={color} />
            <RatingsReviews key={`r-${product._id}`} product={product} breakdown={data.ratingBreakdown} onReviewAdded={reload} />
          </div>
        </div>
      </div>

      <ProductRow title={t('Similar Products')} products={data.similar} className="mt-2 md:mt-3" viewAll={`/category/${product.category}`} />

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
        {actionButtons(true)}
      </div>
    </div>
  );
}
