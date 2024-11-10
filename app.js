const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Serve static files (like index.html, styles.css, etc.) from the 'public' folder
app.use(express.static('public'));

// Database connection
const db = new sqlite3.Database('./data/jokebook.db', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Routes for categories and jokes
const categoriesRouter = require('./routers/categories');
const jokesRouter = require('./routers/jokes');
app.use('/jokebook/categories', categoriesRouter);
app.use('/jokebook/joke', jokesRouter);

// Define a route for the root URL to send `index.html` (default page)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
