const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/jokebook.db');

// Get all categories
router.get('/', (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) {
      res.status(500).send("Error retrieving categories.");
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
