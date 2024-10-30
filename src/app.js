// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// Import routes from auth.js and cards.js
const authRoutes = require("./api/auth");
const cardRoutes = require("./api/cards");

// Initialize the app
const app = express();
const PORT = 33915; // Use environment variable or default to 3000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Collectible Card Logger API!");
});

// Use the routes
app.use("/api/auth", authRoutes); // All auth-related endpoints will be prefixed with /api/auth
app.use("/api/cards", cardRoutes); // All card-related endpoints will be prefixed with /api/cards

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
