🌍 Leaderboard API - Docs & Demo

This API allows you to:

- Register players with **name, country, emoji**
- Submit **scores** for any game
- Fetch **live leaderboard** for each game
- Automatically detect **user country and emoji**
- Support multiple games
- Unique usernames: same name updates info

---

## 1️⃣ How the API Works

**Endpoints:**

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

## 2️⃣ Send Player Info

Send player info (name, country, emoji). Same name will **update info**.

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
3️⃣ Submit Score
json
Copy code
POST /score
{
  "player_id": "player-xyz",
  "game_id": "PASTE_YOUR_GAME_ID",
  "score": 18
}

Response:
{
  "success": true,
  "message": "Score added or updated"
}
4️⃣ Get Leaderboard
json
Copy code
GET /leaderboard/PASTE_YOUR_GAME_ID

Response:
[
  { "name": "Rahul", "country": "India", "emoji": "🇮🇳", "score": 18 },
  { "name": "Amit", "country": "USA", "emoji": "🇺🇸", "score": 15 }
]
5️⃣ JS Example: Website Integration
javascript
Copy code
const API = "https://leaderboard-api-24cj.onrender.com"; // Your API URL
const GAME_ID = "PASTE_YOUR_GAME_ID";

// Register Player
fetch(API + "/player", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({name:"Rahul", country:"India", emoji:"🇮🇳"})
})
.then(res => res.json())
.then(player => {
  const playerId = player.player_id;

  // Submit Score
  fetch(API + "/score", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({player_id:playerId, game_id:GAME_ID, score:20})
  });

  // Fetch Leaderboard
  fetch(API + "/leaderboard/" + GAME_ID)
    .then(r => r.json())
    .then(data => console.log(data));
});
6️⃣ Demo Game (Click Speed Game)
Enter your name

Click the button as many times as you can in 5 seconds

Score auto sends to API

Leaderboard updates live

Works on web and mobile

Country is detected automatically via IP

Made with ❤️ by @codinginfinite
yaml
Copy code

---

✅ Features included in this README:

1. Beginner-friendly explanation  
2. Step-by-step API usage  
3. JSON examples for all endpoints  
4. JS snippet for integration  
5. Demo game explanation  
6. Auto country detection info  

---


