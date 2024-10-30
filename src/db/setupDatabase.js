const mysql = require("mysql"); // Assuming you're using MySQL
require("dotenv").config(); // Load .env file contents into process.env

// Create a database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database as id " + connection.threadId);
});

module.exports = connection; // Export the connection for use in other files
