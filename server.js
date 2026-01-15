import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database("./leaderboard.db", (err) => {
  if (err) console.log("DB Error:", err);
  else console.log("DB connected!");
});

// Create table
db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
  username TEXT PRIMARY KEY,
  score INTEGER,
  country TEXT,
  flag TEXT
)`);

// REGISTER / UPDATE PLAYER
app.post("/register", async (req, res) => {
  const { username, score } = req.body;
  if (!username || score === undefined)
    return res.status(400).json({ error: "username & score required" });

  // Get client IP
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let country = "Unknown";
  let flag = "";

  try {
    const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
    const data = await response.json();
    country = data.country_name || "Unknown";
    const code = data.country_code || "";
    flag = code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
  } catch (err) {
    console.log("Country detection failed:", err.message);
  }

  db.get("SELECT score FROM leaderboard WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      db.run(
        "INSERT INTO leaderboard (username, score, country, flag) VALUES (?, ?, ?, ?)",
        [username, score, country, flag],
        () => res.json({ username, score, country, flag, message: "New player added" })
      );
    } else if (score > row.score) {
      db.run(
        "UPDATE leaderboard SET score=?, country=?, flag=? WHERE username=?",
        [score, country, flag, username],
        () => res.json({ username, score, country, flag, message: "Score updated" })
      );
    } else {
      res.json({ username, maxScore: row.score, country, flag, message: "Score ignored" });
    }
  });
});

// GET LEADERBOARD
app.get("/leaderboard", (req, res) => {
  db.all("SELECT * FROM leaderboard ORDER BY score DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
