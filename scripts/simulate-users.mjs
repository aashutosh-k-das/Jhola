/*
 * End-to-end test of the Jhola API with simulated shoppers.
 *
 *   node scripts/simulate-users.mjs [count]      (default 50; API must be running)
 *
 * Creates (or reuses) `count` test accounts and has each one browse, add an
 * address, fill a cart, place and pay for orders, review, wishlist and cancel.
 * Also checks admin permissions, security rules, stock integrity under
 * concurrent purchases, and API latency. Only ADDS data — nothing is deleted.
 * Accounts are written to scripts/test-accounts.csv.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.API_URL || 'http://localhost:5050/api';
const COUNT = Number(process.argv[2]) || 50;
const PASSWORD = 'Test@1234';

// ---------- tiny test harness ----------
const results = [];
function check(section, name, ok, detail = '') {
  results.push({ section, name, ok: Boolean(ok), detail });
  if (!ok) console.log(`  ✗ [${section}] ${name} ${detail}`);
  return ok;
}
async function api(method, url, { token, body } = {}) {
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(API + url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return { status: 0, data: { message: `network error: ${err.cause?.code || err.message}` }, ms: performance.now() - t0 };
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data, ms: performance.now() - t0 };
}
// Run async jobs with limited concurrency.
async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}
let seed = 2026;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rand() * a.length)];
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };

// ---------- test people ----------
const FIRST = ['Aarav', 'Sita', 'Bibek', 'Anjali', 'Prabin', 'Sushma', 'Nabin', 'Kabita', 'Suman', 'Rojina', 'Dipesh', 'Asmita', 'Ramesh', 'Srijana', 'Kiran', 'Pooja', 'Sagar', 'Manisha', 'Bishal', 'Sarita', 'Rajesh', 'Nisha', 'Anil', 'Pratiksha', 'Sandesh'];
const LAST = ['Shrestha', 'Gurung', 'Tamang', 'Rai', 'Limbu', 'Magar', 'Thapa', 'Karki', 'Adhikari', 'Poudel', 'Bhattarai', 'Maharjan', 'Shakya', 'KC', 'Basnet', 'Sherpa', 'Yadav', 'Chaudhary', 'Joshi', 'Pandey'];
const CITIES = { Kathmandu: 'Kathmandu Metropolitan City', Lalitpur: 'Lalitpur Metropolitan City', Bhaktapur: 'Bhaktapur Municipality', Kaski: 'Pokhara Metropolitan City', Morang: 'Biratnagar Metropolitan City', Chitwan: 'Bharatpur Metropolitan City', Rupandehi: 'Butwal Sub-Metropolitan City', Humla: 'Simkot Rural Municipality', Mustang: 'Gharapjhong Rural Municipality' };

const people = Array.from({ length: COUNT }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7) % LAST.length];
  const n = String(i + 1).padStart(2, '0');
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}.${n}@test.jhola.com.np`.toLowerCase(),
    phone: `98${String(41000000 + i * 1373).padStart(8, '0')}`,
  };
});

// =====================================================================
console.log(`\nJhola end-to-end test — ${COUNT} simulated shoppers against ${API}\n`);

const health = await api('GET', '/health');
if (!check('Setup', 'API is reachable', health.status === 200)) process.exit(1);

const { data: catalog } = await api('GET', '/products?limit=48&facets=false');
const { data: provinces } = await api('GET', '/locations');
const products = catalog.products;
const initialStock = Object.fromEntries(products.map((p) => [p._id, p.stock]));
const inStock = products.filter((p) => p.stock >= 5);
check('Setup', 'Catalog loaded', products.length >= 20, `${products.length} products`);
check('Setup', 'Locations loaded (7 provinces / 77 districts)', provinces.length === 7 && provinces.flatMap((p) => p.districts).length === 77);

// ---------- 1. Admin ----------
console.log('1. Admin login & permissions');
const adminLogin = await api('POST', '/users/login', { body: { email: 'admin@jhola.com', password: 'admin1234' } });
check('Admin', 'Admin can log in', adminLogin.status === 200 && adminLogin.data.token);
const adminToken = adminLogin.data?.token;
const adminMe = await api('GET', '/users/me', { token: adminToken });
check('Admin', 'Admin profile has isAdmin=true', adminMe.data?.isAdmin === true);
const adminBadProduct = await api('POST', '/products', { token: adminToken, body: { name: 'Incomplete' } });
check('Admin', 'Admin reaches create-product (validation rejects incomplete product)', adminBadProduct.status === 400, `got ${adminBadProduct.status}`);
const adminUpload = await api('POST', '/upload', { token: adminToken });
check('Admin', 'Admin upload says Cloudinary not configured', adminUpload.status === 503, `got ${adminUpload.status}`);
const wrongAdmin = await api('POST', '/users/login', { body: { email: 'admin@jhola.com', password: 'wrong' } });
check('Admin', 'Wrong admin password is rejected', wrongAdmin.status === 401);

// ---------- 2. Register accounts ----------
console.log(`2. Creating ${COUNT} accounts`);
const regTimes = [];
const accounts = await pool(people, 10, async (p) => {
  let r = await api('POST', '/users/register', { body: { ...p, password: PASSWORD } });
  let reused = false;
  if (r.status === 409) { // already created by an earlier run — log in instead
    r = await api('POST', '/users/login', { body: { email: p.email, password: PASSWORD } });
    reused = true;
  }
  regTimes.push(r.ms);
  check('Accounts', `Account ready: ${p.email}`, [200, 201].includes(r.status) && r.data?.token, `status ${r.status} ${r.data?.message || ''}`);
  return { ...p, token: r.data?.token, id: r.data?.user?._id, reused };
});
const created = accounts.filter((a) => a.token && !a.reused).length;
const reusedCount = accounts.filter((a) => a.reused).length;
check('Accounts', `${COUNT} accounts available`, accounts.every((a) => a.token), `${created} new, ${reusedCount} reused`);

// ---------- 3. Shopping journeys ----------
console.log('3. Shopping journeys (address → cart → order → pay → review)');
const allDistricts = provinces.flatMap((p) => p.districts.map((d) => d.en));
const placedOrders = []; // { id, items, status }
const methodCount = {};

await pool(accounts, 10, async (u, i) => {
  const T = u.token;
  const S = 'Journey';

  // Login with password
  const login = await api('POST', '/users/login', { body: { email: u.email, password: PASSWORD } });
  check(S, `${u.name}: password login`, login.status === 200);
  await api('DELETE', '/cart', { token: T }); // start fresh (leftovers from an earlier run)

  // Browse: search + category + product page
  const q = pick(['phone', 'shoe', 'laptop', 'kitchen', 'cricket', 'perfume']);
  const search = await api('GET', `/products?q=${q}&limit=5`);
  check(S, `${u.name}: search "${q}"`, search.status === 200);

  // Address (some users live in remote districts with no COD)
  const district = i % 10 === 9 ? pick(['Humla', 'Mustang']) : i % 3 === 0 ? pick(Object.keys(CITIES).slice(0, 7)) : pick(allDistricts);
  const addr = await api('POST', '/users/addresses', {
    token: T,
    body: { name: u.name, phone: u.phone, district, city: CITIES[district] || `${district} Municipality`, ward: String(1 + (i % 15)), address: `Tole ${i + 1}, House ${100 + i}`, isDefault: true },
  });
  check(S, `${u.name}: save address in ${district}`, addr.status === 201, addr.data?.message);
  const addressId = addr.data?.address?._id;
  const delivery = await api('GET', `/delivery/${encodeURIComponent(district)}`);
  check(S, `${u.name}: delivery estimate for ${district}`, delivery.status === 200 && delivery.data.days > 0);

  // Cart: 1–3 random products (pick a size when needed)
  const n = 1 + Math.floor(rand() * 3);
  const chosen = [...inStock].sort(() => rand() - 0.5).slice(0, n);
  for (const p of chosen) {
    const body = { productId: p._id, qty: 1 + Math.floor(rand() * 2) };
    if (p.variants?.sizes?.length) body.size = pick(p.variants.sizes);
    if (p.variants?.colors?.length) body.color = pick(p.variants.colors).name;
    const add = await api('POST', '/cart', { token: T, body });
    check(S, `${u.name}: add "${p.name.slice(0, 30)}" to cart`, add.status === 201, add.data?.message);
  }
  const cart = await api('GET', '/cart', { token: T });
  check(S, `${u.name}: cart has ${chosen.length} line(s)`, cart.data?.items?.length === chosen.length, `has ${cart.data?.items?.length}`);

  // Wishlist toggle
  const wl = await api('POST', `/users/wishlist/${pick(products)._id}`, { token: T });
  check(S, `${u.name}: wishlist toggle`, wl.status === 200);

  // Place order
  const remote = delivery.data?.codAvailable === false;
  let method = pick(['ESEWA', 'KHALTI', 'CONNECTIPS', 'CARD', 'COD', 'COD']);
  if (remote) {
    const codTry = await api('POST', '/orders', { token: T, body: { addressId, paymentMethod: 'COD' } });
    check(S, `${u.name}: COD refused in remote ${district}`, codTry.status === 400);
    method = 'ESEWA';
  }
  methodCount[method] = (methodCount[method] || 0) + 1;
  let ord = await api('POST', '/orders', { token: T, body: { addressId, paymentMethod: method } });
  if (ord.status === 429 && method === 'COD') { // security rule: max 3 open COD orders per customer
    check(S, `${u.name}: 4th open COD order is refused (anti-hoarding)`, true);
    methodCount.COD -= 1; method = 'ESEWA'; methodCount.ESEWA = (methodCount.ESEWA || 0) + 1;
    ord = await api('POST', '/orders', { token: T, body: { addressId, paymentMethod: method } });
  }
  if (!check(S, `${u.name}: place order (${method})`, ord.status === 201, ord.data?.message)) return;
  let order = ord.data.order;

  if (method !== 'COD') {
    if (i % 7 === 0) { // simulate a failed payment, then a successful retry
      const fail = await api('POST', `/orders/${order._id}/pay`, { token: T, body: { simulated: true, success: false } });
      check(S, `${u.name}: failed payment reported`, fail.status === 402);
    }
    const pay = await api('POST', `/orders/${order._id}/pay`, { token: T, body: { simulated: true, success: true } });
    check(S, `${u.name}: ${method} payment succeeds`, pay.status === 200 && pay.data.order.paymentStatus === 'Paid', pay.data?.message);
    order = pay.data?.order || order;
  }
  check(S, `${u.name}: order status is Placed`, order.status === 'Placed');
  const expectedTotal = order.items.reduce((s, it) => s + it.price * it.qty, 0) + order.deliveryCharge;
  check(S, `${u.name}: order total adds up`, order.totalPrice === expectedTotal, `${order.totalPrice} vs ${expectedTotal}`);
  check(S, `${u.name}: delivery charge rule (free ≥ Rs.1000)`, order.deliveryCharge === (order.itemsPrice >= 1000 ? 0 : 100));
  const cartAfter = await api('GET', '/cart', { token: T });
  check(S, `${u.name}: cart emptied after order`, cartAfter.data?.items?.length === 0);

  const entry = { id: order._id, items: order.items, status: 'Placed' };
  placedOrders.push(entry);

  // Review a purchased product → should be a "Certified Buyer"
  if (i % 2 === 0) {
    const pid = order.items[0].product;
    const rv = await api('POST', `/products/${pid}/reviews`, { token: T, body: { rating: 3 + (i % 3), title: 'Test review', comment: `Automated test review by ${u.name}` } });
    check(S, `${u.name}: review marked Certified Buyer`, rv.status === 201 && rv.data.verifiedPurchase === true, rv.data?.message);
  }

  // Some users cancel (stock must come back; paid orders → Refunded)
  if (i % 5 === 1) {
    const c = await api('PUT', `/orders/${order._id}/cancel`, { token: T });
    check(S, `${u.name}: cancel order`, c.status === 200 && c.data.status === 'Cancelled');
    if (method !== 'COD') check(S, `${u.name}: cancelled paid order is Refunded`, c.data.paymentStatus === 'Refunded');
    entry.status = 'Cancelled';
  }

  const myOrders = await api('GET', '/orders', { token: T });
  check(S, `${u.name}: sees own order in My Orders`, myOrders.data?.some((o) => o._id === order._id));
});

// ---------- 4. Security & validation ----------
console.log('4. Security & validation');
const [a, b] = accounts;
const S4 = 'Security';
check(S4, 'Duplicate email is rejected', (await api('POST', '/users/register', { body: { name: 'Dup', email: a.email, password: PASSWORD } })).status === 409);
check(S4, 'Wrong password is rejected', (await api('POST', '/users/login', { body: { email: a.email, password: 'nope1234' } })).status === 401);
check(S4, 'Short password is rejected at signup', (await api('POST', '/users/register', { body: { name: 'X', email: 'short.pw@test.jhola.com.np', password: '123' } })).status === 400);
check(S4, 'No token → 401 on cart', (await api('GET', '/cart')).status === 401);
check(S4, 'Forged token → 401', (await api('GET', '/orders', { token: 'abc.def.ghi' })).status === 401);
check(S4, 'Normal user cannot create products (403)', (await api('POST', '/products', { token: a.token, body: {} })).status === 403);
check(S4, 'Normal user cannot upload images (403)', (await api('POST', '/upload', { token: a.token })).status === 403);
const bOrder = placedOrders.find((o) => o.id) && (await api('GET', '/orders', { token: b.token })).data?.[0];
if (bOrder) check(S4, "User A cannot read user B's order", (await api('GET', `/orders/${bOrder._id}`, { token: a.token })).status === 404);
check(S4, 'Indian mobile number rejected for address', (await api('POST', '/users/addresses', { token: a.token, body: { name: 'X', phone: '7012345678', district: 'Kathmandu', city: 'KTM', address: 'x' } })).status === 400);
check(S4, 'Non-Nepal district rejected', (await api('POST', '/users/addresses', { token: a.token, body: { name: 'X', phone: '9812345678', district: 'Delhi', city: 'x', address: 'x' } })).status === 400);
const sized = products.find((p) => p.variants?.sizes?.length && p.stock > 0);
check(S4, 'Sized product needs a size', (await api('POST', '/cart', { token: a.token, body: { productId: sized._id, qty: 1 } })).status === 400);
const oos = products.find((p) => p.stock === 0);
if (oos) check(S4, 'Out-of-stock product cannot be added', (await api('POST', '/cart', { token: a.token, body: { productId: oos._id, qty: 1 } })).status === 400);
check(S4, 'Empty cart cannot be ordered', (await api('POST', '/orders', { token: a.token, body: { addressId: 'x', paymentMethod: 'COD' } })).status === 400);
check(S4, 'Unknown payment method rejected', (await api('POST', '/orders', { token: a.token, body: { paymentMethod: 'BITCOIN' } })).status === 400);
check(S4, 'Invalid rating rejected', (await api('POST', `/products/${products[0]._id}/reviews`, { token: a.token, body: { rating: 9 } })).status === 400);
check(S4, 'NoSQL-injection style login rejected', [400, 401].includes((await api('POST', '/users/login', { body: { email: { $gt: '' }, password: { $gt: '' } } })).status));

// OTP login for a brand-new person
const otpEmail = `otp.user.${Date.now()}@test.jhola.com.np`;
const otp = await api('POST', '/users/otp/send', { body: { email: otpEmail } });
check(S4, 'OTP sent', otp.status === 200 && /^\d{6}$/.test(otp.data.demoOtp));
check(S4, 'Wrong OTP rejected', (await api('POST', '/users/otp/verify', { body: { email: otpEmail, otp: '000000' } })).status === 400);
check(S4, 'Correct OTP logs in / creates account', (await api('POST', '/users/otp/verify', { body: { email: otpEmail, otp: otp.data.demoOtp, name: 'OTP Tester' } })).status === 200);

// ---------- 5. Concurrency: many buyers, little stock ----------
console.log('5. Stock race: 10 shoppers buy the same low-stock item at once');
const S5 = 'Stock race';
const { data: fresh } = await api('GET', '/products?limit=48&facets=false');
const scarce = fresh.products.filter((p) => p.stock > 0 && p.stock <= 6 && !p.variants?.sizes?.length).sort((x, y) => x.stock - y.stock)[0];
if (scarce) {
  const racers = accounts.slice(10, 20);
  for (const r of racers) {
    await api('POST', '/cart', { token: r.token, body: { productId: scarce._id, qty: 1 } });
  }
  const me = await Promise.all(racers.map((r) => api('GET', '/users/me', { token: r.token })));
  const attempts = await Promise.all(racers.map((r, k) => api('POST', '/orders', { token: r.token, body: { addressId: me[k].data.addresses[0]._id, paymentMethod: 'ESEWA' } })));
  const pays = await Promise.all(attempts.map((res, k) => (res.status === 201 ? api('POST', `/orders/${res.data.order._id}/pay`, { token: racers[k].token, body: { simulated: true, success: true } }) : null)));
  const wins = pays.filter((p) => p?.status === 200);
  const losers = attempts.filter((res) => res.status !== 201);
  check(S5, 'Losing buyers get a clear out-of-stock message', losers.every((l) => /out of stock|left/.test(l.data?.message || '')), losers[0]?.data?.message);
  await Promise.all(racers.map((r) => api('DELETE', '/cart', { token: r.token })));
  wins.forEach((w) => placedOrders.push({ id: w.data.order._id, items: w.data.order.items, status: 'Placed' }));
  const after = (await api('GET', `/products/${scarce._id}`)).data.product.stock;
  check(S5, `"${scarce.name.slice(0, 30)}" (stock ${scarce.stock}): exactly ${scarce.stock} purchases succeed`, wins.length === scarce.stock, `${wins.length} succeeded`);
  check(S5, 'Stock never goes negative', after === 0, `stock now ${after}`);
} else {
  check(S5, 'Found a low-stock product to race on', false, 'none available');
}

// ---------- 6. Search, filters, sorting ----------
console.log('6. Search, filters & sorting');
const S6 = 'Catalog';
const asc = (await api('GET', '/products?sort=price_asc&limit=48&facets=false')).data.products.map((p) => p.price);
check(S6, 'Price low→high is sorted', asc.every((v, k) => k === 0 || asc[k - 1] <= v));
const desc = (await api('GET', '/products?sort=price_desc&limit=48&facets=false')).data.products.map((p) => p.price);
check(S6, 'Price high→low is sorted', desc.every((v, k) => k === 0 || desc[k - 1] >= v));
const rated = (await api('GET', '/products?rating=4&limit=48&facets=false')).data.products;
check(S6, 'Rating ≥ 4 filter', rated.length > 0 && rated.every((p) => p.rating >= 4));
const range = (await api('GET', '/products?minPrice=1000&maxPrice=5000&limit=48&facets=false')).data.products;
check(S6, 'Price range Rs.1,000–5,000 filter', range.length > 0 && range.every((p) => p.price >= 1000 && p.price <= 5000));
const apple = (await api('GET', '/products?brand=Apple&limit=48&facets=false')).data.products;
check(S6, 'Brand filter (Apple)', apple.length > 0 && apple.every((p) => p.brand === 'Apple'));
const p1 = (await api('GET', '/products?limit=12&page=1&facets=false')).data;
const p2 = (await api('GET', '/products?limit=12&page=2&facets=false')).data;
check(S6, 'Pagination has no overlap', !p1.products.some((x) => p2.products.some((y) => y._id === x._id)));
check(S6, 'Pagination page count', p1.pages === Math.ceil(p1.total / 12));
check(S6, 'Gibberish search returns nothing', (await api('GET', '/products?q=zzqqxx')).data.total === 0);
check(S6, 'Regex characters in search are safe', (await api('GET', `/products?q=${encodeURIComponent('(.*[')}`)).status === 200);

// ---------- 7. Stock integrity ----------
console.log('7. Stock integrity');
const expectedDrop = {};
for (const o of placedOrders) {
  if (o.status === 'Cancelled') continue;
  for (const it of o.items) expectedDrop[it.product] = (expectedDrop[it.product] || 0) + it.qty;
}
const { data: finalCat } = await api('GET', '/products?limit=48&facets=false');
let mismatches = 0;
for (const p of finalCat.products) {
  const expected = initialStock[p._id] - (expectedDrop[p._id] || 0);
  if (p.stock !== expected) { mismatches++; check('Stock', `Stock of "${p.name.slice(0, 30)}"`, false, `expected ${expected}, got ${p.stock}`); }
}
check('Stock', 'Every product stock = start − sold + cancelled', mismatches === 0, `${mismatches} mismatches`);

// ---------- 8. Load ----------
// Browsers reuse a few connections per site, so cap in-flight requests at 100 (macOS queues only 128 new connections).
console.log('8. Load: 50 shoppers loading the home page at once (≤100 requests in flight)');
const homeCalls = ['/products?deal=true&sort=discount&limit=12&facets=false', '/products?featured=true&limit=8&facets=false', '/categories', '/products/brands', '/products?category=mobiles&sort=rating&limit=10&facets=false'];
const t0 = performance.now();
const loads = await pool(accounts.flatMap(() => homeCalls), 100, (c) => api('GET', c));
const wall = performance.now() - t0;
const times = loads.map((l) => l.ms);
check('Load', `${loads.length} requests all succeeded`, loads.every((l) => l.status === 200));
check('Load', 'p95 latency under 1.5 s', pct(times, 95) < 1500, `p95 ${pct(times, 95).toFixed(0)} ms`);

// ---------- report ----------
const sections = [...new Set(results.map((r) => r.section))];
const passed = results.filter((r) => r.ok).length;
console.log('\n================ RESULTS ================');
for (const s of sections) {
  const rs = results.filter((r) => r.section === s);
  const ok = rs.filter((r) => r.ok).length;
  console.log(`${ok === rs.length ? '✅' : '❌'} ${s.padEnd(12)} ${ok}/${rs.length}`);
}
console.log(`\nTOTAL: ${passed}/${results.length} checks passed`);
console.log(`Orders placed: ${placedOrders.length} (${placedOrders.filter((o) => o.status === 'Cancelled').length} cancelled) · payment mix: ${JSON.stringify(methodCount)}`);
console.log(`Load: ${loads.length} requests in ${(wall / 1000).toFixed(2)} s · p50 ${pct(times, 50).toFixed(0)} ms · p95 ${pct(times, 95).toFixed(0)} ms · max ${Math.max(...times).toFixed(0)} ms`);
console.log(`Signup/login latency: p50 ${pct(regTimes, 50).toFixed(0)} ms · p95 ${pct(regTimes, 95).toFixed(0)} ms`);

const csv = ['name,email,password,phone', ...accounts.map((x) => `${x.name},${x.email},${PASSWORD},${x.phone}`)].join('\n');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'test-accounts.csv');
fs.writeFileSync(out, csv + '\n');
console.log(`\nTest accounts saved to ${out}`);
process.exit(passed === results.length ? 0 : 1);
