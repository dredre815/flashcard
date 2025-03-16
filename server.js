const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection handler
let db;
function connectDatabase() {
  if (db) {
    console.log("Closing previous database connection");
    db.close();
  }

  console.log("Connecting to database...");
  db = new sqlite3.Database("./cards-jwasham-extreme.db", (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
      // Try to reconnect after 5 seconds
      setTimeout(connectDatabase, 5000);
    } else {
      console.log("Connected to the flashcard database");
      // Test query to verify connection
      db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
        if (err) {
          console.error("Database connection test failed:", err.message);
        } else {
          console.log(`Database contains ${row.count} flashcards`);
        }
      });
    }
  });

  // Handle connection errors
  db.on("error", (err) => {
    console.error("Database error:", err.message);
    connectDatabase(); // Try to reconnect
  });
}

// Initial database connection
connectDatabase();

// Get database structure - now only returns one option for all cards
app.get("/api/tables", (req, res) => {
  res.json({
    tables: [{ name: "all_cards" }],
  });
});

// Get all cards
app.get("/api/cards/all_cards", (req, res) => {
  db.all(`SELECT * FROM cards ORDER BY id`, [], (err, cards) => {
    if (err) {
      console.error("Error fetching cards:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Sending ${cards.length} cards to client`);
    res.json({ cards });
  });
});

// Update card known status
app.post("/api/cards/:id/known", (req, res) => {
  const { id } = req.params;
  const { known } = req.body;

  db.run(
    `UPDATE cards SET known = ? WHERE id = ?`,
    [known ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error(`Error updating card ${id}:`, err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Card ${id} updated, known=${known ? 1 : 0}`);
      res.json({
        message: "Card updated successfully",
        changes: this.changes,
      });
    }
  );
});

// API endpoint to check database connection
app.get("/api/health", (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ status: "error", message: "No database connection" });
  }

  db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
    if (err) {
      console.error("Health check failed:", err.message);
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
    res.json({
      status: "ok",
      database: {
        connected: true,
        cardCount: row.count,
      },
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Close database connection when server stops
process.on("SIGINT", () => {
  if (db) {
    db.close(() => {
      console.log("Database connection closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
