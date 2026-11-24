export const img = (cat, slug, n = 1) => `https://cdn.dummyjson.com/product-images/${cat}/${slug}/${n}.webp`;

// Text is English and translated at render time; {price} placeholders are formatted per language.
export const HERO_SLIDES = [
  { kicker: 'Big Jhola Days', title: 'Up to 45% off on Smartphones', subtitle: 'iPhone, Samsung, realme & more · Easy EMI', cta: 'Shop Mobiles', to: '/category/mobiles', image: img('smartphones', 'iphone-13-pro'), bg: 'from-[#2874f0] via-[#3d84f5] to-[#7fb0ff]' },
  { kicker: 'Dashain Tihar Fashion Fiesta', title: 'Min. 50% off on Top Styles', subtitle: 'Sneakers, shirts, bags & watches', cta: 'Explore Fashion', to: '/category/fashion', image: img('mens-shoes', 'puma-future-rider-trainers'), bg: 'from-[#e11d74] via-[#f0457e] to-[#ff9f00]' },
  { kicker: 'Kitchen Upgrade Sale', title: 'Appliances from {price}', price: 1599, subtitle: 'Microwaves, mixers, induction & more', cta: 'Upgrade Now', to: '/category/home-kitchen', image: img('kitchen-accessories', 'microwave-oven'), bg: 'from-[#047857] via-[#0f9f7a] to-[#34d399]' },
  { kicker: 'Work & Create', title: 'Laptops for Every Need', subtitle: 'Extra discount with Nabil & NIC Asia bank cards', cta: 'View Laptops', to: '/category/electronics', image: img('laptops', 'apple-macbook-pro-14-inch-space-grey'), bg: 'from-[#312e81] via-[#4f46e5] to-[#8b5cf6]' },
  { kicker: 'Game On', title: 'Sports Gear from {price}', price: 1119, subtitle: 'Cricket, football, badminton & more', cta: 'Gear Up', to: '/category/sports', image: img('sports-accessories', 'cricket-helmet'), bg: 'from-[#c2410c] via-[#ea580c] to-[#fbbf24]' },
];

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Popularity' },
  { value: 'price_asc', label: 'Price -- Low to High' },
  { value: 'price_desc', label: 'Price -- High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Discount' },
];

export const PRICE_STEPS = [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];

export const NEPAL_MOBILE = /^9[678]\d{8}$/;

export const BANKS = [
  'Nabil Bank', 'NIC Asia Bank', 'Global IME Bank', 'Nepal Investment Mega Bank', 'Himalayan Bank', 'Everest Bank',
  'Standard Chartered Bank Nepal', 'Rastriya Banijya Bank', 'Nepal Bank', 'Kumari Bank', 'Prabhu Bank', 'Siddhartha Bank',
  'Sanima Bank', 'NMB Bank', 'Laxmi Sunrise Bank', 'Agricultural Development Bank', 'Machhapuchchhre Bank', 'Citizens Bank International',
];
