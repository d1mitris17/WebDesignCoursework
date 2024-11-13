const mysql2 = require("mysql2/promise");
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

// Log a message when connected to the database
(async () => {
  try {
    await connection.getConnection();
    console.log("Connected to the database using pool.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

module.exports = connection;
