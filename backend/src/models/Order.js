const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    _id: false,
  },
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    flatNo: { type: String, default: "", trim: true },
    roomNo: { type: String, default: "", trim: true },
    landmark: { type: String, default: "", trim: true },
    autoLocation: { type: String, default: "", trim: true },
  },
  {
    _id: false,
  },
);

const splitPaymentSchema = new mongoose.Schema(
  {
    cash: { type: Number, min: 0, default: 0 },
    upi: { type: Number, min: 0, default: 0 },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, index: true },
    customer: { type: String, default: "Guest", trim: true },
    mobile: { type: String, default: "", trim: true },
    type: { type: String, enum: ["Delivery", "Takeaway", "Dine-In"], default: "Dine-In" },
    section: { type: String, enum: ["AC", "Non-AC", "Rooftop"], default: "AC" },
    tableId: { type: String, default: null },
    deliveryAddress: { type: deliveryAddressSchema, default: null },
    payment: { type: String, enum: ["Cash", "UPI", "Split"], default: undefined },
    splitPayment: { type: splitPaymentSchema, default: null },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    preparationStatus: { type: String, enum: ["pending", "prepared"], default: "pending" },
    unpaidAmountCleared: { type: Boolean, default: false },
    items: { type: [orderItemSchema], default: [] },
    itemCount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    settled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

orderSchema.pre("save", function recomputeTotals(next) {
  const subtotal = this.items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = Math.round(subtotal * 0.05);
  this.itemCount = this.items.reduce((acc, item) => acc + item.qty, 0);
  this.subtotal = subtotal;
  this.tax = tax;
  this.amount = subtotal + tax;

  if (this.payment !== "Split") {
    this.splitPayment = null;
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
