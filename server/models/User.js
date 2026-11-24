const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { DISTRICT_TO_PROVINCE } = require('../data/nepal');

const NEPAL_MOBILE = /^9[678]\d{8}$/;

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: [NEPAL_MOBILE, 'Enter a valid 10-digit Nepali mobile number'] },
    province: { type: String, default: '' }, // derived from district
    district: {
      type: String,
      required: true,
      validate: { validator: (v) => Boolean(DISTRICT_TO_PROVINCE[v]), message: 'Please select a valid district' },
    },
    city: { type: String, required: true, trim: true }, // municipality / rural municipality
    ward: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true }, // tole / street / house
    landmark: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '', match: [/^(\d{5})?$/, 'Postal code must be 5 digits'] },
    type: { type: String, enum: ['Home', 'Work'], default: 'Home' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Province is always derived from the district.
addressSchema.pre('validate', function setProvince() {
  if (DISTRICT_TO_PROVINCE[this.district]) this.province = DISTRICT_TO_PROVINCE[this.district];
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, minlength: 6, select: false },
    gender: { type: String, enum: ['', 'Male', 'Female', 'Other'], default: '' },
    isAdmin: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }, // bumped on password change → old tokens die
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [addressSchema],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
  // Invalidate every token issued before a password change (not on first signup).
  if (!this.isNew) this.tokenVersion = (this.tokenVersion || 0) + 1;
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    gender: this.gender,
    isAdmin: this.isAdmin,
    addresses: this.addresses,
    wishlist: this.wishlist,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.NEPAL_MOBILE = NEPAL_MOBILE;
