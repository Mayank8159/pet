const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { humanElapsed } = require("../utils/time");

const router = express.Router();

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

  return {
    customer: String(payload.customer || payload.customerName || "Guest").trim() || "Guest",
    mobile: String(payload.mobile || payload.phone || "").trim(),
    type: payload.type || payload.orderType || "Dine-In",
    section: payload.section || "AC",
    tableId: payload.tableId || null,
    payment: payload.payment || payload.paymentType || "UPI",
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
    payment: order.payment,
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
    existing.payment = payload.payment;
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

    existing.settled = true;
    if (req.body?.payment) {
      existing.payment = req.body.payment;
    }
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

    existing.paymentStatus = existing.paymentStatus === "paid" ? "pending" : "paid";
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
