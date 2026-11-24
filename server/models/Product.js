const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    highlights: [String],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], validate: (v) => v.length > 0 },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, default: '' },
    brand: { type: String, required: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    variants: {
      colors: [{ name: String, hex: String, _id: false }],
      sizes: [String],
    },
    specifications: [{ key: String, value: String, _id: false }],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isDeal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre('validate', function computeDiscount() {
  if (this.mrp > 0 && this.price <= this.mrp) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discount = 0;
  }
});

productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
