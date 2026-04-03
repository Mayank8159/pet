const express = require("express");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [menuCount, orders, tables] = await Promise.all([
      MenuItem.countDocuments({ isActive: true }),
      Order.find().lean(),
      Table.find().lean(),
    ]);

    const settledOrders = orders.filter((order) => order.settled);
    const activeOrders = orders.filter((order) => !order.settled);
    
    // Status breakdown for active orders
    const unpaidOrders = activeOrders.filter((order) => order.paymentStatus === "pending");
    const paidOrders = activeOrders.filter((order) => order.paymentStatus === "paid");
    const preparingOrders = activeOrders.filter((order) => order.preparationStatus === "pending");
    const preparedOrders = activeOrders.filter((order) => order.preparationStatus === "prepared");
    
    const revenue = settledOrders.reduce((acc, order) => acc + (order.amount || 0), 0);
    const averageTicket = settledOrders.length > 0 ? Math.round(revenue / settledOrders.length) : 0;
    const occupiedTables = tables.filter((table) => table.status === "Occupied").length;

    res.json({
      backendStatus: "connected",
      orders: {
        active: activeOrders.length,
        settled: settledOrders.length,
        total: orders.length,
        revenue,
        averageTicket,
        unpaid: unpaidOrders.length,
        paid: paidOrders.length,
        preparing: preparingOrders.length,
        prepared: preparedOrders.length,
      },
      tables: {
        total: tables.length,
        occupied: occupiedTables,
        available: tables.length - occupiedTables,
      },
      menu: {
        items: menuCount,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
