const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/database"); // Import the database connection
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    
    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into database
      db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
        [username, email, hashedPassword], 
        (err) => {
          if (err) return res.status(500).json({ message: "Error creating user", error: err });
          res.status(201).json({ message: "User created successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Error hashing password", error });
    }
  });
});

// Login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Query the database to find the user by username
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    try {
      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

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
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
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
router.get("/me", authenticateToken, (req, res) => {
  // Here, req.user contains the user info decoded from the JWT
  db.query("SELECT id, username FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]); // Return user info
  });
});

module.exports = router;
