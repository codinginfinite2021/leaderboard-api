import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/game",(req,res)=>{
  const id = uuid();
  db.run("INSERT INTO games VALUES (?,?)",[id,req.body.name]);
  res.json({game_id:id});
});

app.post("/player",(req,res)=>{
  const {name,country,emoji} = req.body;
  const id = uuid();
  db.run("INSERT INTO players VALUES (?,?,?,?)",[id,name,country,emoji]);
  res.json({player_id:id});
});

app.post("/score",(req,res)=>{
  const {player_id,game_id,score} = req.body;
  db.run("INSERT INTO scores VALUES (?,?,?)",[player_id,game_id,score]);
  res.json({success:true});
});

app.get("/leaderboard/:game",(req,res)=>{
  db.all(`
    SELECT p.name,p.country,p.emoji,s.score
    FROM scores s
    JOIN players p ON p.id=s.player_id
    WHERE s.game_id=?
    ORDER BY s.score DESC
  `,[req.params.game],(_,rows)=>res.json(rows));
});

app.listen(3000);
