// =====================================
// 🌍 Leaderboard API - Coding Infinite
// =====================================

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
const db = new sqlite3.Database("./leaderboard.db");

db.run(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    score INTEGER,
    country TEXT,
    flag TEXT
  )
`);

// ---------- COUNTRY → FLAG ----------
function countryCodeToEmoji(code) {
  if (!code || code.length !== 2) return "";
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );
}

// ---------- AUTO COUNTRY ----------
async function detectCountry(req) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();

    const country = data.country_name || "Unknown";
    const code = data.country_code || "";

    const flag = countryCodeToEmoji(code);
    return { country, flag };
  } catch {
    return { country: "Unknown", flag: "" };
  }
}

// ---------- REGISTER / UPDATE SCORE ----------
app.post("/register", async (req, res) => {
  const { username, score } = req.body;
  if (!username || score === undefined)
    return res.status(400).json({ error: "username & score required" });

  const { country, flag } = await detectCountry(req);

  db.get(
    "SELECT score FROM leaderboard WHERE username = ?",
    [username],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        // New player
        db.run(
          "INSERT INTO leaderboard (username, score, country, flag) VALUES (?, ?, ?, ?)",
          [username, score, country, flag],
          () => res.json({ message: "New player", username, score, country, flag })
        );
      } else if (score > row.score) {
        // Update max score
        db.run(
          "UPDATE leaderboard SET score = ? WHERE username = ?",
          [score, username],
          () => res.json({ message: "Score updated (max kept)", username, score })
        );
      } else {
        // Ignore lower score
        res.json({ message: "Score ignored (lower than max)", username, maxScore: row.score });
      }
    }
  );
});

// ---------- GET LEADERBOARD ----------
app.get("/leaderboard", (req, res) => {
  db.all(
    "SELECT username, score, country, flag FROM leaderboard ORDER BY score DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ---------- ROOT ----------
app.get("/", (req, res) => {
  res.send("🚀 Leaderboard API running | Made by @codinginfinite");
});

// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
