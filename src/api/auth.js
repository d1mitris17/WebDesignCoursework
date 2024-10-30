const express = require("express");
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const router = express.Router();

// Sample in-memory user storage (replace with database logic in production)
let users = [];

// Signup route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword }); // Save user
  res.status(201).json({ message: "User created successfully" });
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  // Check if user exists and password matches
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign({ username: user.username }, "your_secret_key", {
    expiresIn: "1h",
  });
  res.json({ token });
});

module.exports = router;
