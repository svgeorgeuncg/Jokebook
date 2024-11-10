const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/jokebook.db');

// Create the categories and jokes tables if they don't exist
db.serialize(() => {
  // Create categories table
  db.run("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)");

  // Create jokes table
  db.run("CREATE TABLE IF NOT EXISTS jokes (id INTEGER PRIMARY KEY, category_id INTEGER, setup TEXT NOT NULL, delivery TEXT NOT NULL, FOREIGN KEY (category_id) REFERENCES categories(id))");

  // Insert sample categories
  const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  insertCategory.run('funnyJoke');
  insertCategory.run('lameJoke');

  // Insert sample jokes
  const insertJoke = db.prepare("INSERT OR IGNORE INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)");
  insertJoke.run(1, 'Why did the student eat his homework?', 'Because the teacher told him it was a piece of cake!');
  insertJoke.run(1, 'What kind of tree fits in your hand?', 'A palm tree');
  insertJoke.run(2, 'Which bear is the most condescending?', 'Pan-DUH');
  insertJoke.run(2, 'What would the Terminator be called in his retirement?', 'The Exterminator');
});

db.close(() => {
  console.log('Database setup complete.');
});
