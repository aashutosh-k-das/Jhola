// Prices are in Nepalese Rupees (NPR). Keep in sync with client/src/utils/pricing.js
const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_CHARGE = 100;

function summarize(lines) {
  const itemsMrp = lines.reduce((s, l) => s + l.mrp * l.qty, 0);
  const itemsPrice = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const deliveryCharge = itemsPrice === 0 || itemsPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  return {
    itemsMrp,
    itemsPrice,
    discount: itemsMrp - itemsPrice,
    deliveryCharge,
    totalPrice: itemsPrice + deliveryCharge,
  };
}

module.exports = { summarize, FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE };
