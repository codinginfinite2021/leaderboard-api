// =====================================
// 🌍 Leaderboard API - Coding Infinite
// =====================================

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

// node-fetch (for Node 18+ compatibility)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
const db = new sqlite3.Database("./leaderboard.db");

// Create table (runs only once)
db.run(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    score INTEGER,
    country TEXT,
    flag TEXT
  )
`);

// ---------- COUNTRY CODE → EMOJI ----------
function countryCodeToEmoji(code) {
  if (!code || code.length !== 2) return "";
  return code
    .toUpperCase()
    .replace(/./g, c =>
      String.fromCodePoint(127397 + c.charCodeAt())
    );
}

// ---------- AUTO COUNTRY DETECTION ----------
async function detectCountry(req) {
  try {
    // Render / Proxy safe IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();

    const country = data.country_name || "Unknown";
    const code = data.country_code || "";

    const flag = countryCodeToEmoji(code);

    return { country, flag };
  } catch (err) {
    return { country: "Unknown", flag: "" };
  }
}

// ---------- REGISTER / UPDATE SCORE ----------
app.post("/register", async (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({
      error: "username and score required"
    });
  }

  const { country, flag } = await detectCountry(req);

  db.get(
    `SELECT score FROM leaderboard WHERE username = ?`,
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // New user
      if (!row) {
        db.run(
          `INSERT INTO leaderboard (username, score, country, flag)
           VALUES (?, ?, ?, ?)`,
          [username, score, country, flag],
          () => {
            res.json({
              message: "New player registered",
              username,
              score,
              country,
              flag
            });
          }
        );
      }
      // Existing user → keep MAX score only
      else if (score > row.score) {
        db.run(
          `UPDATE leaderboard SET score = ? WHERE username = ?`,
          [score, username],
          () => {
            res.json({
              message: "Score updated (max score kept)",
              username,
              score
            });
          }
        );
      }
      // Lower score → ignore
      else {
        res.json({
          message: "Score ignored (lower than max score)",
          username,
          maxScore: row.score
        });
      }
    }
  );
});

// ---------- GET LEADERBOARD ----------
app.get("/leaderboard", (req, res) => {
  db.all(
    `SELECT username, score, country, flag
     FROM leaderboard
     ORDER BY score DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ---------- ROOT ----------
app.get("/", (req, res) => {
  res.send("🚀 Leaderboard API running | Made by @codinginfinite");
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
