#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==== CONFIG ====
const char* WIFI_SSID = "inumm_2.4G";
const char* WIFI_PASS = "0954858958";
String BACKEND_URL = "https://kmitl-esp32-backend.onrender.com";

// ==== DHT CONFIG ====
#define DHTPIN 4       // ขา DATA ของ DHT ต่อกับ GPIO4 (ปรับได้ตามบอร์ด)
#define DHTTYPE DHT22  // เปลี่ยนเป็น DHT11 ถ้าใช้รุ่นนั้น
DHT dht(DHTPIN, DHTTYPE);

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
  dht.begin();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  float t = dht.readTemperature(); // องศาเซลเซียส
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String endpoint = BACKEND_URL + "/api/readings";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"deviceId\":\"KMITL-FIGHT-ESP32\",\"temperature\":" 
                     + String(t, 1) +
                     ",\"humidity\":" 
                     + String(h, 0) + "}";

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

  delay(10000); // ส่งทุก 10 วินาที
}
