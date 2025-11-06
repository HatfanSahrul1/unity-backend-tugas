# Railway Deployment Checklist

## 📋 Pre-deployment
- [ ] Push code ke GitHub repository
- [ ] File `start.sh`, `package.json`, `Procfile` sudah ada
- [ ] Backend support environment variables (PORT, MYSQL*)

## 🚀 Railway Steps

### 1. Setup Database
- Login ke railway.app
- New Project → Add MySQL
- Note down: MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD

### 2. Deploy Backend  
- New Service → GitHub Repository
- Select your unity-backend repo
- Railway akan otomatis detect Node.js project
- Connect MySQL database (Variables tab)

### 3. Configure Environment
Environment variables otomatis dari MySQL service:
```
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=xxx
PORT=5000 (auto dari Railway)
```

### 4. Test Deployment
- Check logs: railway.app/project/logs
- Test health: `https://your-app.railway.app/api/ping`
- Test endpoints dengan Postman/curl

### 5. Update Unity
```csharp
// BackendManager.cs
public string baseUrl = "https://your-app.railway.app/api";
```

## 🔧 Troubleshooting

**Build fails?**
- Check `railway.app/project/logs`
- Pastikan `start.sh` executable
- Verify `package.json` scripts

**Database connection fails?**  
- Verify MySQL service running
- Check environment variables connected
- Database initializes from `db/init/001_schema.sql`

**"Empty reply from server"?**
- Check Railway domain aktif
- Test `https://your-app.railway.app/api/ping`
- Verify PORT environment variable

## 📱 Unity Update

Setelah deploy, update Unity:
1. Ganti `localhost:5000` ke Railway URL
2. Test di Unity dengan network connection
3. Build APK dan test di device

## 💰 Railway Costs

- **Hobby Plan:** $5/month
- **Database:** Included in plan
- **Bandwidth:** 100GB/month included

## 🔄 Auto-Deploy

Railway otomatis re-deploy ketika push ke GitHub branch yang connected.