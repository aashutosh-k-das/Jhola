const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');

const PRODUCT_FIELDS = 'name slug images price mrp discount stock brand variants';
const MAX_QTY = 10;

async function getOrCreateCart(userId) {
  return (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });
}

async function sendCart(res, cart, status = 200) {
  await cart.populate({ path: 'items.product', select: PRODUCT_FIELDS });
  const items = cart.items
    .filter((i) => i.product)
    .map((i) => ({ _id: i._id, product: i.product, qty: i.qty, size: i.size, color: i.color }));
  res.status(status).json({ items });
}

async function addLine(cart, { productId, qty = 1, size = '', color = '' }, { strict = true } = {}) {
  if (!mongoose.isValidObjectId(productId)) {
    if (strict) throw new HttpError(404, 'Product not found');
    return;
  }
  const product = await Product.findById(productId).select('stock variants name');
  const fail = (status, msg) => { if (strict) throw new HttpError(status, msg); };
  if (!product) return fail(404, 'Product not found');
  if (product.stock <= 0) return fail(400, `${product.name} is out of stock`);
  if (product.variants?.sizes?.length && !size) return fail(400, 'Please select a size');

  const max = Math.min(MAX_QTY, product.stock);
  const existing = cart.items.find((i) => i.product.equals(product._id) && i.size === size && i.color === color);
  const add = Math.max(1, parseInt(qty, 10) || 1);
  if (existing) existing.qty = Math.min(max, existing.qty + add);
  else cart.items.push({ product: product._id, qty: Math.min(max, add), size, color });
}

// GET /api/cart
exports.getCart = async (req, res) => sendCart(res, await getOrCreateCart(req.user._id));

// POST /api/cart  { productId, qty, size, color }
exports.addToCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await addLine(cart, req.body);
  await cart.save();
  await sendCart(res, cart, 201);
};

// POST /api/cart/merge  { items: [{ productId, qty, size, color }] }  — merges a guest cart after login
exports.mergeCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 50) : [];
  for (const item of items) await addLine(cart, item, { strict: false });
  await cart.save();
  await sendCart(res, cart);
};

// PUT /api/cart/:itemId  { qty }
exports.updateItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new HttpError(404, 'Item not in cart');
  const product = await Product.findById(item.product).select('stock');
  const qty = parseInt(req.body.qty, 10);
  if (!(qty >= 1)) throw new HttpError(400, 'Quantity must be at least 1');
  const max = Math.min(MAX_QTY, product?.stock ?? 0);
  if (qty > max) throw new HttpError(400, max ? `Only ${max} unit(s) can be ordered` : 'This item is out of stock');
  item.qty = qty;
  await cart.save();
  await sendCart(res, cart);
};

// DELETE /api/cart/:itemId
exports.removeItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  await sendCart(res, cart);
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ items: [] });
};
