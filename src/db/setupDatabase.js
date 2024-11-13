const mysql2 = require("mysql2/promise");
const fs = require("fs")
const path = require("path");
require("dotenv").config();

const connection = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0
});

(async () => {
  try {
    await connection.getConnection();
    console.log("Connected to the database using pool.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

module.exports = connection;