const mongoose = require('mongoose');

const ORDER_STATUSES = ['Payment Pending', 'Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_METHODS = ['ESEWA', 'KHALTI', 'CONNECTIPS', 'CARD', 'COD'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    brand: String,
    price: Number,
    mrp: Number,
    qty: Number,
    size: String,
    color: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    shippingAddress: {
      name: String,
      phone: String,
      province: String,
      district: String,
      city: String,
      ward: String,
      address: String,
      landmark: String,
      postalCode: String,
      type: { type: String },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentResult: {
      provider: String, // 'simulated' (Jhola test gateway)
      paymentId: String,
      paidAt: Date,
    },
    itemsMrp: Number,
    itemsPrice: Number,
    discount: Number,
    deliveryCharge: Number,
    totalPrice: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'Placed' },
    statusHistory: [{ status: String, date: { type: Date, default: Date.now }, _id: false }],
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

orderSchema.methods.setStatus = function setStatus(status) {
  this.status = status;
  this.statusHistory.push({ status, date: new Date() });
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
