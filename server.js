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
const db = new sqlite3.Database("./leaderboard.db");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    country TEXT,
    flag TEXT,
    score INTEGER DEFAULT 0
  )`);
});

// Helper to get country & flag from IP
async function getCountryFlag(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    const country = data.country_name || "Unknown";
    const country_code = data.country_code || "";
    const flag = country_code
      ? country_code
          .toUpperCase()
          .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()))
      : "";
    return { country, flag };
  } catch (err) {
    return { country: "Unknown", flag: "" };
  }
}

// Register or update player
app.post("/register", async (req, res) => {
  const { username, score } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const { country, flag } = await getCountryFlag(ip);

  db.get("SELECT * FROM players WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      // Update score if higher
      const newScore = Math.max(row.score, score);
      db.run(
        "UPDATE players SET score = ?, country = ?, flag = ? WHERE username = ?",
        [newScore, country, flag, username],
        () => res.json({ username, score: newScore, country, flag })
      );
    } else {
      // Insert new player
      db.run(
        "INSERT INTO players (username, score, country, flag) VALUES (?,?,?,?)",
        [username, score, country, flag],
        function () {
          res.json({ username, score, country, flag });
        }
      );
    }
  });
});

// Get leaderboard
app.get("/leaderboard", (req, res) => {
  db.all("SELECT * FROM players ORDER BY score DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
