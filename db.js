import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./data.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players(
    id TEXT PRIMARY KEY,
    name TEXT,
    country TEXT,
    emoji TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS games(
    id TEXT PRIMARY KEY,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS scores(
    player_id TEXT,
    game_id TEXT,
    score INTEGER
  )`);
});

export default db;
