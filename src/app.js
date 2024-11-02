require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const authRoutes = require("./api/auth");
const cardRoutes = require("./api/cards");
const database = require("./db/setupDatabase");
const path = require("path");

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the public directory

// Routes
// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


// // Use the routes
app.use("/api/auth", authRoutes); // All auth-related endpoints will be prefixed with /api/auth
app.use("/api/cards", cardRoutes); // All card-related endpoints will be prefixed with /api/cards

// 404 Error for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message : "Route not found" });
});

// General Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
