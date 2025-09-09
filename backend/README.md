# KMITL ESP32 Backend (Express + MongoDB Atlas)

## Local run
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI
npm run dev
# API:
# POST /api/readings { deviceId?, temperature, humidity, ts? }
# GET  /api/readings/latest
# GET  /api/readings?limit=50
```

## Deploy to Render
1) Create a new **Web Service**.
2) Set **Build Command**: `npm install`
3) Set **Start Command**: `node server.js`
4) Add **Environment Variable**: `MONGODB_URI` with your Atlas URI.
5) Deploy.
