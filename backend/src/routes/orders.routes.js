const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { humanElapsed } = require("../utils/time");

const router = express.Router();
const VALID_PAYMENTS = new Set(["Cash", "UPI", "Split"]);

function normalizePayment(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return VALID_PAYMENTS.has(normalized) ? normalized : undefined;
}

function normalizeSplitPayment(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const cash = Number(raw.cash ?? 0);
  const upi = Number(raw.upi ?? 0);
  const safeCash = Number.isFinite(cash) && cash >= 0 ? Number(cash.toFixed(2)) : 0;
  const safeUpi = Number.isFinite(upi) && upi >= 0 ? Number(upi.toFixed(2)) : 0;

  return {
    cash: safeCash,
    upi: safeUpi,
  };
}

function validatePaymentForCollection(order) {
  const payment = normalizePayment(order.payment);
  if (!payment) {
    return { valid: false, message: "Select payment mode in bill section." };
  }

  if (payment !== "Split") {
    return { valid: true };
  }

  const split = normalizeSplitPayment(order.splitPayment);
  const cash = split?.cash ?? 0;
  const upi = split?.upi ?? 0;

  if (cash <= 0 || upi <= 0) {
    return { valid: false, message: "For split payment, both cash and UPI amounts are required." };
  }

  const total = Number(order.amount ?? 0);
  if (Math.abs(cash + upi - total) > 0.01) {
    return { valid: false, message: "Split payment must match the total bill amount." };
  }

  return { valid: true };
}

function normalizeOrderPayload(payload) {
  const items = Array.isArray(payload.items)
    ? payload.items
        .map((item) => ({
          menuItemId: item.id ? String(item.id) : undefined,
          name: String(item.name || "").trim(),
          qty: Number(item.qty ?? item.quantity ?? 1),
          price: Number(item.price ?? 0),
        }))
        .filter((item) => item.name && Number.isFinite(item.qty) && item.qty > 0 && Number.isFinite(item.price))
    : [];

  const type = payload.type || payload.orderType || "Dine-In";
  const rawDeliveryAddress = payload.deliveryAddress && typeof payload.deliveryAddress === "object"
    ? payload.deliveryAddress
    : {};
  const deliveryAddress = type === "Delivery"
    ? {
        flatNo: String(rawDeliveryAddress.flatNo || "").trim(),
        roomNo: String(rawDeliveryAddress.roomNo || "").trim(),
        landmark: String(rawDeliveryAddress.landmark || "").trim(),
        autoLocation: String(rawDeliveryAddress.autoLocation || "").trim(),
      }
    : null;

  const payment = normalizePayment(payload.payment || payload.paymentType) || undefined;
  const splitPayment = normalizeSplitPayment(payload.splitPayment);

  return {
    customer: String(payload.customer || payload.customerName || "Guest").trim() || "Guest",
    mobile: String(payload.mobile || payload.phone || "").trim(),
    type,
    section: payload.section || "AC",
    tableId: payload.tableId || null,
    deliveryAddress,
    payment,
    splitPayment: payment === "Split" ? splitPayment : null,
    paymentStatus: payload.paymentStatus || "pending",
    preparationStatus: payload.preparationStatus || "pending",
    unpaidAmountCleared: Boolean(payload.unpaidAmountCleared),
    settled: Boolean(payload.settled),
    items,
  };
}

function toResponse(order) {
  return {
    id: order.orderCode,
    customer: order.customer,
    type: order.type,
    amount: order.amount,
    itemCount: order.itemCount,
    elapsed: humanElapsed(order.createdAt, order.settled),
    mobile: order.mobile,
    section: order.section,
    tableId: order.tableId,
    deliveryAddress: order.deliveryAddress || null,
    payment: order.payment || null,
    splitPayment: order.payment === "Split" && order.splitPayment
      ? {
          cash: Number(order.splitPayment.cash ?? 0),
          upi: Number(order.splitPayment.upi ?? 0),
        }
      : null,
    paymentStatus: order.paymentStatus,
    preparationStatus: order.preparationStatus,
    unpaidAmountCleared: order.unpaidAmountCleared,
    items: order.items.map((item) => ({
      id: item.menuItemId || `${order.orderCode}-${item.name}`,
      name: item.name,
      qty: item.qty,
      price: item.price,
    })),
    settled: order.settled,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

async function buildOrderCode() {
  const value = await mongoose.connection.db.collection("counters").findOneAndUpdate(
    { _id: "order_code" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  const seq = value?.seq || value?.value?.seq || 1;
  return `#${20000 + seq}`;
}

router.get("/", async (_req, res, next) => {
  try {
    const rows = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(rows.map(toResponse));
  } catch (error) {
    next(error);
  }
});

router.get("/active", async (_req, res, next) => {
  try {
    const rows = await Order.find({ settled: false }).sort({ createdAt: -1 }).limit(100).lean();
    res.json(rows.map(toResponse));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = normalizeOrderPayload(req.body || {});
    const orderCode = await buildOrderCode();

    const created = await Order.create({
      ...payload,
      orderCode,
    });

    res.status(201).json({
      order: toResponse(created.toObject()),
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ orderCode: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payload = normalizeOrderPayload({
      ...existing.toObject(),
      ...req.body,
    });

    existing.customer = payload.customer;
    existing.mobile = payload.mobile;
    existing.type = payload.type;
    existing.section = payload.section;
    existing.tableId = payload.tableId;
    existing.deliveryAddress = payload.deliveryAddress;
    existing.payment = payload.payment;
    existing.splitPayment = payload.splitPayment;
    existing.paymentStatus = payload.paymentStatus;
    existing.preparationStatus = payload.preparationStatus;
    existing.unpaidAmountCleared = payload.unpaidAmountCleared;
    existing.items = payload.items;
    existing.settled = payload.settled;

    await existing.save();

    res.json(toResponse(existing.toObject()));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/settle", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ orderCode: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.body?.payment || req.body?.paymentType) {
      const nextPayment = normalizePayment(req.body.payment || req.body.paymentType);
      existing.payment = nextPayment;
      existing.splitPayment = nextPayment === "Split" ? normalizeSplitPayment(req.body.splitPayment) : null;
    }

    const validation = validatePaymentForCollection(existing.toObject());
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    existing.settled = true;
    await existing.save();

    res.json(toResponse(existing.toObject()));
  } catch (error) {
    next(error);
  }
});

// Get orders for live view (orders currently being prepared - not yet completed)
router.get("/live", async (_req, res, next) => {
  try {
    const rows = await Order.find({
      settled: false,
      items: { $ne: [] },
      preparationStatus: "pending"  // Still in preparation stage
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(rows.map(toResponse));
  } catch (error) {
    next(error);
  }
});

// Get orders for history (orders that have been completed/prepared)
router.get("/history", async (_req, res, next) => {
  try {
    const rows = await Order.find({
      $or: [
        { preparationStatus: "prepared" },  // Completed by kitchen staff
        { settled: true },  // Fully settled
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(rows.map(toResponse));
  } catch (error) {
    next(error);
  }
});

// Toggle preparation status
router.patch("/:id/prepared", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ orderCode: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    existing.preparationStatus = existing.preparationStatus === "prepared" ? "pending" : "prepared";
    await existing.save();

    res.json(toResponse(existing.toObject()));
  } catch (error) {
    next(error);
  }
});

// Toggle payment status
router.patch("/:id/paid", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ orderCode: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    const markAsPaid = existing.paymentStatus !== "paid";
    if (markAsPaid) {
      const validation = validatePaymentForCollection(existing.toObject());
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      existing.paymentStatus = "paid";
    } else {
      existing.paymentStatus = "pending";
    }
    await existing.save();

    res.json(toResponse(existing.toObject()));
  } catch (error) {
    next(error);
  }
});

// Mark unpaid amount as cleared (checkbox in history)
router.patch("/:id/clear-unpaid", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ orderCode: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    existing.unpaidAmountCleared = !existing.unpaidAmountCleared;
    await existing.save();

    res.json(toResponse(existing.toObject()));
  } catch (error) {
    next(error);
  }
});

// Clear all orders (development utility)
router.delete("/", async (req, res, next) => {
  try {
    const result = await Order.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} orders`, deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
