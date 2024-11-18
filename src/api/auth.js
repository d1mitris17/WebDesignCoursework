const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/database"); // Import the database connection
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to find the user by username
    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await db.query("INSERT INTO card_types (type) SELECT DISTINCT card_type FROM cards ON DUPLICATE KEY UPDATE type = VALUES(type)");

    // Generate JWT with user ID in the payload
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    // Set the JWT as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000 // 1 hour
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Database or password comparison error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  // Clear the JWT cookie
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// Middleware to verify JWT token and set req.user
function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Get the token from the cookies
  if (!token) return res.sendStatus(401); // Unauthorized if token is missing

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if token is invalid
    req.user = user; // Set user information in req for future routes
    next();
  });
}

// Endpoint to get logged-in user information
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // Here, req.user contains the user info decoded from the JWT
    const [results] = await db.query("SELECT id, username FROM users WHERE id = ?", [req.user.id]);
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(results[0]); // Return user info
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
