import React, { useEffect, useState } from "react";

const API_URL_DEFAULT = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [apiUrl, setApiUrl] = useState(API_URL_DEFAULT);
  const [health, setHealth] = useState(null);
  const [latest, setLatest] = useState(null);
  const [sending, setSending] = useState(false);
  const [fakeTemp, setFakeTemp] = useState(28.5);
  const [fakeHum, setFakeHum] = useState(60);

  async function loadHealth() {
    try {
      const r = await fetch(`${apiUrl}/api/health`);
      const j = await r.json();
      setHealth(j);
    } catch (e) {
      setHealth({ ok: false, error: e.message });
    }
  }

  async function loadLatest() {
    try {
      const r = await fetch(`${apiUrl}/api/readings/latest`);
      if (r.status === 404) { setLatest(null); return; }
      const j = await r.json();
      setLatest(j);
    } catch (e) {
      setLatest(null);
    }
  }

  async function sendFake() {
    setSending(true);
    try {
      const r = await fetch(`${apiUrl}/api/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "WEB-TEST",
          temperature: Number(fakeTemp),
          humidity: Number(fakeHum),
        }),
      });
      await r.json();
      await loadLatest();
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadHealth();
    loadLatest();
  }, [apiUrl]);

  return (
    <div className="card">
      <h1>KMITL ESP32 Weather Dashboard</h1>
      <p className="muted">Frontend ↔ Backend ↔ MongoDB Atlas — ready before flashing the board.</p>

      <div className="box">
        <label>Backend API URL</label>
        <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://your-render-service.onrender.com" />
        <div style={{marginTop:'.5rem'}} className="mono muted">VITE_API_URL: {import.meta.env.VITE_API_URL || "(not set)"}</div>
      </div>

      <div className="row" style={{marginTop:'1rem'}}>
        <div className="box">
          <div>Health</div>
          <div className="big">{health?.ok ? <span className="ok">OK</span> : <span className="bad">DOWN</span>}</div>
          <div className="muted mono">{health ? JSON.stringify(health) : "..."}</div>
        </div>
        <div className="box">
          <div>Latest Reading</div>
          {latest ? (
            <div className="grid">
              <div><div className="muted">Temperature</div><div className="big">{latest.temperature.toFixed(1)} °C</div></div>
              <div><div className="muted">Humidity</div><div className="big">{latest.humidity.toFixed(0)} %</div></div>
              <div><div className="muted">Device</div><div className="big">{latest.deviceId}</div></div>
              <div><div className="muted">Time</div><div className="big">{new Date(latest.ts).toLocaleString()}</div></div>
            </div>
          ) : <div className="muted">No data yet. Try sending a test reading below.</div>}
        </div>
      </div>

      <div className="box" style={{marginTop:'1rem'}}>
        <h3>Send Test Reading (no board yet)</h3>
        <div className="row">
          <div style={{flex:'1 1 180px'}}>
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" value={fakeTemp} onChange={e=>setFakeTemp(e.target.value)} />
          </div>
          <div style={{flex:'1 1 180px'}}>
            <label>Humidity (%)</label>
            <input type="number" step="1" value={fakeHum} onChange={e=>setFakeHum(e.target.value)} />
          </div>
        </div>
        <button onClick={sendFake} disabled={sending} style={{marginTop:'.75rem'}}>
          {sending ? "Sending..." : "Send to Backend"}
        </button>
      </div>
    </div>
  );
}
