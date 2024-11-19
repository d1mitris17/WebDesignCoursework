const express = require("express");
const router = express.Router();
const db = require("../db/database"); // Import the database connection
const { requireAuth } = require("./authMiddleware");

// Get all cards in the user's collection with optional card type filtering
router.get("/collections", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Access the authenticated user's ID
    const cardType = req.query.card_type; // Optional card type filter from query parameters

    // Build the SQL query dynamically based on the card type
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
          cc.quantity, 
          cc.condition, 
          cc.date_acquired, 
          ca.attribute, 
          ca.value
      FROM cards c
      JOIN card_collections cc ON c.id = cc.card_id
      LEFT JOIN card_attributes ca ON c.id = ca.card_id
      WHERE cc.user_id = ?
    `;

    const queryParams = [userId];

    // If cardType is specified, add it to the query
    if (cardType) {
      sqlQuery += " AND c.card_type = ?";
      queryParams.push(cardType);
    }

    sqlQuery += " ORDER BY c.id";

    const [rows] = await db.query(sqlQuery, queryParams);

    // Group attributes for each card
    const formattedCards = [];
    const cardMap = {};

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
          attributes: [],
        };
        formattedCards.push(cardMap[row.id]);
      }

      // Add attribute if it exists
      if (row.attribute) {
        cardMap[row.id].attributes.push({
          attribute: row.attribute,
          value: row.value,
        });
      }
    });

    res.json(formattedCards);
  } catch (error) {
    console.error("Error fetching cards in collection:", error);
    res.status(500).json({ message: "Error fetching cards in collection" });
  }
});

// Get all cards with optional search, pagination, and card type filtering
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25; // Pagination limit
    const offset = parseInt(req.query.offset) || 0; // Pagination offset
    const search = req.query.search || ""; // Search term
    const cardType = req.query.card_type; // Optional card type filter

    // Base SQL query
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

    // Add WHERE clause if search or card type is provided
    if (search || cardType) {
      sqlQuery += " WHERE";

      if (search) {
        sqlQuery += " c.name LIKE ?";
        queryParams.push(`%${search}%`);
      }

      if (cardType) {
        if (search) sqlQuery += " AND";
        sqlQuery += " c.card_type = ?";
        queryParams.push(cardType);
      }
    }

    // Add ordering, limit, and offset
    sqlQuery += " ORDER BY c.id LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [rows] = await db.query(sqlQuery, queryParams);

    // Format cards and group attributes
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

// Add a card to a user's Collection
// Add a card to the user's collection
router.post("/collection/add", requireAuth, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the decoded JWT
  const { cardId, quantity, condition, dateAcquired } = req.body;

  try {
    // Validate inputs
    if (!cardId || quantity <= 0 || !condition || !Date.parse(dateAcquired)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Insert or update the card in the user's collection
    await db.query(
      `INSERT INTO card_collections (user_id, card_id, quantity, \`condition\`, date_acquired)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       quantity = quantity + VALUES(quantity),
       \`condition\` = VALUES(\`condition\`),
       date_acquired = VALUES(date_acquired)`,
      [userId, cardId, quantity, condition, dateAcquired]
    );

    res.status(201).json({ message: "Card successfully added to the collection." });
  } catch (error) {
    console.error("Error adding card to collection:", error);
    res.status(500).json({ message: "Failed to add card to the collection." });
  }
});

router.post("/delete", requireAuth, async (req, res) => {
  const { cardid } = req.body; // Card ID to delete
  const userId = req.user.id; // Get the user ID from the decoded JWT

  try {
    if (!cardid) {
      return res.status(400).json({ message: "Card ID is required." });
    }
    console.log("Deleting card:", cardid);
    console.log("User ID:", userId);
    await db.query("DELETE FROM card_collections WHERE card_id = ? AND user_id = ?", [cardid, userId]);
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ message: "Failed to delete card." });
  }
});

module.exports = router;
