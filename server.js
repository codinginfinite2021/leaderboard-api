import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---------------------------
// Create a new game
// ---------------------------
app.post("/game", (req, res) => {
  const id = uuid();
  const name = req.body.name || "Unnamed Game";
  db.run("INSERT INTO games (id, name) VALUES (?,?)", [id, name], (err) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ game_id: id });
  });
});

// ---------------------------
// Register or update player
// ---------------------------
app.post("/player", (req, res) => {
  const { name, country, emoji } = req.body;

  // Check if player with same name exists
  db.get("SELECT id FROM players WHERE name = ?", [name], (err, row) => {
    if(err) return res.status(500).json({ error: err.message });

    if(row){
      // Player exists → update country/emoji
      db.run("UPDATE players SET country=?, emoji=? WHERE id=?", [country, emoji, row.id]);
      res.json({ player_id: row.id, message: "Existing player, info updated" });
    } else {
      // New player → insert
      const id = uuid();
      db.run("INSERT INTO players (id,name,country,emoji) VALUES (?,?,?,?)", [id, name, country, emoji]);
      res.json({ player_id: id, message: "New player created" });
    }
  });
});

// ---------------------------
// Submit or update score
// ---------------------------
app.post("/score", (req, res) => {
  const { player_id, game_id, score } = req.body;

  // Check if score exists for this player + game
  db.get("SELECT score FROM scores WHERE player_id=? AND game_id=?", [player_id, game_id], (err, row) => {
    if(err) return res.status(500).json({ error: err.message });

    if(row){
      // Update score only if new score is higher
      const newScore = Math.max(row.score, score);
      db.run("UPDATE scores SET score=? WHERE player_id=? AND game_id=?", [newScore, player_id, game_id]);
      res.json({ success: true, message: "Score updated" });
    } else {
      // Insert new score
      db.run("INSERT INTO scores (player_id, game_id, score) VALUES (?,?,?)", [player_id, game_id, score]);
      res.json({ success: true, message: "Score added" });
    }
  });
});

// ---------------------------
// Fetch leaderboard for a game
// ---------------------------
app.get("/leaderboard/:game", (req, res) => {
  db.all(
    `SELECT p.name, p.country, p.emoji, s.score
     FROM scores s
     JOIN players p ON p.id = s.player_id
     WHERE s.game_id = ?
     ORDER BY s.score DESC`,
    [req.params.game],
    (err, rows) => {
      if(err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
