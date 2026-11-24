const img = (cat, slug, n = 1) => `https://cdn.dummyjson.com/product-images/${cat}/${slug}/${n}.webp`;

const CATEGORIES = [
  { slug: 'mobiles', name: 'Mobiles', nameNe: 'मोबाइल', taglineNe: 'नयाँ स्मार्टफोनहरू', image: img('smartphones', 'iphone-13-pro'), tagline: 'Latest smartphones' },
  { slug: 'electronics', name: 'Electronics', nameNe: 'इलेक्ट्रोनिक्स', taglineNe: 'ल्यापटप, अडियो र अन्य', image: img('laptops', 'apple-macbook-pro-14-inch-space-grey'), tagline: 'Laptops, audio & more' },
  { slug: 'fashion', name: 'Fashion', nameNe: 'फेसन', taglineNe: 'ट्रेन्डिङ स्टाइल', image: img('mens-shoes', 'puma-future-rider-trainers'), tagline: 'Trending styles' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', nameNe: 'घर र भान्सा', taglineNe: 'उपकरण र सजावट', image: img('kitchen-accessories', 'microwave-oven'), tagline: 'Appliances & decor' },
  { slug: 'beauty', name: 'Beauty', nameNe: 'सौन्दर्य', taglineNe: 'मेकअप र व्यक्तिगत हेरचाह', image: img('beauty', 'red-lipstick'), tagline: 'Makeup & personal care' },
  { slug: 'sports', name: 'Sports', nameNe: 'खेलकुद', taglineNe: 'खेल सामग्री', image: img('sports-accessories', 'cricket-helmet'), tagline: 'Gear up & play' },
];

module.exports = { CATEGORIES, img };
