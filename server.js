import express from "express";
import cors from "cors";
import geoip from "geoip-lite";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory database (simple & fast)
let players = [];

// Helper: country + flag
function getCountry(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  if (ip === "::1") ip = "127.0.0.1";

  const geo = geoip.lookup(ip);

  if (!geo) {
    return { country: "Unknown", flag: "🌍" };
  }

  const country = geo.country || "Unknown";

  const flag =
    country
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
      ) || "🌍";

  return { country, flag };
}

// ✅ Register / Update player
app.post("/register", (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const location = getCountry(req);

  const existing = players.find(p => p.username === username);

  if (existing) {
    existing.score = score;
    existing.country = location.country;
    existing.flag = location.flag;
  } else {
    players.push({
      username,
      score,
      country: location.country,
      flag: location.flag
    });
  }

  res.json({
    message: "Saved successfully",
    country: location.country
  });
});

// ✅ Get leaderboard
app.get("/leaderboard", (req, res) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  res.json(sorted);
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Leaderboard API running 🚀" });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
