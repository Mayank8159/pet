const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const menuRoutes = require("./routes/menu.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const orderRoutes = require("./routes/orders.routes");
const tableRoutes = require("./routes/tables.routes");

const app = express();

const corsOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/pos/menu", menuRoutes);
app.use("/api/menu", menuRoutes);
app.use("/menu", menuRoutes);

app.use("/api/pos/dashboard", dashboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/api/pos/orders", orderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/orders", orderRoutes);

app.use("/api/pos/tables", tableRoutes);
app.use("/api/tables", tableRoutes);
app.use("/tables", tableRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Internal server error",
  });
});

module.exports = app;
