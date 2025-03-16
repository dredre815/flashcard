const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Connect to the database
const db = new sqlite3.Database("./cards-jwasham-extreme.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
  console.log("Connected to the flashcard database");
});

// Fetch all cards
db.all(`SELECT * FROM cards ORDER BY id`, [], (err, cards) => {
  if (err) {
    console.error("Error fetching cards:", err.message);
    process.exit(1);
  }

  console.log(`Exporting ${cards.length} cards to JSON file...`);

  // Create the data directory if it doesn't exist
  const dataDir = path.join(__dirname, "public", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write the cards to a JSON file
  fs.writeFileSync(
    path.join(dataDir, "cards.json"),
    JSON.stringify({ cards }, null, 2)
  );

  console.log("Cards successfully exported to public/data/cards.json");

  // Close the database connection
  db.close(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});
