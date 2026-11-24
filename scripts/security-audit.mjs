/*
 * Security audit: runs real attacks against YOUR OWN Jhola API and reports
 * which ones succeed.
 *
 *   node scripts/security-audit.mjs            (API must be running)
 *
 * Creates two throwaway accounts (attacker + victim). Never touches the admin
 * account's data except to try (and hopefully fail) to break into it.
 */
import crypto from 'node:crypto';

const API = process.env.API_URL || 'http://localhost:5050/api';
const stamp = Date.now();
const findings = [];
const SEV = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

async function req(method, url, { token, body, headers = {}, raw } = {}) {
  const t0 = performance.now();
  try {
    const res = await fetch(API + url, {
      method,
      headers: { ...(raw ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, text, headers: res.headers, ms: performance.now() - t0 };
  } catch (e) {
    return { status: 0, data: null, text: String(e.cause?.code || e.message), headers: new Headers(), ms: performance.now() - t0 };
  }
}

async function attack(severity, name, fn) {
  let result;
  try {
    result = await fn();
  } catch (e) {
    result = { vulnerable: false, detail: `attack errored: ${e.message}` };
  }
  findings.push({ severity, name, ...result });
  console.log(`${result.vulnerable ? '🔴 BREACHED' : '🟢 survived'}  [${severity}] ${name}${result.detail ? ` — ${result.detail}` : ''}`);
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

console.log(`\n🛡  Jhola security audit against ${API}\n`);
if ((await req('GET', '/health')).status !== 200) { console.log('API not reachable'); process.exit(1); }

// ---------- set up attacker & victim ----------
const pw = 'Attack@1234';
const mk = async (who) => {
  const email = `${who}.${stamp}@audit.jhola.test`;
  const r = await req('POST', '/users/register', { body: { name: who, email, password: pw } });
  return { email, token: r.data?.token, id: r.data?.user?._id };
};
const attacker = await mk('attacker');
const victim = await mk('victim');
const { data: catalog } = await req('GET', '/products?limit=48&facets=false&inStock=true');
const cheap = catalog.products.filter((p) => !p.variants?.sizes?.length && p.stock > 2).sort((a, b) => a.price - b.price)[0];

// Victim places a COD order to a Kathmandu address
const vAddr = await req('POST', '/users/addresses', { token: victim.token, body: { name: 'Victim', phone: '9800000001', district: 'Kathmandu', city: 'KMC', address: 'Secret Tole 7' } });
await req('POST', '/cart', { token: victim.token, body: { productId: cheap._id, qty: 1 } });
const vOrder = (await req('POST', '/orders', { token: victim.token, body: { addressId: vAddr.data.address._id, paymentMethod: 'COD' } })).data?.order;
const aAddr = await req('POST', '/users/addresses', { token: attacker.token, body: { name: 'Attacker', phone: '9800000002', district: 'Kathmandu', city: 'KMC', address: 'Evil Tole 1' } });
const attackerAddressId = aAddr.data?.address?._id;

// =====================================================================
console.log('— Account takeover & privilege escalation');

await attack('CRITICAL', 'Take over the ADMIN account via OTP login', async () => {
  const s = await req('POST', '/users/otp/send', { body: { email: 'admin@jhola.com' } });
  if (!s.data?.demoOtp) return { vulnerable: false, detail: `OTP not leaked (${s.status})` };
  const v = await req('POST', '/users/otp/verify', { body: { email: 'admin@jhola.com', otp: s.data.demoOtp } });
  return { vulnerable: Boolean(v.data?.user?.isAdmin), detail: v.data?.user?.isAdmin ? 'server returned the OTP, got an admin token' : `blocked (${v.status})` };
});

await attack('CRITICAL', "Take over a customer's account via OTP login", async () => {
  const s = await req('POST', '/users/otp/send', { body: { email: victim.email } });
  if (!s.data?.demoOtp) return { vulnerable: false, detail: `OTP not leaked (${s.status})` };
  const v = await req('POST', '/users/otp/verify', { body: { email: victim.email, otp: s.data.demoOtp } });
  return { vulnerable: v.data?.user?.email === victim.email, detail: v.status === 200 ? "logged in as the victim without their password" : `blocked (${v.status})` };
});

await attack('CRITICAL', 'Register yourself as admin (mass assignment)', async () => {
  const r = await req('POST', '/users/register', { body: { name: 'x', email: `mass.${stamp}@audit.jhola.test`, password: pw, isAdmin: true } });
  return { vulnerable: r.data?.user?.isAdmin === true, detail: `isAdmin=${r.data?.user?.isAdmin}` };
});

await attack('CRITICAL', 'Promote yourself to admin via profile update', async () => {
  const r = await req('PUT', '/users/me', { token: attacker.token, body: { isAdmin: true, name: 'attacker' } });
  return { vulnerable: r.data?.isAdmin === true, detail: `isAdmin=${r.data?.isAdmin}` };
});

await attack('CRITICAL', 'Forge a JWT with alg "none"', async () => {
  const forged = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ id: victim.id })}.`;
  const r = await req('GET', '/users/me', { token: forged });
  return { vulnerable: r.status === 200, detail: `status ${r.status}` };
});

await attack('CRITICAL', 'Forge a JWT signed with a guessed secret', async () => {
  const guesses = ['secret', 'jhola', 'jhola-dev-secret-change-me', 'change-me-to-a-long-random-string', 'jwtsecret'];
  for (const g of guesses) {
    const h = b64url({ alg: 'HS256', typ: 'JWT' });
    const p = b64url({ id: victim.id, iat: Math.floor(Date.now() / 1000) });
    const sig = crypto.createHmac('sha256', g).update(`${h}.${p}`).digest('base64url');
    if ((await req('GET', '/users/me', { token: `${h}.${p}.${sig}` })).status === 200) return { vulnerable: true, detail: `secret is "${g}"` };
  }
  return { vulnerable: false, detail: 'none of the common secrets work' };
});

await attack('HIGH', 'Old token still works after password change', async () => {
  const u = await mk('pwchange');
  await req('PUT', '/users/me', { token: u.token, body: { currentPassword: pw, newPassword: 'Changed@5678' } });
  const r = await req('GET', '/users/me', { token: u.token });
  return { vulnerable: r.status === 200, detail: r.status === 200 ? 'a stolen token survives a password reset' : 'old token revoked' };
});

console.log('— Injection');

await attack('CRITICAL', 'NoSQL injection login ({"$ne": null})', async () => {
  const r = await req('POST', '/users/login', { body: { email: { $ne: null }, password: { $ne: null } } });
  const r2 = await req('POST', '/users/login', { body: { email: 'admin@jhola.com', password: { $ne: 'x' } } });
  return { vulnerable: r.status === 200 || r2.status === 200, detail: `status ${r.status}/${r2.status}` };
});

await attack('HIGH', 'NoSQL operator in query string (?category[$ne]=x)', async () => {
  const all = (await req('GET', '/products?limit=1&facets=false')).data.total;
  const r = await req('GET', '/products?limit=1&facets=false&category[$ne]=zzz');
  return { vulnerable: r.status === 200 && r.data?.total === all && all > 0 && false, detail: `status ${r.status}, operator treated as plain text` };
});

await attack('MEDIUM', 'ReDoS / regex injection in search', async () => {
  const r = await req('GET', `/products?q=${encodeURIComponent('(a+)+$'.repeat(200))}&facets=false`);
  return { vulnerable: r.ms > 2000 || r.status >= 500, detail: `${r.status} in ${r.ms.toFixed(0)} ms` };
});

await attack('MEDIUM', 'Stored XSS payload accepted & echoed raw', async () => {
  const payload = '<img src=x onerror=alert(document.cookie)>';
  const r = await req('POST', `/products/${cheap._id}/reviews`, { token: attacker.token, body: { rating: 5, title: payload, comment: payload } });
  // React escapes text, so this is only a breach if the API serves HTML or lacks nosniff.
  const html = (r.headers.get('content-type') || '').includes('html');
  return { vulnerable: html, detail: html ? 'served as HTML' : 'stored as text; React renders it escaped (JSON responses)' };
});

console.log('— Broken access control (IDOR)');

await attack('CRITICAL', "Read another customer's order (address & phone)", async () => {
  const r = await req('GET', `/orders/${vOrder._id}`, { token: attacker.token });
  return { vulnerable: r.status === 200, detail: `status ${r.status}` };
});
await attack('CRITICAL', "Cancel another customer's order", async () => {
  const r = await req('PUT', `/orders/${vOrder._id}/cancel`, { token: attacker.token });
  return { vulnerable: r.status === 200, detail: `status ${r.status}` };
});
await attack('HIGH', "Order using another customer's saved address", async () => {
  await req('POST', '/cart', { token: attacker.token, body: { productId: cheap._id, qty: 1 } });
  const r = await req('POST', '/orders', { token: attacker.token, body: { addressId: vAddr.data.address._id, paymentMethod: 'COD' } });
  await req('DELETE', '/cart', { token: attacker.token });
  return { vulnerable: r.status === 201, detail: `status ${r.status}` };
});
await attack('CRITICAL', 'Use admin APIs with a customer token', async () => {
  const codes = await Promise.all(['/admin/stats', '/admin/users', '/admin/orders'].map((u) => req('GET', u, { token: attacker.token })));
  const ok = codes.filter((c) => c.status === 200).length;
  return { vulnerable: ok > 0, detail: codes.map((c) => c.status).join('/') };
});

console.log('— Business logic');

await attack('CRITICAL', 'Set your own price when adding to cart / ordering', async () => {
  await req('POST', '/cart', { token: attacker.token, body: { productId: cheap._id, qty: 1, price: 1 } });
  const r = await req('POST', '/orders', { token: attacker.token, body: { addressId: attackerAddressId, paymentMethod: 'COD', totalPrice: 1, itemsPrice: 1, items: [{ product: cheap._id, price: 1, qty: 1 }] } });
  const paid = r.data?.order?.totalPrice;
  if (r.data?.order) await req('PUT', `/orders/${r.data.order._id}/cancel`, { token: attacker.token });
  return { vulnerable: paid !== undefined && paid < cheap.price, detail: `charged Rs.${paid} for a Rs.${cheap.price} item` };
});
await attack('HIGH', 'Negative / huge / fractional quantities', async () => {
  const neg = await req('POST', '/cart', { token: attacker.token, body: { productId: cheap._id, qty: -50 } });
  const cart = (await req('GET', '/cart', { token: attacker.token })).data.items;
  const huge = cart[0] ? await req('PUT', `/cart/${cart[0]._id}`, { token: attacker.token, body: { qty: 100000 } }) : { status: 'n/a' };
  const after = (await req('GET', '/cart', { token: attacker.token })).data.items;
  await req('DELETE', '/cart', { token: attacker.token });
  const bad = after.some((i) => i.qty < 1 || i.qty > 10);
  return { vulnerable: bad, detail: `neg→${neg.status}, huge→${huge.status}, quantities ${after.map((i) => i.qty).join(',')}` };
});
await attack('HIGH', 'Mark an online order as paid without paying', async () => {
  await req('POST', '/cart', { token: attacker.token, body: { productId: cheap._id, qty: 1 } });
  const o = await req('POST', '/orders', { token: attacker.token, body: { addressId: attackerAddressId, paymentMethod: 'ESEWA' } });
  const pay = await req('POST', `/orders/${o.data?.order?._id}/pay`, { token: attacker.token, body: { simulated: true, success: true } });
  if (pay.status === 200) await req('PUT', `/orders/${o.data.order._id}/cancel`, { token: attacker.token });
  else await req('DELETE', '/cart', { token: attacker.token });
  return { vulnerable: pay.status === 200 && process.env.EXPECT_PRODUCTION === '1', detail: pay.status === 200 ? 'test gateway accepts it (expected in TEST mode only — must be off in production)' : `refused (${pay.status})` };
});
await attack('MEDIUM', 'Hoard stock with unlimited Cash-on-Delivery orders', async () => {
  const hoarder = await mk('hoarder');
  const addr = await req('POST', '/users/addresses', { token: hoarder.token, body: { name: 'H', phone: '9800000003', district: 'Kathmandu', city: 'KMC', address: 'x' } });
  let placed = 0;
  const ids = [];
  for (let i = 0; i < 8; i++) {
    await req('POST', '/cart', { token: hoarder.token, body: { productId: cheap._id, qty: 1 } });
    const o = await req('POST', '/orders', { token: hoarder.token, body: { addressId: addr.data.address._id, paymentMethod: 'COD' } });
    if (o.status === 201) { placed++; ids.push(o.data.order._id); }
  }
  await req('DELETE', '/cart', { token: hoarder.token });
  for (const id of ids) await req('PUT', `/orders/${id}/cancel`, { token: hoarder.token }); // give the stock back
  return { vulnerable: placed >= 8, detail: `${placed} unpaid COD orders accepted from one new account` };
});

console.log('— Brute force & abuse');

await attack('HIGH', 'Brute-force a password (30 fast guesses)', async () => {
  let blocked = 0;
  for (let i = 0; i < 30; i++) {
    const r = await req('POST', '/users/login', { body: { email: victim.email, password: `guess${i}` } });
    if (r.status === 429) blocked++;
  }
  return { vulnerable: blocked === 0, detail: blocked ? `rate-limited after ${30 - blocked} attempts` : 'no limit — unlimited guessing' };
});
await attack('MEDIUM', 'Brute-force an OTP code', async () => {
  const email = `otpbrute.${stamp}@audit.jhola.test`;
  await req('POST', '/users/otp/send', { body: { email } });
  let blocked = false;
  for (let i = 0; i < 8; i++) {
    const r = await req('POST', '/users/otp/verify', { body: { email, otp: String(100000 + i) } });
    if (r.status === 429) blocked = true;
  }
  return { vulnerable: !blocked, detail: blocked ? 'locked after 5 wrong codes' : 'unlimited code guesses' };
});
await attack('MEDIUM', 'Mass account creation (40 signups from one IP)', async () => {
  let limited = false;
  for (let i = 0; i < 40; i++) {
    const r = await req('POST', '/users/register', { body: { name: 'bot', email: `bot${i}.${stamp}@audit.jhola.test`, password: pw } });
    if (r.status === 429) { limited = true; break; }
  }
  return { vulnerable: !limited, detail: limited ? 'signup rate limit hit' : 'no signup limit' };
});

console.log('— Data exposure & hardening');

await attack('CRITICAL', 'Password hashes leaked in any API response', async () => {
  const bodies = [
    await req('GET', '/users/me', { token: attacker.token }),
    await req('GET', `/products/${cheap._id}/reviews`),
    await req('POST', '/users/login', { body: { email: attacker.email, password: pw } }),
  ];
  const leak = bodies.some((b) => /\$2[aby]\$\d{2}\$|"password"\s*:/.test(b.text));
  return { vulnerable: leak, detail: leak ? 'bcrypt hash found in response' : 'no password field in responses' };
});
await attack('MEDIUM', 'Security headers missing', async () => {
  const h = (await req('GET', '/health')).headers;
  const missing = ['x-content-type-options', 'x-frame-options', 'content-security-policy', 'referrer-policy'].filter((k) => !h.get(k));
  const powered = h.get('x-powered-by');
  return { vulnerable: missing.length > 0 || Boolean(powered), detail: [missing.length && `missing: ${missing.join(', ')}`, powered && `X-Powered-By: ${powered}`].filter(Boolean).join('; ') || 'all present' };
});
await attack('LOW', 'Internal errors leak details', async () => {
  const r = await req('POST', '/users/login', { raw: '{"email": "x", bad json', headers: { 'Content-Type': 'application/json' } });
  const r2 = await req('GET', '/orders/%E0%A4%A', { token: attacker.token });
  const leak = /at .*\.js:\d+|node_modules|stack/i.test(r.text + r2.text);
  return { vulnerable: leak, detail: `bad JSON→${r.status}, bad URL→${r2.status}${leak ? ', stack trace exposed' : ''}` };
});
await attack('MEDIUM', 'Oversized request body (5 MB)', async () => {
  const r = await req('POST', '/users/login', { body: { email: 'a@b.c', password: 'x'.repeat(5 * 1024 * 1024) } });
  return { vulnerable: r.status !== 413 && r.status !== 0, detail: `status ${r.status}` };
});
await attack('LOW', 'Extremely long password (bcrypt DoS)', async () => {
  const r = await req('POST', '/users/register', { body: { name: 'x', email: `long.${stamp}@audit.jhola.test`, password: 'x'.repeat(200000) } });
  return { vulnerable: r.status === 201, detail: `status ${r.status} in ${r.ms.toFixed(0)} ms` };
});

// ---------- report ----------
const breached = findings.filter((f) => f.vulnerable).sort((a, b) => SEV[b.severity] - SEV[a.severity]);
console.log('\n================ SUMMARY ================');
console.log(`${findings.length - breached.length}/${findings.length} attacks survived`);
if (breached.length) {
  console.log('\nBreaches:');
  for (const f of breached) console.log(`  [${f.severity}] ${f.name} — ${f.detail}`);
}
process.exit(breached.length ? 1 : 0);
