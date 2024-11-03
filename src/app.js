require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const authRoutes = require("./api/auth");
const cardRoutes = require("./api/cards");
const database = require("./db/setupDatabase");
const path = require("path");
const { requireAuth, restrictAuth } = require("./api/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser

app.use(express.static(path.join(__dirname, "../public")));

// Routes
// app.get("/", restrictAuth, (req, res) => {
//   // res.sendFile(path.join(__dirname, "../public/index.html"));
//   res.send("/log-in");
// });

app.get("/log-in", restrictAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/sign-up", restrictAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/signup.html"));
});

app.get("/homepage", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/home.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});