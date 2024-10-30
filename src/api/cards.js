const express = require("express");
const router = express.Router();

// Sample in-memory card storage (replace with database logic in production)
let cards = [];

// Create a card
router.post("/", (req, res) => {
  const { name, description, image } = req.body;
  const newCard = { id: cards.length + 1, name, description, image };
  cards.push(newCard);
  res.status(201).json(newCard);
});

// Get all cards
router.get("/", (req, res) => {
  res.json(cards);
});

// Get a card by ID
router.get("/:id", (req, res) => {
  const card = cards.find((c) => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ message: "Card not found" });
  res.json(card);
});

// Update a card
router.put("/:id", (req, res) => {
  const cardIndex = cards.findIndex((c) => c.id === parseInt(req.params.id));
  if (cardIndex === -1)
    return res.status(404).json({ message: "Card not found" });

  const { name, description, image } = req.body;
  cards[cardIndex] = { id: cards[cardIndex].id, name, description, image }; // Update the card
  res.json(cards[cardIndex]);
});

// Delete a card
router.delete("/:id", (req, res) => {
  const cardIndex = cards.findIndex((c) => c.id === parseInt(req.params.id));
  if (cardIndex === -1)
    return res.status(404).json({ message: "Card not found" });

  cards.splice(cardIndex, 1); // Remove the card from the array
  res.status(204).send(); // No content to send back
});

module.exports = router;
