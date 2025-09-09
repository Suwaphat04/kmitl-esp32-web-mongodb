// ESP32 -> HTTP POST readings to Express backend
// Works with Arduino IDE. Choose "ESP32 Dev Module".
// Replace WiFi SSID/PASS and BACKEND_URL below.

#include <WiFi.h>
#include <HTTPClient.h>

// ====== CONFIG ======
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
// e.g. "http://192.168.1.10:8080" or your Render URL
String BACKEND_URL = "http://10.0.0.2:8080";

// ---- SENSOR PLACEHOLDER ----
// If your KMITL-FIGHT board exposes temperature/humidity via a specific sensor,
// replace the functions below with the proper library calls (DHT22/SHT31/BME280/etc.).
float readTemperatureC() {
  // TODO: replace with real sensor read
  // Simulate data for now
  return 27.5 + (float)(millis() % 1000) / 1000.0;
}
float readHumidity() {
  // TODO: replace with real sensor read
  return 55.0 + (float)((millis()/3) % 1000) / 1000.0;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connect failed");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  float t = readTemperatureC();
  float h = readHumidity();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String endpoint = BACKEND_URL + "/api/readings";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    String payload = String("{"deviceId":"KMITL-FIGHT-ESP32","temperature":") +
                     String(t, 1) +
                     String(","humidity":") +
                     String(h, 0) +
                     String("}");

    int code = http.POST(payload);
    Serial.print("POST ");
    Serial.print(endpoint);
    Serial.print(" -> ");
    Serial.println(code);

    if (code > 0) {
      String res = http.getString();
      Serial.println(res);
    } else {
      Serial.print("HTTP error: ");
      Serial.println(http.errorToString(code));
    }

    http.end();
  }

  delay(10000); // 10s interval
}
