import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

// load from env (docker-compose)
const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'unitydb',
  DB_USER = 'unity',
  DB_PASS = 'unity_pass'
} = process.env;

// buat pool koneksi
let pool: mysql.Pool;

async function initDB() {
  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    connectionLimit: 10
  });
  console.log(`Connected to MySQL at ${DB_HOST}:${DB_PORT}`);
}

initDB().catch(err => {
  console.error("DB connection failed:", err);
  process.exit(1);
});

// endpoints
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date() }));

app.get('/api/scores', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM scores ORDER BY score DESC LIMIT 20');
  res.json(rows);
});

app.post('/api/scores', async (req, res) => {
  const { player, score } = req.body;
  if (!player || !score) return res.status(400).json({ error: 'Missing data' });

  const [result] = await pool.query(
    'INSERT INTO scores (player, score) VALUES (?, ?)',
    [player, score]
  );
  res.json({ success: true, id: (result as any).insertId });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
