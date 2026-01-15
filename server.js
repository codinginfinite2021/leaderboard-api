const express = require("express");
const cors = require("cors");
const fs = require("fs");
const geoip = require("geoip-lite");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

/* Safe read */
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch {
    return [];
  }
}

/* Safe save */
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* REGISTER / UPDATE PLAYER */
app.post("/register", (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "username and score required" });
  }

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : "Unknown";

  const data = readData();
  const user = data.find(u => u.username === username);

  if (user) {
    user.score = score;
    user.country = country;
  } else {
    data.push({ username, score, country });
  }

  saveData(data);

  res.json({
    success: true,
    username,
    score,
    country
  });
});

/* GET LEADERBOARD */
app.get("/leaderboard", (req, res) => {
  const data = readData().sort((a, b) => b.score - a.score);
  res.json(data);
});

/* Docs fallback (IMPORTANT FIX) */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/docs.html"));
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
