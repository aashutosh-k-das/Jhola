# Jhola — *Apni Marzi, Apni Shopping*

A full-stack MERN e-commerce store for **Nepal**, inspired by Flipkart. **Jhola** (झोला) means "bag" in Nepali and Hindi.

- **Bilingual:** English and नेपाली (Nepali), switchable from the navbar, mobile menu or footer. The choice is remembered.
- **Built for Nepal:** prices in Nepalese Rupees (Rs. / रू), Nepal's 7 provinces and 77 districts, Nepali mobile numbers (98/97/96…), delivery estimates by district, and payment by eSewa, Khalti, ConnectIPS, card or Cash on Delivery.

- **Frontend:** React 19 + Vite, Tailwind CSS v4, Redux Toolkit, React Router 7, react-hot-toast
- **Backend:** Node.js + Express 5, MongoDB + Mongoose, JWT + bcrypt
- **Integrations:** Cloudinary (optional) for product image uploads. Online payments run through a built-in test gateway (see *Payments* below).

## Quick start

Prerequisites: Node 20+ and MongoDB running locally.

```bash
# 1. Start MongoDB (macOS / Homebrew)
brew services start mongodb-community@7.0

# 2. Install everything and seed sample data (46 products, 289 reviews, demo users)
cd jhola
npm run setup          # = npm install && npm --prefix client install && npm run seed

# 3. Run API (http://localhost:5050) + React app (http://localhost:5173)
npm run dev
```

Open **http://localhost:5173**.

| Account | Email | Password |
|---|---|---|
| Demo shopper (has a saved Kathmandu address) | `demo@jhola.com` | `demo1234` |
| Admin (can use `POST /api/products` and `/api/upload`) | `admin@jhola.com` | `admin1234` |

Configuration lives in `config/.env` (copy from `config/.env.example`). `npm run seed` **wipes** the products, users, reviews, carts and orders collections.

> The API uses port **5050** because macOS AirPlay Receiver occupies port 5000.

### Production build

```bash
npm run build && npm start   # Express serves client/dist on http://localhost:5050
```

## Features

**Pages:** Home, Product listing (by category), Search results, Product detail, Cart, Checkout, Order confirmation, Login / Signup (password or OTP), and an Account area with orders, order tracking, wishlist, saved addresses and profile.

- **Home:** auto-playing, swipeable hero slider; category grid; Deals of the Day with a countdown to midnight; featured products; Top Brands carousel; footer with app-download and social links.
- **Listing and search:** filter by price, brand (searchable), rating, discount and stock. Sort by relevance, popularity, price, newest or discount. Pagination. Filter state lives in the URL, so results are shareable. On mobile, filters open in a full-screen drawer and sort opens in a bottom sheet.
- **Search box:** suggestions debounce for 300 ms and cancel stale requests. Arrow keys and Enter navigate the list. Trending searches show when the box is empty.
- **Language:** every part of the interface is translated, including numbers and dates (Devanagari digits and Nepali month names in Nepali mode). Product names, brands and descriptions stay in English, as on most Nepali stores.
- **Product page:**
  - Images: thumbnails, hover zoom, a fullscreen lightbox with tap-to-zoom, and a swipe carousel on mobile.
  - Options: colour and size selectors. A size is required before adding to the cart.
  - Delivery checker: pick a district to see the delivery date and whether COD is available. Kathmandu valley gets next-day delivery; major hubs about 3 days; other districts about 5; remote mountain districts (Humla, Dolpa, Mugu, Manang, Mustang and others) about 8 days, with no COD.
  - Content: offers, highlights, specs, and ratings with a breakdown. Reviews can be sorted and paginated, and you can write one ("Certified Buyer" when you bought the item).
  - Recommendations: Frequently Bought Together and Similar Products.
- **Cart:** works for guests (saved in localStorage) and **merges into your account when you log in**. Quantity and remove controls, a price breakdown with free delivery from Rs. 1,000 (otherwise Rs. 100), and a sticky Place Order bar on mobile.
- **Checkout:** Flipkart-style 4 steps (Login, Address, Summary, Payment). Addresses use Province → District → Municipality → Ward → Tole. Payment options are eSewa, Khalti, ConnectIPS / mobile banking, card, and Cash on Delivery (turned off for districts that can't take it). Stock is reserved atomically when the order is placed.
- **Payments:** online methods open a built-in "Jhola Test Payment Gateway" where you simulate a success or a failure; no real money moves. The eSewa ID, Khalti number, card (Luhn check) and bank are validated in the browser and never sent to the server. To take real payments you need eSewa / Khalti merchant accounts; replace the simulated branch in `server/controllers/orderController.js` (`payOrder`) with their server-side verification.
- **Orders:** you can cancel an order before it is out for delivery; stock is returned and paid orders show as refunded. Order tracking advances over time (Placed → Shipped → Out for Delivery → Delivered) without a real logistics backend.
- **Mobile:** bottom navigation bar, hamburger category drawer, touch-friendly cards, sticky action bars.

## REST API (`/api`)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/products` | `q, category, brand (csv), minPrice, maxPrice, rating, discount, inStock, deal, featured, sort, page, limit`. Returns `{ products, page, pages, total, facets }` |
| GET | `/products/brands` | Top brands |
| GET | `/products/:idOrSlug` | Product + `similar`, `boughtTogether`, `ratingBreakdown` |
| GET/POST | `/products/:id/reviews` | List (`page, sort`) / create-or-update your review 🔒 |
| POST | `/products` | Create product 🔒 admin |
| GET | `/categories` | Categories with product counts |
| GET | `/delivery/:district` | Delivery estimate + COD availability for a Nepal district |
| GET | `/locations` | Nepal provinces and districts (English + Nepali names) |
| POST | `/users/register`, `/users/login` | JWT auth |
| POST | `/users/otp/send`, `/users/otp/verify` | Simulated OTP login (OTP is returned as `demoOtp`) |
| GET/PUT | `/users/me` | Profile / update (incl. password change) 🔒 |
| GET | `/users/wishlist` · POST `/users/wishlist/:productId` | Wishlist (POST toggles) 🔒 |
| GET/POST/PUT/DELETE | `/users/addresses[/:id]` | Saved addresses 🔒 |
| GET/POST/DELETE | `/cart` | Get / add `{productId, qty, size, color}` / clear 🔒 |
| PUT/DELETE | `/cart/:itemId` | Update qty / remove 🔒 |
| POST | `/cart/merge` | Merge a guest cart after login 🔒 |
| GET/POST | `/orders` | My orders / place order `{addressId, paymentMethod}`; methods: `ESEWA`, `KHALTI`, `CONNECTIPS`, `CARD`, `COD` 🔒 |
| GET | `/orders/:id` | Order (by `_id` or public `orderId`) 🔒 |
| POST | `/orders/:id/pay` | Complete payment through the test gateway 🔒 |
| PUT | `/orders/:id/cancel` | Cancel + restock 🔒 |
| POST | `/upload` | Upload an image to Cloudinary (multipart field `image`) 🔒 admin |

🔒 = requires `Authorization: Bearer <token>`. Prices and totals are always recalculated on the server; the client never sets them.

## Security

Run the attack suite any time (API must be running): `node scripts/security-audit.mjs`. It tries 27 attacks (account takeover, token forgery, NoSQL injection, IDOR, price tampering, brute force, DoS) and reports which succeed.

Protections in place:
- **Auth:** bcrypt-hashed passwords (6–128 chars), JWT pinned to HS256 with a random secret. Every token carries a version number; changing your password signs out all other devices.
- **OTP login:** the demo code is shown on screen, so it can **only create new accounts** — it can never log in to an existing account (including admin). It is off in production (`OTP_DEMO`) until a real SMS/email provider is connected.
- **Rate limits:** 8 failed logins per account per 15 min; 10 signups per network per hour; 10 OTP requests per 15 min; 600 API requests per minute per IP. Behind a proxy, set `TRUST_PROXY=1`.
- **Anti-abuse:** at most 3 open Cash-on-Delivery orders per customer; quantity 1–10 per item; prices and totals always computed on the server.
- **Access control:** customers can only see/cancel their own orders and addresses; `/api/admin/*` requires an admin.
- **Hardening:** Helmet security headers + Content-Security-Policy, no `X-Powered-By`, 100 KB request limit, regex-escaped search.

Before going live: put the site behind HTTPS, set a new `JWT_SECRET`, set `TEST_PAYMENTS=false` once real eSewa/Khalti verification replaces the test gateway, and change the seeded admin password.

## Adding or changing translations

English text is the translation key. In a component:

```jsx
const t = useT();
<button>{t('Add to Cart')}</button>
<p>{t('Only {n} left', { n: product.stock })}</p>   // numbers become Devanagari in Nepali
```

Then add the Nepali text to `client/src/i18n/ne.js`:

```js
'Add to Cart': 'कार्टमा राख्नुहोस्',
'Only {n} left': '{n} वटा मात्र बाँकी',
```

A missing translation falls back to English and logs `[i18n] Missing Nepali translation` in the browser console during development.

## Project structure

```
jhola/
├── config/            env loading, MongoDB connection, Cloudinary client, .env
├── server/
│   ├── controllers/   product, user, cart, order, upload
│   ├── models/        User, Product, Review, Cart, Order
│   ├── routes/
│   ├── middleware/    JWT auth (protect / admin), error handling
│   ├── utils/         pricing, delivery estimate, order progress simulation
│   └── data/          categories, Nepal provinces/districts, 46 seed products (NPR), seed script
└── client/src/
    ├── components/    Navbar, SearchBar, ProductCard, FilterSidebar, ImageGallery, …
    ├── pages/         Home, ProductList, Search, ProductDetail, Cart, Checkout, … , account/*
    ├── redux/         store, auth / cart / wishlist / ui slices
    ├── i18n/          LanguageProvider, useT(), ne.js (Nepali dictionary)
    ├── hooks/         useDebounce, useFetch, useCategories, useLocations
    └── utils/         api client, formatting (NPR, Nepali digits/dates), pricing
```

Product photos are loaded from the public [DummyJSON](https://dummyjson.com) image CDN. Brand names are used for demo purposes only.
