// Simulates an order moving through the delivery pipeline over time so that
// "Track order" shows realistic progress without a logistics backend.
const FLOW = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered'];
const HOUR = 60 * 60 * 1000;

function targetStatus(order, now = Date.now()) {
  const placedAt = new Date(order.statusHistory?.find((h) => h.status === 'Placed')?.date || order.createdAt).getTime();
  const eta = new Date(order.estimatedDelivery).getTime();
  if (now >= eta) return 'Delivered';
  if (now >= eta - 12 * HOUR) return 'Out for Delivery';
  if (now >= placedAt + 12 * HOUR) return 'Shipped';
  return 'Placed';
}

/** Advances order status in place; returns true if it changed. */
function advanceOrder(order, now = Date.now()) {
  if (!FLOW.includes(order.status)) return false;
  const target = targetStatus(order, now);
  let changed = false;
  while (FLOW.indexOf(order.status) < FLOW.indexOf(target)) {
    order.setStatus(FLOW[FLOW.indexOf(order.status) + 1]);
    changed = true;
  }
  return changed;
}

module.exports = { advanceOrder, FLOW };
