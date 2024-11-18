require("dotenv").config();
const express = require("express");
const pug = require("pug");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./api/auth");
const db = require("./db/database");
const path = require("path");
const { restrictAuth, requireAuth } = require("./api/authMiddleware");
const cardsRoutes = require("./api/cards");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins during local development (adjust as needed for production)
app.use(cors({
  origin: "http://localhost:3000", // Replace with your front-end origin
  credentials: true, // Allow cookies or authentication headers
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Precompile frequently used Pug templates
const compiledCollections = pug.compileFile(path.join(__dirname, "../public/collections.pug"));

// Middleware for serving static pages
const staticPage = (filePath) => (req, res) => res.sendFile(path.join(__dirname, filePath));

// Routes
// Homepage - requires login
app.get("/", requireAuth, staticPage("../public/index.html"));

// Auth-related pages - restricted for logged-in users only
app.get("/sign-up", restrictAuth, staticPage("../public/signup.html"));
app.get("/log-in", restrictAuth, staticPage("../public/login.html"));

// Protected pages - require login
app.get("/collections", requireAuth, async (req, res, next) => {
  try {
    // Fetch card types directly from the card_types table
    const [rows] = await db.query("SELECT type FROM card_types");

    // Map the rows to a list of types and add "All Cards" at the beginning
    const collections = ["all", ...rows.map(row => row.type.toLowerCase())];

    // Render the collections using the precompiled Pug template
    res.send(compiledCollections({ collections }));
  } catch (err) {
    console.error("Error fetching collections:", err);
    next(err); // Forward error to the general error handler
  }
});

app.get("/settings", requireAuth, staticPage("../public/settings.html"));
app.get("/my-profile", requireAuth, staticPage("../public/myProfile.html"));
app.get("/my-cards", requireAuth, staticPage("../public/myCards.html"));
app.get("/collections/cards", requireAuth, staticPage("../public/addCard.html"));
app.get("/my-cards/remove", requireAuth, staticPage("../public/removeCard.html"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
