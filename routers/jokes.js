const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/jokebook.db');
const axios = require('axios');  // For calling JokeAPI

// Get jokes by category
router.get('/:category', (req, res) => {
    const categoryName = req.params.category;
    const limit = req.query.limit || 10;

    // Check if the category exists locally
    db.get("SELECT id FROM categories WHERE name = ?", [categoryName], (err, category) => {
        if (err || !category) {
            // If not found locally, fetch jokes from JokeAPI
            fetchJokesFromAPI(categoryName, res);
            return;
        }

        // Get jokes from the local database if the category exists
        db.all("SELECT * FROM jokes WHERE category_id = ? LIMIT ?", [category.id, limit], (err, jokes) => {
            if (err) {
                res.status(500).send("Error retrieving jokes.");
                return;
            }
            res.json(jokes);
        });
    });
});

// Add a new joke
router.post('/new', (req, res) => {
    const { category, setup, delivery } = req.body;

    if (!category || !setup || !delivery) {
        return res.status(400).send("Missing required fields.");
    }

    // Ensure the category exists
    db.get("SELECT id FROM categories WHERE name = ?", [category], (err, categoryRow) => {
        if (err || !categoryRow) {
            return res.status(404).send("Category not found.");
        }

        db.run("INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)", [categoryRow.id, setup, delivery], function (err) {
            if (err) {
                res.status(500).send("Error adding joke.");
                return;
            }
            res.status(201).send(`Joke added. New joke ID: ${this.lastID}`);
        });
    });
});

// Function to fetch jokes from JokeAPI and add them to the local database
function fetchJokesFromAPI(category, res) {
    axios.get(`https://v2.jokeapi.dev/joke/${category}?type=twopart&amount=3`)
        .then(response => {
            if (response.data.jokes) {
                response.data.jokes.forEach(joke => {
                    const { setup, delivery } = joke;
                    // Add the jokes to the local database
                    addJokeToDatabase(category, setup, delivery);
                });
                res.json(response.data.jokes); // Send jokes from API to client
            } else {
                res.status(404).send('No jokes found from JokeAPI.');
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error fetching jokes from JokeAPI.');
        });
}

// Helper function to add jokes to the database
function addJokeToDatabase(category, setup, delivery) {
    db.get("SELECT id FROM categories WHERE name = ?", [category], (err, categoryRow) => {
        if (err || !categoryRow) {
            console.log('Category not found while adding joke');
            return;
        }

        db.run("INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)", [categoryRow.id, setup, delivery], function (err) {
            if (err) {
                console.log('Error adding joke to database:', err);
            }
        });
    });
}

module.exports = router;
