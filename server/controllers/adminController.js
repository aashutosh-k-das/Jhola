const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');

const LIVE = { status: { $nin: ['Payment Pending', 'Cancelled'] } }; // orders that count as sales
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  const days = 14;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [customers, newCustomers, [totals], byStatus, byMethod, daily, topProducts, lowStock, recent] = await Promise.all([
    User.countDocuments({ isAdmin: false }),
    User.countDocuments({ isAdmin: false, createdAt: { $gte: since } }),
    Order.aggregate([{ $match: LIVE }, { $group: { _id: null, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 }, units: { $sum: { $sum: '$items.qty' } } } }]),
    Order.aggregate([{ $match: { status: { $ne: 'Payment Pending' } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: LIVE }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }, { $sort: { revenue: -1 } }]),
    Order.aggregate([
      { $match: { ...LIVE, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kathmandu' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: LIVE },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, units: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Product.find({ stock: { $lte: 5 } }).select('name images stock slug').sort({ stock: 1 }).limit(10).lean(),
    Order.find({ status: { $ne: 'Payment Pending' } }).sort({ createdAt: -1 }).limit(6).populate('user', 'name email').lean(),
  ]);

  // Fill missing days with zero so the chart has a continuous axis.
  const map = Object.fromEntries(daily.map((d) => [d._id, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
    return { date: key, revenue: map[key]?.revenue || 0, orders: map[key]?.orders || 0 };
  });

  res.json({
    customers,
    newCustomers,
    revenue: totals?.revenue || 0,
    orders: totals?.orders || 0,
    units: totals?.units || 0,
    avgOrder: totals?.orders ? Math.round(totals.revenue / totals.orders) : 0,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    byMethod: byMethod.map((m) => ({ method: m._id, count: m.count, revenue: m.revenue })),
    daily: series,
    topProducts,
    lowStock,
    recent,
  });
};

// GET /api/admin/orders?status=&q=&page=
exports.getOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 15;
  const filter = { status: req.query.status || { $ne: 'Payment Pending' } };
  const q = String(req.query.q || '').trim();
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ email: re }, { name: re }] }).select('_id').lean();
    filter.$or = [{ orderId: re }, { 'shippingAddress.name': re }, { 'shippingAddress.phone': re }, { user: { $in: users.map((u) => u._id) } }];
  }
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, page, pages: Math.max(1, Math.ceil(total / limit)), total });
};

const NEXT = { Placed: ['Shipped', 'Cancelled'], Shipped: ['Out for Delivery', 'Cancelled'], 'Out for Delivery': ['Delivered'], Delivered: [], Cancelled: [] };

// PUT /api/admin/orders/:id/status  { status }
exports.updateOrderStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Order not found');
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  const { status } = req.body;
  if (!(NEXT[order.status] || []).includes(status)) {
    throw new HttpError(400, `Cannot change an order from "${order.status}" to "${status}"`);
  }
  if (status === 'Cancelled') {
    await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
    if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  }
  if (status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid';
  order.setStatus(status);
  await order.save();
  await order.populate('user', 'name email');
  res.json(order);
};

// GET /api/admin/users?q=&page=
exports.getUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 20;
  const q = String(req.query.q || '').trim();
  const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { email: new RegExp(escapeRegex(q), 'i') }, { phone: new RegExp(escapeRegex(q), 'i') }] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).select('name email phone isAdmin createdAt addresses').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([
    { $match: { ...LIVE, user: { $in: users.map((u) => u._id) } } },
    { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalPrice' }, last: { $max: '$createdAt' } } },
  ]);
  const byUser = Object.fromEntries(stats.map((s) => [String(s._id), s]));
  res.json({
    users: users.map((u) => ({
      _id: u._id, name: u.name, email: u.email, phone: u.phone, isAdmin: u.isAdmin, createdAt: u.createdAt,
      district: (u.addresses?.find((a) => a.isDefault) || u.addresses?.[0])?.district || '',
      orders: byUser[String(u._id)]?.orders || 0,
      spent: byUser[String(u._id)]?.spent || 0,
      lastOrder: byUser[String(u._id)]?.last || null,
    })),
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
};

const EDITABLE = ['name', 'description', 'price', 'mrp', 'stock', 'brand', 'category', 'subCategory', 'images', 'highlights', 'isFeatured', 'isDeal'];

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found');
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  for (const k of EDITABLE) if (req.body[k] !== undefined) product[k] = req.body[k];
  if (product.price > product.mrp) throw new HttpError(400, 'Price cannot be higher than MRP');
  await product.save(); // recomputes discount
  res.json(product);
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found');
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw new HttpError(404, 'Product not found');
  res.json({ deleted: true });
};
