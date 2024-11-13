require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./api/auth");
const db = require("./db/database");
const path = require("path");
const { restrictAuth, requireAuth } = require("./api/authMiddleware");
const cardsRoutes = require("./api/cards");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
// Homepage - requires login
app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Auth-related pages - restricted for logged-in users only
app.get("/sign-up", restrictAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/signup.html"));
});

app.get("/log-in", restrictAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Protected pages - require login
app.get("/collections", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/collections.html"));
});

app.get("/settings", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/settings.html"));
});

app.get("/my-profile", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/myProfile.html"));
});

app.get("/my-cards", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/myCards.html"));
});

app.get("/my-cards/add-card", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/addCard.html"))
})

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
