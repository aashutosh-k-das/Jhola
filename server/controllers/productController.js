const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const HttpError = require('../utils/HttpError');
const { CATEGORIES } = require('../data/categories');
const { estimateDelivery } = require('../utils/delivery');

const LIST_FIELDS = '-description -specifications -highlights -tags';

const SORTS = {
  relevance: { isFeatured: -1, rating: -1, numReviews: -1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  rating: { rating: -1, numReviews: -1, _id: 1 },
  discount: { discount: -1, _id: 1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toList = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((s) => s.trim()).filter(Boolean);
const num = (v) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

function buildFilter(query, { skip = [] } = {}) {
  const filter = {};
  const and = [];

  const q = String(query.q || '').trim();
  if (q) {
    for (const word of q.split(/\s+/).slice(0, 6)) {
      const re = new RegExp(escapeRegex(word), 'i');
      and.push({ $or: [{ name: re }, { brand: re }, { category: re }, { subCategory: re }, { tags: re }] });
    }
  }

  const categories = toList(query.category);
  if (categories.length) filter.category = { $in: categories };

  const brands = toList(query.brand);
  if (brands.length && !skip.includes('brand')) {
    filter.brand = { $in: brands.map((b) => new RegExp(`^${escapeRegex(b)}$`, 'i')) };
  }

  if (!skip.includes('price')) {
    const min = num(query.minPrice);
    const max = num(query.maxPrice);
    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined) filter.price.$gte = min;
      if (max !== undefined) filter.price.$lte = max;
    }
  }

  const rating = num(query.rating);
  if (rating) filter.rating = { $gte: rating };
  const discount = num(query.discount);
  if (discount) filter.discount = { $gte: discount };
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.deal === 'true') filter.isDeal = true;
  if (query.inStock === 'true') filter.stock = { $gt: 0 };
  if (query.exclude && mongoose.isValidObjectId(query.exclude)) filter._id = { $ne: query.exclude };

  if (and.length) filter.$and = and;
  return filter;
}

// GET /api/products
exports.getProducts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const sort = SORTS[req.query.sort] || SORTS.relevance;
  const filter = buildFilter(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter).select(LIST_FIELDS).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  let facets;
  if (req.query.facets !== 'false') {
    const [brands, [priceRange]] = await Promise.all([
      Product.aggregate([
        { $match: buildFilter(req.query, { skip: ['brand'] }) },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Product.aggregate([
        { $match: buildFilter(req.query, { skip: ['price', 'brand'] }) },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);
    facets = {
      brands: brands.map((b) => ({ name: b._id, count: b.count })),
      priceRange: priceRange ? { min: priceRange.min, max: priceRange.max } : { min: 0, max: 0 },
    };
  }

  res.json({ products, page, pages: Math.max(1, Math.ceil(total / limit)), total, facets });
};

// GET /api/products/brands
exports.getBrands = async (req, res) => {
  const brands = await Product.aggregate([
    { $sort: { rating: -1 } },
    { $group: { _id: '$brand', count: { $sum: 1 }, image: { $first: { $first: '$images' } }, maxDiscount: { $max: '$discount' } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 16 },
  ]);
  res.json(brands.map((b) => ({ name: b._id, count: b.count, image: b.image, maxDiscount: b.maxDiscount })));
};

async function findProduct(idOrSlug) {
  const product = mongoose.isValidObjectId(idOrSlug)
    ? await Product.findById(idOrSlug).lean()
    : await Product.findOne({ slug: idOrSlug }).lean();
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await findProduct(req.params.id);

  const [similar, boughtTogether, ratingBreakdown] = await Promise.all([
    Product.find({ category: product.category, _id: { $ne: product._id } })
      .select(LIST_FIELDS).sort({ rating: -1 }).limit(10).lean(),
    // Cheaper complementary items from the same category, different sub-category.
    Product.find({
      category: product.category,
      _id: { $ne: product._id },
      subCategory: { $ne: product.subCategory },
      price: { $lte: Math.max(product.price, 500) },
      stock: { $gt: 0 },
    }).select(LIST_FIELDS).sort({ rating: -1 }).limit(2).lean(),
    Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingBreakdown.forEach((r) => { breakdown[r._id] = r.count; });

  res.json({ product, similar, boughtTogether, ratingBreakdown: breakdown });
};

// GET /api/products/:id/reviews
exports.getReviews = async (req, res) => {
  const product = await findProduct(req.params.id);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 5;
  const sort = req.query.sort === 'negative' ? { rating: 1, createdAt: -1 }
    : req.query.sort === 'positive' ? { rating: -1, createdAt: -1 }
    : { createdAt: -1 };
  const [reviews, total] = await Promise.all([
    Review.find({ product: product._id }).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments({ product: product._id }),
  ]);
  res.json({ reviews, page, pages: Math.max(1, Math.ceil(total / limit)), total });
};

// POST /api/products/:id/reviews  (auth)
exports.addReview = async (req, res) => {
  const product = await findProduct(req.params.id);
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, 'Rating must be between 1 and 5');

  const Order = require('../models/Order');
  const purchased = await Order.exists({
    user: req.user._id,
    'items.product': product._id,
    status: { $in: ['Placed', 'Shipped', 'Out for Delivery', 'Delivered'] },
  });

  const review = await Review.findOneAndUpdate(
    { product: product._id, user: req.user._id },
    {
      name: req.user.name,
      rating,
      title: String(req.body.title || '').slice(0, 100),
      comment: String(req.body.comment || '').slice(0, 2000),
      verifiedPurchase: Boolean(purchased),
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  await Review.syncProductRating(product._id);
  res.status(201).json(review);
};

// POST /api/products (admin)
exports.createProduct = async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug || String(body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  delete body.rating;
  delete body.numReviews;
  const product = await Product.create(body);
  res.status(201).json(product);
};

// GET /api/categories
exports.getCategories = async (req, res) => {
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json(CATEGORIES.map((c) => ({ ...c, count: map[c.slug] || 0 })));
};

// GET /api/delivery/:district
exports.checkDelivery = (req, res) => {
  const estimate = estimateDelivery(req.params.district);
  if (!estimate) throw new HttpError(400, 'Please select a valid district');
  res.json(estimate);
};

// GET /api/locations — Nepal provinces & districts
exports.getLocations = (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400');
  res.json(require('../data/nepal').PROVINCES);
};
