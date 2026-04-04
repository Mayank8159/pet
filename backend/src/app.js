const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const menuRoutes = require("./routes/menu.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const orderRoutes = require("./routes/orders.routes");
const tableRoutes = require("./routes/tables.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

const corsOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:3000", "http://localhost:3001", "https://pet-mu-eight.vercel.app"];

function isLocalDevOrigin(origin) {
  if (!origin) {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    const isHttp = protocol === "http:" || protocol === "https:";
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    return isHttp && isLocalHost;
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    // Requests from non-browser clients may have no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (corsOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
}));
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

app.use("/api/pos/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

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
