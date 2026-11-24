// Formatting helpers. The active language is set by LanguageProvider.
// Nepali is formatted by hand: many browsers (incl. Chrome) don't ship ICU data for "ne".
let lang = 'en';
export const setFormatLang = (l) => { lang = l; };
export const getFormatLang = () => lang;

const DEVANAGARI = '०१२३४५६७८९';
export const toNepaliDigits = (s) => String(s).replace(/[0-9]/g, (d) => DEVANAGARI[d]);
/** Convert digits only (no grouping) — for phone numbers, years, codes. */
export const localize = (s) => (lang === 'ne' ? toNepaliDigits(s) : String(s));

/** Lakh-style grouping (1,43,999) as used in Nepal; Devanagari digits in Nepali. */
export const formatNumber = (n, opts) => localize(new Intl.NumberFormat('en-IN', opts).format(n));

/** Nepalese Rupees: "Rs. 1,43,999" / "रू १,४३,९९९" */
export const formatPrice = (n) => `${lang === 'ne' ? 'रू' : 'Rs.'} ${formatNumber(Math.round(Number(n) || 0))}`;

const NE_MONTHS = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
const NE_DAYS = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
const NE_DAYS_SHORT = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

function nepaliDate(date, opts) {
  const parts = [];
  if (opts.weekday) parts.push(`${(opts.weekday === 'long' ? NE_DAYS : NE_DAYS_SHORT)[date.getDay()]},`);
  const md = [opts.month && NE_MONTHS[date.getMonth()], opts.day && toNepaliDigits(date.getDate())].filter(Boolean).join(' ');
  if (md) parts.push(md + (opts.year && opts.day ? ',' : ''));
  if (opts.year) parts.push(toNepaliDigits(date.getFullYear()));
  if (opts.hour) {
    const h = date.getHours();
    const period = h < 4 ? 'राति' : h < 12 ? 'बिहान' : h < 16 ? 'दिउँसो' : h < 19 ? 'साँझ' : 'राति';
    parts.push(`${period} ${toNepaliDigits(h % 12 || 12)}:${toNepaliDigits(String(date.getMinutes()).padStart(2, '0'))}`);
  }
  return parts.join(' ');
}

export const formatDate = (d, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  lang === 'ne' ? nepaliDate(new Date(d), opts) : new Date(d).toLocaleDateString('en-IN', opts);

export const formatDateTime = (d) => {
  const opts = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' };
  return lang === 'ne' ? nepaliDate(new Date(d), opts) : new Date(d).toLocaleString('en-IN', opts);
};

export const productImage = (p) => p?.image || p?.images?.[0] || '';

// English labels; pass through t() when displaying.
export const PAYMENT_LABELS = { ESEWA: 'eSewa', KHALTI: 'Khalti', CONNECTIPS: 'ConnectIPS / Mobile Banking', CARD: 'Credit / Debit Card', COD: 'Cash on Delivery' };
