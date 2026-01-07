# 🌍 Leaderboard API - Docs & Demo

![Leaderboard](https://img.shields.io/badge/Leaderboard-API-blue)

This API allows you to:

- Register players with **name, country, emoji**
- Submit **scores** for any game
- Fetch **live leaderboard** for each game
- Automatically detect **user country and emoji**
- Supports multiple games
- Unique usernames: same name updates info

---

## 🔗 Demo & Links

- **Live Demo (Click Speed Game):** [Leaderboard Demo](https://leaderboard-api-24cj.onrender.com/docs.html)  
- **API Base URL:** `https://leaderboard-api-24cj.onrender.com`  
- **IP-based country detection:** Powered by [ipapi.co](https://ipapi.co/)

---

## 1️⃣ How the API Works

**Main Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/game` | POST | Create a new game and get `GAME_ID` |
| `/player` | POST | Register a player (name, country, emoji) |
| `/score` | POST | Submit score for a player |
| `/leaderboard/:game_id` | GET | Get leaderboard for a game |

**Example Flow:**

1. Create game → POST `/game` → get `GAME_ID`  
2. Register player → POST `/player`  
3. Submit score → POST `/score`  
4. Fetch leaderboard → GET `/leaderboard/:game_id`

---

## 2️⃣ Register / Send Player Info

Send player info (name, country, emoji). **Same name updates info**.

```json
POST /player
{
  "name": "Rahul",
  "country": "India",
  "emoji": "🇮🇳"
}

Response:
{
  "player_id": "player-xyz",
  "message": "New player created or info updated"
}
