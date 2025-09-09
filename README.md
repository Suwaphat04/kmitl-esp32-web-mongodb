# KMITL ESP32 → Web App (MongoDB Atlas + Render + Arduino IDE)

## Structure
- `backend/` Express + MongoDB Atlas API
- `frontend/` Vite + React dashboard
- `esp32/` Arduino sketch (ESP32 posts readings)

## Quick Start (Local)
1) **MongoDB Atlas**: create cluster, Database `kmitl`, collection `readings`. Get connection string.
2) **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # paste your MONGODB_URI
   npm run dev
   ```
   Test: `GET http://localhost:8080/api/health`
3) **Frontend**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env  # ensure VITE_API_URL=http://localhost:8080
   npm run dev
   ```
   Open the shown URL and you should see the dashboard.
4) **Test without board**: in the frontend, use the "Send Test Reading" section to post a fake reading. You should see it appear as the latest reading.

## Deploy
- **Backend (Render)**: Create Web Service → Build: `npm install` → Start: `node server.js` → set `MONGODB_URI`. After deploy, copy the HTTPS URL.
- **Frontend**:
  - Option A (Local only): keep using `npm run dev` and set `VITE_API_URL` to your Render backend URL.
  - Option B (Any static host): `npm run build` → deploy `dist/` to Netlify/Vercel/Render Static Site, with environment variable `VITE_API_URL` pointing to your backend URL.

## ESP32 (Arduino IDE)
- Open `esp32/esp32_kmitl_http_post/esp32_kmitl_http_post.ino`.
- Select **Board**: ESP32 Dev Module (or your KMITL variant).
- Edit `WIFI_SSID`, `WIFI_PASS`, and `BACKEND_URL` (use your Render backend URL).
- Replace the placeholder sensor functions with the correct library for your board's sensor (e.g., DHT22/SHT31/BME280).
- Upload. The device will POST JSON every 10 seconds.

## API
- `POST /api/readings` → `{ deviceId?, temperature:Number, humidity:Number, ts? }`
- `GET  /api/readings/latest`
- `GET  /api/readings?limit=50`

## Notes
- CORS is enabled in the backend, so the frontend can call it directly from the browser.
- Timestamps (`ts`) are stored in UTC.
