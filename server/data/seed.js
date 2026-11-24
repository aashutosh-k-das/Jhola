/* Seeds the database with categories' products, demo users and reviews.
   Usage: npm run seed   (WARNING: wipes products, users, reviews, carts, orders) */
const mongoose = require('mongoose');
const connectDB = require('../../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const products = require('./products');

const REVIEWERS = ['Aarav Shrestha', 'Prakriti Gurung', 'Rohan Karki', 'Anisha Tamang', 'Bikash Thapa', 'Sneha Maharjan', 'Kiran Rai', 'Isha Adhikari', 'Arjun Bhattarai', 'Mira Shakya', 'Rajan Poudel', 'Puja Limbu'];

const REVIEW_TEXT = {
  5: [['Brilliant', 'Absolutely love it. Worth every rupee and delivery was super quick!'], ['Must buy!', 'Exceeded my expectations. Quality is top notch.'], ['Perfect product', 'Exactly as described. Packaging was great too.']],
  4: [['Really nice', 'Very good product for the price. Minor nitpicks but overall happy.'], ['Value for money', 'Good quality and fast delivery. Would recommend.'], ['Pretty good', 'Does the job well. Slightly expensive but fine.']],
  3: [['Decent', 'It is okay. Expected a little better for the price.'], ['Average', 'Not bad, not great. Works as expected.']],
  2: [['Not satisfied', 'Quality could have been better. Packaging was damaged.']],
  1: [['Disappointed', 'Did not meet my expectations at all.']],
};

// Deterministic PRNG so the seed is reproducible.
let s = 42;
const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function ratingsFor(target, n) {
  // Generate n integer ratings whose mean is close to target.
  const out = [];
  for (let i = 0; i < n; i++) {
    const remaining = target * n - out.reduce((a, b) => a + b, 0);
    const ideal = remaining / (n - i);
    let r = rand() < ideal - Math.floor(ideal) ? Math.ceil(ideal) : Math.floor(ideal);
    if (rand() < 0.1) r -= 1 + Math.floor(rand() * 2); // a few critical reviews for realism
    out.push(Math.min(5, Math.max(1, r)));
  }
  return out;
}

(async () => {
  await connectDB();
  await Promise.all([Product.deleteMany(), User.deleteMany(), Review.deleteMany(), Cart.deleteMany(), Order.deleteMany()]);

  const demo = await User.create({ name: 'Demo User', email: 'demo@jhola.com', password: 'demo1234', phone: '9841234567',
    addresses: [{ name: 'Demo User', phone: '9841234567', district: 'Kathmandu', city: 'Kathmandu Metropolitan City', ward: '1', address: 'Durbar Marg, House No. 42', landmark: 'Near Narayanhiti Palace Museum', postalCode: '44600', type: 'Home', isDefault: true }] });
  await User.create({ name: 'Jhola Admin', email: 'admin@jhola.com', password: 'admin1234', isAdmin: true });
  const reviewers = await User.create(REVIEWERS.map((name, i) => ({ name, email: `reviewer${i + 1}@jhola.com`, password: `reviewer${i + 1}pw` })));

  const docs = await Product.create(products.map(({ targetRating, ...p }) => ({
    ...p,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  })));

  const reviews = [];
  const now = Date.now();
  for (const [i, doc] of docs.entries()) {
    // Stagger createdAt so "Newest first" sorting is meaningful.
    await Product.collection.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(now - i * 36e5 * 7) } });
    const n = 4 + Math.floor(rand() * 6);
    const ratings = ratingsFor(products[i].targetRating, n);
    const people = [...reviewers].sort(() => rand() - 0.5).slice(0, n);
    ratings.forEach((rating, j) => {
      const [title, comment] = pick(REVIEW_TEXT[rating]);
      reviews.push({ product: doc._id, user: people[j]._id, name: people[j].name, rating, title, comment,
        verifiedPurchase: rand() > 0.3, createdAt: new Date(now - Math.floor(rand() * 90) * 864e5) });
    });
  }
  await Review.insertMany(reviews, { timestamps: false });
  await Promise.all(docs.map((d) => Review.syncProductRating(d._id)));

  console.log(`Seeded ${docs.length} products, ${reviews.length} reviews, ${reviewers.length + 2} users.`);
  console.log('Demo login:  demo@jhola.com / demo1234');
  console.log('Admin login: admin@jhola.com / admin1234');
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
