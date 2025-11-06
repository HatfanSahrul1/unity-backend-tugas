import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

// load from env (supports docker-compose & Railway)
const {
  DB_HOST = process.env.MYSQLHOST || 'localhost',
  DB_PORT = process.env.MYSQLPORT || '3306',
  DB_NAME = process.env.MYSQLDATABASE || 'unitydb', 
  DB_USER = process.env.MYSQLUSER || 'unity',
  DB_PASS = process.env.MYSQLPASSWORD || 'unity_pass',
  PORT = process.env.PORT || '5000'
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
  const [rows] = await pool.query(`
    SELECT 
    u.username, 
    a.score 
    FROM db_user u 
    JOIN db_attributes a ON a.player_id = u.id 
    ORDER BY a.score DESC LIMIT 5`) as mysql.RowDataPacket[][];

  res.json(rows);
});

app.get('/api/user_data/:id', async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    
    const [rows] = await pool.query(
      `SELECT 
        u.username AS username, 
        a.score AS score, 
        a.coin AS coin, 
        a.green_skin AS greenSkin, 
        a.red_skin AS redSkin, 
        a.blue_skin AS blueSkin 
      FROM db_user u 
      JOIN db_attributes a ON a.player_id = u.id 
      WHERE u.id = ?
      ORDER BY a.id ASC LIMIT 1`,
      [userId]
    ) as mysql.RowDataPacket[][];

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]); 

  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash FROM db_user WHERE username = ?',
      [username]
    ) as mysql.RowDataPacket[][];

    const users = rows;
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/create_user', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(`
      INSERT INTO db_user (username, password_hash) VALUES (?, ?)`
      , [username, hash]);

    if (!result || !(result as any).insertId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    res.json({ success: true, id: (result as any).insertId });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/create_attributes/:player_id', async (req, res) => {
  try {
    const playerId = Number(req.params.player_id);
    const { score, coin, greenSkin, redSkin, blueSkin } = req.body;

    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const [result] = await pool.query(`
      INSERT INTO db_attributes 
      (player_id, score, coin, green_skin, red_skin, blue_skin) 
      VALUES (?, ?, ?, ?, ?, ?)`
      , [playerId, score, coin, greenSkin, redSkin, blueSkin]);

    if (!result || !(result as any).insertId) {
      return res.status(500).json({ error: 'Failed to create attributes' });
    }

    res.json({ success: true, id: (result as any).insertId });

  } catch (err) {
    console.error('Error creating attributes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/update_attributes/:player_id', async (req, res) => {
  try {
    const playerId = Number(req.params.player_id);
    const { score, coin, greenSkin, redSkin, blueSkin } = req.body;

    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    // Validasi input data
    if (score === undefined || coin === undefined || 
        greenSkin === undefined || redSkin === undefined || blueSkin === undefined) {
      return res.status(400).json({ error: 'Missing required attributes' });
    }

    // Validasi tipe data
    if (isNaN(score) || isNaN(coin) || 
        ![0, 1].includes(greenSkin) || ![0, 1].includes(redSkin) || ![0, 1].includes(blueSkin)) {
      return res.status(400).json({ error: 'Invalid attribute values' });
    }

    // Periksa apakah player exists
    const [checkResult] = await pool.query(
      'SELECT id FROM db_user WHERE id = ?',
      [playerId]
    ) as mysql.RowDataPacket[][];

    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const [result] = await pool.query(`
      UPDATE db_attributes 
      SET score = ?, coin = ?, green_skin = ?, red_skin = ?, blue_skin = ? 
      WHERE player_id = ?`
      , [score, coin, greenSkin, redSkin, blueSkin, playerId]);

    if (!result || !(result as any).affectedRows) {
      return res.status(404).json({ error: 'No attributes found for this player. Create attributes first.' });
    }

    res.json({ 
      success: true, 
      message: 'Attributes updated successfully',
      playerId: playerId 
    });

  } catch (err) {
    console.error('Error updating attributes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
