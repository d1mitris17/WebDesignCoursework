const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const db = require("../db/database"); // Import the database connection
const { requireAuth } = require("./authMiddleware");


// gets all of the users cards
router.get("/collections", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Access the authenticated user's ID

    const [rows] = await db.query(
      `SELECT 
          c.id, 
          c.name, 
          c.card_type, 
          c.set_name, 
          c.card_number, 
          c.rarity, 
          c.release_date, 
          c.image_url, 
          cc.quantity, 
          cc.condition, 
          cc.date_acquired, 
          ca.attribute, 
          ca.value
       FROM cards c
       JOIN card_collections cc ON c.id = cc.card_id
       LEFT JOIN card_attributes ca ON c.id = ca.card_id
       WHERE cc.user_id = ?
       ORDER BY c.id`,
      [userId]
    );
    console.log("Fetched rows:", rows); // Check the structure here

    var formattedCards = [];
    var cardMap = {};
    
    rows.forEach((row) => {
      if (!cardMap[row.id]) {
        // Create a new card entry if it doesn't exist in the map
        cardMap[row.id] = {
          id: row.id,
          name: row.name,
          card_type: row.card_type,
          set_name: row.set_name,
          card_number: row.card_number,
          rarity: row.rarity,
          release_date: row.release_date,
          image_url: row.image_url,
          quantity: row.quantity,
          condition: row.condition,
          date_acquired: row.date_acquired,
          attributes: []
        };
        formattedCards.push(cardMap[row.id]);
      }

      // Add attribute if it exists
      if (row.attribute) {
        cardMap[row.id].attributes.push({
          attribute: row.attribute,
          value: row.value
        });
      }
    });
    
    console.log("Fetched cards: ", formattedCards);
    res.json(formattedCards);

  } catch (error) {
    console.error("Error fetching cards in collection:", error);
    res.status(500).json({ message: "Error fetching cards in collection" });
  }
});

// Endpoint to get all cards with optional search query
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || ""; // Get the search term from the query parameters

    let sqlQuery = `
      SELECT 
          c.id, 
          c.name, 
          c.card_type, 
          c.set_name, 
          c.card_number, 
          c.rarity, 
          c.release_date, 
          c.image_url, 
          ca.attribute, 
          ca.value
      FROM cards c
      LEFT JOIN card_attributes ca ON c.id = ca.card_id
    `;
    
    const queryParams = [];

    // If there's a search term, add it to the SQL query
    if (search) {
      sqlQuery += " WHERE c.name LIKE ?";
      queryParams.push(`%${search}%`);
    }

    sqlQuery += " ORDER BY c.id LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [rows] = await db.query(sqlQuery, queryParams);

    // Format the response as before, grouping attributes
    const formattedCards = [];
    const cardMap = {};

    rows.forEach((row) => {
      if (!cardMap[row.id]) {
        cardMap[row.id] = {
          id: row.id,
          name: row.name,
          card_type: row.card_type,
          set_name: row.set_name,
          card_number: row.card_number,
          rarity: row.rarity,
          release_date: row.release_date,
          image_url: row.image_url,
          attributes: [],
        };
        formattedCards.push(cardMap[row.id]);
      }

      if (row.attribute) {
        cardMap[row.id].attributes.push({
          attribute: row.attribute,
          value: row.value,
        });
      }
    });

    res.json(formattedCards);
  } catch (error) {
    console.error("Error fetching cards with attributes:", error);
    res.status(500).json({ message: "Error fetching cards with attributes" });
  }
});

// Add card to user collection
router.post("/collections/:card_id", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const cardId = req.params.card_id;
    const { condition, date_acquired, quantity } = req.body;

    try {
        await db.query(
            `INSERT INTO card_collections (user_id, card_id, quantity, \`condition\`, date_acquired) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            quantity = quantity + VALUES(quantity)`,
            [userId, cardId, quantity, condition, date_acquired]
        );
        res.status(201).json({ message: "Card added to collection" });
    } catch (error) {
        console.error("Error adding card to collection:", error);
        res.status(500).json({ message: "Error adding card to collection" });
    }
});

module.exports = router;
