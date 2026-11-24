import { Link } from 'react-router-dom';
import { FiTruck, FiRotateCcw, FiShield, FiCreditCard } from 'react-icons/fi';
import HeroSlider from '../components/HeroSlider';
import CategoryGrid from '../components/CategoryGrid';
import DealOfDay from '../components/DealOfDay';
import ProductRow from '../components/ProductRow';
import BrandsCarousel from '../components/BrandsCarousel';
import useFetch from '../hooks/useFetch';
import useCategories from '../hooks/useCategories';
import ProductCard from '../components/ProductCard';
import { img } from '../utils/constants';
import { useLang } from '../i18n';
import { formatPrice } from '../utils/format';

const PERKS = [
  [FiTruck, 'Free Delivery', 'On orders above {amount}'],
  [FiRotateCcw, '7-Day Returns', 'Easy, no-questions returns'],
  [FiShield, '100% Authentic', 'Sourced from brands'],
  [FiCreditCard, 'Secure Payments', 'eSewa, Khalti, cards & COD'],
];

function MobileCategoryStrip() {
  const categories = useCategories();
  const { lang } = useLang();
  return (
    <div className="-mx-2 flex gap-3 overflow-x-auto bg-white px-3 py-3 no-scrollbar md:hidden">
      {categories.map((c) => (
        <Link key={c.slug} to={`/category/${c.slug}`} className="flex w-16 shrink-0 flex-col items-center gap-1 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
            <img src={c.image} alt="" className="h-11 w-11 object-contain" />
          </span>
          <span className="line-clamp-2 text-[11px] font-medium leading-tight">{lang === 'ne' ? c.nameNe : c.name}</span>
        </Link>
      ))}
    </div>
  );
}

function PromoTiles() {
  const { t } = useLang();
  const tiles = [
    { title: 'Smart Wearables', sub: 'From {amount}', amount: 5599, to: '/products?q=watch', image: img('mobile-accessories', 'apple-watch-series-4-gold'), bg: 'bg-[#fff3e0]' },
    { title: 'Beauty Bonanza', sub: 'Min. 25% off', to: '/category/beauty', image: img('fragrances', 'gucci-bloom-eau-de'), bg: 'bg-[#fce4ec]' },
    { title: 'Kitchen Essentials', sub: 'Under {amount}', amount: 2000, to: '/category/home-kitchen?maxPrice=2000', image: img('kitchen-accessories', 'carbon-steel-wok'), bg: 'bg-[#e8f5e9]' },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Link key={tile.title} to={tile.to} className={`group flex items-center justify-between overflow-hidden rounded-sm p-4 shadow-card ${tile.bg}`}>
          <div>
            <p className="text-base font-bold sm:text-lg">{t(tile.title)}</p>
            <p className="text-sm font-semibold text-success">{t(tile.sub, tile.amount ? { amount: formatPrice(tile.amount) } : undefined)}</p>
            <span className="mt-2 inline-block text-xs font-semibold text-primary">{t('Shop now')} →</span>
          </div>
          <img src={tile.image} alt="" loading="lazy" className="h-20 w-20 object-contain transition group-hover:scale-110 sm:h-24 sm:w-24" />
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  const deals = useFetch('/products?deal=true&sort=discount&limit=12&facets=false');
  const featured = useFetch('/products?featured=true&limit=8&facets=false');
  const mobiles = useFetch('/products?category=mobiles&sort=rating&limit=10&facets=false');
  const fashion = useFetch('/products?category=fashion&sort=discount&limit=10&facets=false');
  const home = useFetch('/products?category=home-kitchen&sort=rating&limit=10&facets=false');

  return (
    <div className="container-page space-y-2 py-2 md:space-y-3 md:py-3">
      <MobileCategoryStrip />
      <HeroSlider />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERKS.map(([Icon, title, sub]) => (
          <div key={title} className="card flex items-center gap-3 p-3">
            <Icon className="shrink-0 text-primary" size={24} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{t(title)}</p>
              <p className="truncate text-xs text-muted">{t(sub, { amount: formatPrice(1000) })}</p>
            </div>
          </div>
        ))}
      </div>

      <DealOfDay products={deals.data?.products} loading={deals.loading} />
      <CategoryGrid />

      <section className="card">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-lg font-semibold sm:text-[22px]">{t('Featured Products')}</h2>
            <p className="text-xs text-muted sm:text-sm">{t('Handpicked bestsellers loved by Jhola shoppers')}</p>
          </div>
          <Link to="/products?featured=true" className="btn-primary px-4 py-2 text-xs">{t('View All')}</Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-100 md:grid-cols-4">
          {featured.loading
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="h-72 bg-white p-4"><div className="skeleton h-full rounded" /></div>)
            : featured.data?.products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <PromoTiles />
      <ProductRow title={t('Best of Mobiles')} subtitle={t('Top-rated smartphones & tablets')} products={mobiles.data?.products} loading={mobiles.loading} viewAll="/category/mobiles" />
      <BrandsCarousel />
      <ProductRow title={t('Fashion Top Deals')} subtitle={t('Biggest discounts on styles')} products={fashion.data?.products} loading={fashion.loading} viewAll="/category/fashion?sort=discount" />
      <ProductRow title={t('Home & Kitchen Essentials')} products={home.data?.products} loading={home.loading} viewAll="/category/home-kitchen" />
    </div>
  );
}
