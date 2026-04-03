const express = require("express");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

const router = express.Router();

router.get("/popular", async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), 20)
      : 6;

    const [menuRowsRaw, frequencies] = await Promise.all([
      MenuItem.find({ isActive: true }).lean(),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalQty: { $sum: "$items.qty" },
            menuItemId: { $first: "$items.menuItemId" },
            lastPrice: { $max: "$items.price" },
          },
        },
        { $sort: { totalQty: -1, _id: 1 } },
        { $limit: limit },
      ]),
    ]);

    const uniqueByName = new Map();
    menuRowsRaw.forEach((row) => {
      const key = String(row.name || "").trim().toLowerCase();
      if (!key || uniqueByName.has(key)) {
        return;
      }
      uniqueByName.set(key, row);
    });

    const menuRows = Array.from(uniqueByName.values());
    const menuById = new Map(menuRows.map((row) => [String(row._id), row]));
    const menuByName = new Map(menuRows.map((row) => [row.name.toLowerCase(), row]));

    const ranked = frequencies
      .map((entry) => {
        const byId = entry.menuItemId ? menuById.get(String(entry.menuItemId)) : null;
        const byName = menuByName.get(String(entry._id || "").toLowerCase());
        const menu = byId || byName;

        if (!menu) {
          return null;
        }

        return {
          id: String(menu._id),
          name: menu.name,
          price: menu.price ?? entry.lastPrice ?? 0,
          tag: menu.tag || "Food",
          category: menu.category || "General",
          frequency: entry.totalQty ?? 0,
        };
      })
      .filter(Boolean);

    if (ranked.length >= limit) {
      return res.json(ranked.slice(0, limit));
    }

    const rankedIds = new Set(ranked.map((item) => item.id));
    const filler = menuRows
      .filter((row) => !rankedIds.has(String(row._id)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit - ranked.length)
      .map((row) => ({
        id: String(row._id),
        name: row.name,
        price: row.price,
        tag: row.tag,
        category: row.category,
        frequency: 0,
      }));

    return res.json([...ranked, ...filler]);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const rows = await MenuItem.find({ isActive: true }).sort({ name: 1 }).lean();
    const data = rows.map((item) => ({
      id: String(item._id),
      name: item.name,
      price: item.price,
      tag: item.tag,
      category: item.category,
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, price, tag, category } = req.body;

    if (!name || typeof price !== "number") {
      return res.status(400).json({ message: "name and numeric price are required" });
    }

    const created = await MenuItem.create({ name, price, tag, category });

    res.status(201).json({
      id: String(created._id),
      name: created.name,
      price: created.price,
      tag: created.tag,
      category: created.category,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
