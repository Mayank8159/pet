const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function toUserResponse(user) {
  return {
    id: String(user._id),
    name: user.name,
    businessName: user.businessName || "",
    email: user.email,
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: "7d" },
  );
}

function readBearerToken(req) {
  const value = req.headers.authorization || "";
  if (!value.startsWith("Bearer ")) {
    return null;
  }
  return value.slice(7).trim();
}

async function requireAuth(req, res, next) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid auth token" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired auth token" });
  }
}

router.post("/signup", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const businessName = String(req.body?.businessName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      businessName,
      username: email,
      email,
      passwordHash,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: toUserResponse(user) });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error?.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `${duplicateField} already registered` });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: toUserResponse(req.user) });
});

module.exports = router;
