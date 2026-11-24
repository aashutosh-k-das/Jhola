// Prices are in Nepalese Rupees (NPR). Keep in sync with server/utils/pricing.js
export const FREE_DELIVERY_THRESHOLD = 1000;
export const DELIVERY_CHARGE = 100;

export function summarizeCart(items) {
  const lines = items.filter((i) => i.product);
  const count = lines.reduce((s, i) => s + i.qty, 0);
  const itemsMrp = lines.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const itemsPrice = lines.reduce((s, i) => s + i.product.price * i.qty, 0);
  const deliveryCharge = itemsPrice === 0 || itemsPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  return { count, itemsMrp, itemsPrice, discount: itemsMrp - itemsPrice, deliveryCharge, totalPrice: itemsPrice + deliveryCharge };
}
