const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');
const { summarize } = require('../utils/pricing');
const { estimateDelivery } = require('../utils/delivery');
const { advanceOrder } = require('../utils/orderProgress');
const env = require('../../config/env');

const MAX_OPEN_COD_ORDERS = 3;

const { PAYMENT_METHODS } = Order;

function newOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `JHL${ymd}${crypto.randomInt(10_000_000, 100_000_000)}`;
}

/** Atomically reserve stock for every line; rolls back on failure. */
async function reserveStock(items) {
  const done = [];
  for (const item of items) {
    const res = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } }
    );
    if (res.modifiedCount !== 1) {
      await Promise.all(done.map((d) => Product.updateOne({ _id: d.product }, { $inc: { stock: d.qty } })));
      throw new HttpError(409, `Sorry, "${item.name}" just went out of stock (or not enough units left)`);
    }
    done.push(item);
  }
}

const restock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));

async function finalizeOrder(order) {
  await reserveStock(order.items);
  order.setStatus('Placed');
  await order.save();
  await Cart.updateOne({ user: order.user }, { $set: { items: [] } });
}

async function loadOwnOrder(req) {
  const { id } = req.params;
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { orderId: id };
  const order = await Order.findOne(query);
  if (!order || (!order.user.equals(req.user._id) && !req.user.isAdmin)) throw new HttpError(404, 'Order not found');
  return order;
}

// POST /api/orders  { addressId, paymentMethod }
exports.createOrder = async (req, res) => {
  const { addressId, paymentMethod } = req.body;
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Please choose a valid payment method');

  const address = req.user.addresses.id(addressId);
  if (!address) throw new HttpError(400, 'Please select a delivery address');

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart?.items || []).filter((i) => i.product);
  if (!lines.length) throw new HttpError(400, 'Your cart is empty');

  for (const l of lines) {
    if (l.product.stock < l.qty) {
      throw new HttpError(409, l.product.stock
        ? `Only ${l.product.stock} unit(s) of "${l.product.name}" left. Please update your cart`
        : `"${l.product.name}" is out of stock. Please remove it from your cart`);
    }
  }

  const items = lines.map((l) => ({
    product: l.product._id,
    name: l.product.name,
    image: l.product.images[0],
    brand: l.product.brand,
    price: l.product.price,
    mrp: l.product.mrp,
    qty: l.qty,
    size: l.size,
    color: l.color,
  }));
  const totals = summarize(items);
  const delivery = estimateDelivery(address.district);
  if (!delivery) throw new HttpError(400, 'Please update your address with a valid district');
  if (paymentMethod === 'COD') {
    const open = await Order.countDocuments({ user: req.user._id, paymentMethod: 'COD', status: { $in: ['Placed', 'Shipped', 'Out for Delivery'] } });
    if (open >= MAX_OPEN_COD_ORDERS) {
      throw new HttpError(429, `You already have ${open} Cash on Delivery orders on the way. Please pay online or wait for them to be delivered.`);
    }
  }
  if (paymentMethod === 'COD' && !delivery.codAvailable) {
    throw new HttpError(400, `Cash on Delivery is not available in ${delivery.district}`);
  }

  const order = new Order({
    orderId: newOrderId(),
    user: req.user._id,
    items,
    shippingAddress: address.toObject(),
    paymentMethod,
    ...totals,
    estimatedDelivery: delivery.date,
    status: 'Payment Pending',
    statusHistory: [],
  });

  if (paymentMethod === 'COD') {
    await finalizeOrder(order);
    return res.status(201).json({ order, payment: null });
  }

  // Online methods (eSewa, Khalti, ConnectIPS, Card) go through the Jhola test gateway.
  const payment = { provider: 'simulated', amount: totals.totalPrice, currency: 'NPR', method: paymentMethod };
  order.statusHistory.push({ status: 'Payment Pending' });
  await order.save();
  res.status(201).json({ order, payment });
};

// POST /api/orders/:id/pay   { simulated: true, success: boolean }
// To go live, replace this with eSewa / Khalti server-side verification using merchant credentials.
exports.payOrder = async (req, res) => {
  const order = await loadOwnOrder(req);
  if (order.status !== 'Payment Pending') throw new HttpError(400, 'This order is not awaiting payment');
  if (!env.testPayments) throw new HttpError(503, 'Online payment verification is not configured');
  if (!req.body.simulated) throw new HttpError(400, 'Online payments are running in test mode');
  if (req.body.success === false) {
    order.paymentStatus = 'Failed';
    await order.save();
    throw new HttpError(402, 'Payment failed. You have not been charged; please try again');
  }
  const prefix = { ESEWA: 'esw', KHALTI: 'khl', CONNECTIPS: 'cips', CARD: 'card' }[order.paymentMethod] || 'pay';
  order.paymentResult = { provider: 'simulated', paymentId: `${prefix}_test_${crypto.randomBytes(6).toString('hex')}`, paidAt: new Date() };
  order.paymentStatus = 'Paid';
  await finalizeOrder(order);
  res.json({ order });
};

// GET /api/orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id, status: { $ne: 'Payment Pending' } }).sort({ createdAt: -1 });
  await Promise.all(orders.map((o) => (advanceOrder(o) ? o.save() : null)));
  res.json(orders);
};

// GET /api/orders/:id   (accepts Mongo _id or the public orderId)
exports.getOrder = async (req, res) => {
  const order = await loadOwnOrder(req);
  if (advanceOrder(order)) await order.save();
  res.json(order);
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  const order = await loadOwnOrder(req);
  advanceOrder(order);
  if (!['Placed', 'Shipped', 'Payment Pending'].includes(order.status)) {
    throw new HttpError(400, `Order cannot be cancelled once it is ${order.status.toLowerCase()}`);
  }
  if (order.status !== 'Payment Pending') await restock(order.items);
  if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  order.setStatus('Cancelled');
  await order.save();
  res.json(order);
};

