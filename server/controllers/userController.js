const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { NEPAL_MOBILE } = User;
const Product = require('../models/Product');
const HttpError = require('../utils/HttpError');
const { signToken } = require('../utils/token');
const env = require('../../config/env');

const MAX_PASSWORD = 128;

const authResponse = (user) => ({ token: signToken(user), user: user.toPublicJSON() });
const normEmail = (e) => String(e || '').trim().toLowerCase();

// POST /api/users/register
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (String(password).length > MAX_PASSWORD) throw new HttpError(400, 'Password must be at most 128 characters');
  if (await User.exists({ email: normEmail(email) })) throw new HttpError(409, 'An account with this email already exists');
  const user = await User.create({ name: String(name).slice(0, 60), email: String(email), password: String(password), phone: typeof phone === 'string' ? phone : '' });
  res.status(201).json(authResponse(user));
};

// POST /api/users/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  if (String(password).length > MAX_PASSWORD) throw new HttpError(401, 'Invalid email or password');
  const user = await User.findOne({ email: normEmail(email) }).select('+password');
  if (!user || !(await user.matchPassword(String(password)))) throw new HttpError(401, 'Invalid email or password');
  res.json(authResponse(user));
};

// --- OTP login (simulated: the OTP is returned in the response instead of being emailed/SMSed) ---
const otpStore = new Map(); // email -> { hash, expires, attempts }
const OTP_TTL_MS = 5 * 60 * 1000;
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// POST /api/users/otp/send
exports.sendOtp = async (req, res) => {
  const email = normEmail(req.body.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Enter a valid email address');
  const existing = otpStore.get(email);
  if (existing && existing.expires - OTP_TTL_MS + 30_000 > Date.now()) {
    throw new HttpError(429, 'Please wait 30 seconds before requesting another OTP');
  }
  if (!env.otpDemo) {
    // A real SMS / email provider must be connected before OTP login can be offered.
    throw new HttpError(503, 'OTP login is not available yet. Please log in with your password.');
  }
  // Demo mode shows the code on screen, so it may ONLY create new accounts —
  // otherwise anyone could log in as an existing user (including admins).
  if (await User.exists({ email })) {
    throw new HttpError(400, 'This email already has an account. Please log in with your password.');
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  otpStore.set(email, { hash: hashOtp(otp), expires: Date.now() + OTP_TTL_MS, attempts: 0 });
  res.json({ message: `OTP sent to ${email}`, demoOtp: otp, isNewUser: true });
};

// POST /api/users/otp/verify
exports.verifyOtp = async (req, res) => {
  const email = normEmail(req.body.email);
  const entry = otpStore.get(email);
  if (!entry || entry.expires < Date.now()) throw new HttpError(400, 'OTP expired. Please request a new one');
  if (entry.attempts >= 5) {
    otpStore.delete(email);
    throw new HttpError(429, 'Too many attempts. Please request a new OTP');
  }
  if (hashOtp(String(req.body.otp || '')) !== entry.hash) {
    entry.attempts += 1;
    throw new HttpError(400, 'Incorrect OTP');
  }
  otpStore.delete(email);

  if (await User.exists({ email })) throw new HttpError(400, 'This email already has an account. Please log in with your password.');
  const name = String(req.body.name || '').trim().slice(0, 60) || email.split('@')[0];
  const user = await User.create({ name, email, password: crypto.randomBytes(24).toString('hex') });
  res.json(authResponse(user));
};

// GET /api/users/me
exports.getMe = (req, res) => res.json(req.user.toPublicJSON());

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  const { name, phone, gender, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (name !== undefined) user.name = String(name).slice(0, 60);
  if (phone !== undefined) {
    if (phone && !NEPAL_MOBILE.test(phone)) throw new HttpError(400, 'Enter a valid 10-digit Nepali mobile number');
    user.phone = phone;
  }
  if (gender !== undefined) user.gender = gender;
  if (newPassword) {
    if (!(await user.matchPassword(String(currentPassword || '')))) throw new HttpError(400, 'Current password is incorrect');
    if (String(newPassword).length < 6) throw new HttpError(400, 'New password must be at least 6 characters');
    if (String(newPassword).length > MAX_PASSWORD) throw new HttpError(400, 'Password must be at most 128 characters');
    user.password = String(newPassword);
  }
  await user.save();
  // A password change signs out every other device; give this one a fresh token.
  res.json(newPassword ? { ...user.toPublicJSON(), token: signToken(user) } : user.toPublicJSON());
};

// --- Wishlist ---
const WISHLIST_FIELDS = 'name slug images price mrp discount rating numReviews brand stock';

// GET /api/users/wishlist
exports.getWishlist = async (req, res) => {
  await req.user.populate({ path: 'wishlist', select: WISHLIST_FIELDS });
  res.json(req.user.wishlist.filter(Boolean));
};

// POST /api/users/wishlist/:productId  (toggle)
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
    throw new HttpError(404, 'Product not found');
  }
  const has = req.user.wishlist.some((id) => id.equals(productId));
  const update = has ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } };
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
    .populate({ path: 'wishlist', select: WISHLIST_FIELDS });
  res.json({ added: !has, wishlist: user.wishlist.filter(Boolean) });
};

// --- Addresses ---
const ADDRESS_FIELDS = ['name', 'phone', 'district', 'city', 'ward', 'address', 'landmark', 'postalCode', 'type', 'isDefault'];
const pickAddress = (body) => Object.fromEntries(ADDRESS_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

function applyDefault(user, address) {
  if (address.isDefault || user.addresses.length === 1) {
    user.addresses.forEach((a) => { a.isDefault = a._id.equals(address._id); });
  }
}

exports.getAddresses = (req, res) => res.json(req.user.addresses);

exports.addAddress = async (req, res) => {
  const user = req.user;
  if (user.addresses.length >= 10) throw new HttpError(400, 'You can save up to 10 addresses');
  user.addresses.push(pickAddress(req.body));
  const address = user.addresses[user.addresses.length - 1];
  applyDefault(user, address);
  await user.save();
  res.status(201).json({ address, addresses: user.addresses });
};

exports.updateAddress = async (req, res) => {
  const user = req.user;
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');
  address.set(pickAddress(req.body));
  applyDefault(user, address);
  await user.save();
  res.json({ address, addresses: user.addresses });
};

exports.deleteAddress = async (req, res) => {
  const user = req.user;
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  res.json({ addresses: user.addresses });
};
