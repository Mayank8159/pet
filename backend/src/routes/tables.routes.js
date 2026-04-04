const express = require("express");
const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();
const VALID_TABLE_STATUSES = new Set(["Available", "Occupied", "Cleaning", "Reserved"]);

function normalizeTableLabel(rawValue) {
  const value = String(rawValue || "").trim().toUpperCase();
  if (!value) {
    return "";
  }

  return value.startsWith("T") ? value : `T${value}`;
}

function toResponse(table) {
  return {
    id: table.tableId,
    label: table.label,
    status: table.status,
    assignedOrderId: table.assignedOrderCode,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableId: 1 }).lean();
    res.json(tables.map(toResponse));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const normalizedLabel = normalizeTableLabel(req.body?.label || req.body?.tableId);
    if (!normalizedLabel) {
      return res.status(400).json({ message: "Table label is required" });
    }

    const existing = await Table.findOne({ tableId: normalizedLabel }).lean();
    if (existing) {
      return res.status(409).json({ message: `${normalizedLabel} already exists` });
    }

    const requestedStatus = String(req.body?.status || "").trim();
    const status = VALID_TABLE_STATUSES.has(requestedStatus) ? requestedStatus : "Available";
    const created = await Table.create({
      tableId: normalizedLabel,
      label: normalizedLabel,
      status,
      assignedOrderCode: null,
    });

    res.status(201).json({ table: toResponse(created.toObject()) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const tableId = normalizeTableLabel(req.params.id);
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const requestedStatus = String(req.body?.status || "").trim();
    const nextStatus = VALID_TABLE_STATUSES.has(requestedStatus)
      ? requestedStatus
      : table.status === "Available"
        ? "Occupied"
        : table.status === "Occupied"
          ? "Cleaning"
          : table.status === "Cleaning"
            ? "Reserved"
            : "Available";

    table.status = nextStatus;
    if (nextStatus !== "Occupied") {
      if (table.assignedOrderCode) {
        await Order.updateMany(
          { orderCode: table.assignedOrderCode, settled: false },
          { $set: { tableId: null } },
        );
      }
      table.assignedOrderCode = null;
    }

    await table.save();

    res.json({ table: toResponse(table.toObject()) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/assign", async (req, res, next) => {
  try {
    const tableId = normalizeTableLabel(req.params.id);
    const orderId = String(req.body?.orderId || "").trim();

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const [table, order] = await Promise.all([
      Table.findOne({ tableId }),
      Order.findOne({ orderCode: orderId, settled: false }),
    ]);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (!order) {
      return res.status(404).json({ message: "Active order not found" });
    }

    if (table.status === "Occupied" && table.assignedOrderCode && table.assignedOrderCode !== orderId) {
      return res.status(409).json({ message: `Table ${table.tableId} is already occupied` });
    }

    if (order.tableId && order.tableId !== table.tableId) {
      const previousTable = await Table.findOne({ tableId: order.tableId });
      if (previousTable && previousTable.assignedOrderCode === order.orderCode) {
        previousTable.status = "Available";
        previousTable.assignedOrderCode = null;
        await previousTable.save();
      }
    }

    table.status = "Occupied";
    table.assignedOrderCode = order.orderCode;
    order.tableId = table.tableId;

    await Promise.all([table.save(), order.save()]);

    res.json({
      table: toResponse(table.toObject()),
      order: {
        id: order.orderCode,
        tableId: order.tableId,
        settled: order.settled,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/release", async (req, res, next) => {
  try {
    const tableId = normalizeTableLabel(req.params.id);
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const releaseOrderId = String(req.body?.orderId || table.assignedOrderCode || "").trim();

    table.status = "Available";
    table.assignedOrderCode = null;
    await table.save();

    if (releaseOrderId) {
      await Order.updateMany(
        { orderCode: releaseOrderId, settled: false, tableId },
        { $set: { tableId: null } },
      );
    }

    res.json({ table: toResponse(table.toObject()) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const tableId = normalizeTableLabel(req.params.id);
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await Order.updateMany(
      { tableId, settled: false },
      { $set: { tableId: null } },
    );

    await Table.deleteOne({ tableId });

    res.json({
      message: `Deleted ${tableId}`,
      tableId,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
