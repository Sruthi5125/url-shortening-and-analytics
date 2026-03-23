// src/app.js
// Creates and configures the Express app.
// Does NOT start the server — that's server.js's job.

const express = require("express");
const cors = require("cors");

const { FRONTEND_URL } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectRoutes");
const publicRoutes = require("./routes/publicRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ------------------------------------------------------------------
// Global Middleware
// ------------------------------------------------------------------

// CORS: only allow requests from the React frontend
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5000"],
    credentials: true,
  })
);

// Parse incoming JSON bodies (req.body)
app.use(express.json());

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Auth: signup / login / me
app.use("/api/auth", authRoutes);

// URL management: create / list / delete / analytics (all protected)
app.use("/api/urls", urlRoutes);

// Public API endpoints (stats sharing)
app.use("/api/public", publicRoutes);

// Redirect: public-facing short link resolution
// Kept separate because it's NOT part of the dashboard API
app.use("/r", redirectRoutes);

// ------------------------------------------------------------------
// Health check — useful during development and deployment
// ------------------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ------------------------------------------------------------------
// Global error handler (must be last)
// ------------------------------------------------------------------
app.use(errorMiddleware);

module.exports = app;
