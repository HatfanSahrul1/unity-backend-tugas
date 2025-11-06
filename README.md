# Unity Backend

Simple backend untuk Unity game dengan login, score, dan coins.

## Fitur
- Login/Register users
- Save score & coins  
- Leaderboard
- Skin items (Green/Red/Blue)

## Tech Stack
- Backend: TypeScript + Express + MySQL
- Unity: C# scripts
- Docker: Easy setup

## Quick Start

1. **Start Backend:**
```bash
docker-compose up -d
```

2. **Copy Unity Scripts:**
- Copy files dari `unity_script/` ke Unity project
- Buat scene: login, daftar, game
- Connect UI elements

3. **Test:**
```bash
curl http://localhost:5000/api/ping
```

## Network Play
```bash
# Run as Admin
setup_firewall.bat

# Ganti Unity baseUrl ke IP kamu
# http://192.168.1.100:5000/api
```

## API Endpoints

```bash
# Register
POST /api/create_user
{"username": "player1", "password": "secret123"}

# Login
POST /api/login  
{"username": "player1", "password": "secret123"}

# Get data
GET /api/user_data/:id

# Update score/coins
POST /api/update_attributes/:id
{"score": 100, "coin": 50, "greenSkin": 1, "redSkin": 0, "blueSkin": 0}

# Leaderboard
GET /api/scores
```

## Unity Testing

Game scene test keys:
- **P** = Add 10 score
- **O** = Add 5 coins

## Troubleshooting

**"Empty reply from server"**
- Run container
- Change Unity baseUrl to your IP address
- Check `http://localhost:5000/api/ping`

**Can't connect from phone**  
- Disable "AP Isolation" in hotspot settings
- Use computer's IP address (not localhost)

## License
MIT - Free to use!