const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const db = require("../db/database"); // Import the database connection
const { requireAuth } = require("./authMiddleware");

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

// POST a new card to a specific user's collection
router.post("/api/collections/:user_id/cards", async (req, res) => {
  const { card_id, quantity, condition, date_acquired } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO card_collections (user_id, card_id, quantity, condition, date_acquired)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.user_id, card_id, quantity || 1, condition, date_acquired]
    );
    res.status(201).json({ message: "Card added to collection", user_id: req.params.user_id, card_id });
  } catch (error) {
    console.error("Error adding card to collection:", error);
    res.status(500).json({ message: "Error adding card to collection" });
  }
});

// GET a specific card in the collection by card_id for a user
router.get("/api/cards/:card_id", async (req, res) => {
  try {
    const [cards] = await pool.execute(
      `SELECT c.id, c.name, c.description, c.image, cc.quantity, cc.condition, cc.date_acquired
       FROM cards c
       JOIN card_collections cc ON c.id = cc.card_id
       WHERE c.id = ? AND cc.user_id = ?`,
      [req.params.card_id, req.query.user_id]
    );
    if (cards.length === 0) return res.status(404).json({ message: "Card not found in collection" });
    res.json(cards[0]);
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({ message: "Error fetching card" });
  }
});

// PUT - Update a specific card's details in a user's collection
router.put("/api/cards/:card_id", async (req, res) => {
  const { quantity, condition, date_acquired } = req.body;
  try {
    const [result] = await db.execute(
      `UPDATE card_collections
       SET quantity = ?, condition = ?, date_acquired = ?
       WHERE card_id = ? AND user_id = ?`,
      [quantity, condition, date_acquired, req.params.card_id, req.query.user_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Card not found in collection" });
    res.json({ message: "Card updated in collection" });
  } catch (error) {
    console.error("Error updating card in collection:", error);
    res.status(500).json({ message: "Error updating card in collection" });
  }
});

// DELETE a specific card from a user's collection
router.delete("/api/cards/:card_id", async (req, res) => {
  try {
    const [result] = await db.execute(
      `DELETE FROM card_collections WHERE card_id = ? AND user_id = ?`,
      [req.params.card_id, req.query.user_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Card not found in collection" });
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting card from collection:", error);
    res.status(500).json({ message: "Error deleting card from collection" });
  }
});

module.exports = router;
