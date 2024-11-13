const mysql2 = require("mysql2");
const fs = require("fs")
const path = require("path");
require("dotenv").config();


function createDatabase(callback) {
  const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  const databaseName = process.env.DB_NAME;

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);

      return;
    }

    const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``;
    connection.query(createDbQuery, (error, results) => {
      if (error) {
        console.error('Error creating database:', error);

        return;
      }
      console.log(`Database "${databaseName}" created or already exists.`);
      
      // Close the initial connection
      connection.end((endErr) => {
        if (endErr) 
          console.error('Error closing the connection:', endErr);

        callback();
      });
    });
  });
}

// Connect and use the database after ensuring it exists
function connectToDatabase() {
  const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL with database:', err);

      return;
    }
    console.log('Connected to MySQL database successfully.');
    
    
    fs.readdirSync(path.join(__dirname, "schema")).forEach((file) => {
      let query = fs.readFileSync(path.join(__dirname, "schema", file), {
        encoding: "utf8"
      })

      connection.query(query, [], (error, results) => {
        if (error) {
          console.error(`Error creating table "${file}":`, error);

          return;
        }

        console.log(`Table "${file} successfully`);
      });

      console.log(file);
    })
  });
}

createDatabase(connectToDatabase);