#include <WiFi.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>
#include "secrets.h"

#define DOOR_PIN1    12
#define DOOR_PIN2    26
#define PHOTO1_PIN   33
#define PHOTO2_PIN   25
#define TRIG_PIN     27    
#define ECHO_PIN     14

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ====== STATE ======
bool bathroom1Occupied = false;
bool bathroom2Occupied = false; 
bool lastDoor1State = HIGH;
bool lastDoor2State = HIGH;

int peopleCount = 0;
int entryState = 0; // 0=idle, 1=entering(S1), 2=exiting(S2), 3=waiting clear

bool urinalOccupied = false;
unsigned long lastMsgTime = 0; 
unsigned long entryTimeout = 0;        // ตัวแปรเก็บเวลาตอนเริ่มตัดเซนเซอร์
const unsigned long TIMEOUT_MS = 2500; // เวลาสูงสุดที่ยอมให้เดินผ่าน (2.5 วินาที)

// ====== WIFI ======
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* mqtt_server = MQTT_SERVER;
const char* mqtt_user = MQTT_USER;
const char* mqtt_pass = MQTT_PASS;

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retry++;
    if (retry > 40) ESP.restart(); 
  }

  Serial.println("\n WiFi connected");
  espClient.setInsecure();
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    // สร้าง Client ID แบบสุ่มกันซ้ำ
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("CONNECTED");
    } else {
      Serial.print("FAILED rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ====== ULTRASONIC ======
long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); //timeout 30 ms
  if (duration == 0) return 999; 
  return duration * 0.034 / 2;
}

// ====== SETUP ======
void setup() {
  Serial.begin(115200);

  pinMode(DOOR_PIN1, INPUT_PULLUP);
  pinMode(DOOR_PIN2, INPUT_PULLUP);
  pinMode(PHOTO1_PIN, INPUT_PULLUP);
  pinMode(PHOTO2_PIN, INPUT_PULLUP);
  
  pinMode(TRIG_PIN, OUTPUT); 
  pinMode(ECHO_PIN, INPUT);

  connectWiFi();
  client.setServer(mqtt_server, 8883);

  //reset everything
  String payload = "{";
  payload += "\"bathroom1Occupied\":false,";
  payload += "\"bathroom2Occupied\":false,";
  payload += "\"urinalOccupied\":false,";
  payload += "\"peopleCount\":0";
  payload += "}";

  Serial.print("Publishing: ");
  Serial.println(payload);
  
  client.publish("sensor/data", payload.c_str());
}

void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();

  // ====== Magnetic Sensor ======
  // room 1
  bool door1State = digitalRead(DOOR_PIN1);
  if (door1State != lastDoor1State) {
    bathroom1Occupied = (door1State == LOW); 
    lastDoor1State = door1State;
  }

  // room 2
  bool door2State = digitalRead(DOOR_PIN2);
  if (door2State != lastDoor2State) {
    bathroom2Occupied = (door2State == LOW); 
    lastDoor2State = door2State;
  }

  // ====== Photoelectric Sensor ======
  bool s1 = (digitalRead(PHOTO1_PIN) == LOW); // found person = true
  bool s2 = (digitalRead(PHOTO2_PIN) == LOW);

  // State 0: รอคนเดินผ่าน
  if (entryState == 0) {
    if (s1 && !s2) {
      entryState = 1;
      entryTimeout = millis(); 
      Serial.println("Started Entering (S1 Triggered)");
    } 
    else if (!s1 && s2) {
      entryState = 2;
      entryTimeout = millis(); 
      Serial.println("Started Exiting (S2 Triggered)");
    }
  } 
  // State 1: เริ่มเข้าทาง S1, รอตัด S2
  else if (entryState == 1) {
    if (s2) { 
      peopleCount++;
      Serial.println("Person Entered +1 | Total: " + String(peopleCount));
      entryState = 3; 
    } 
    else if (millis() - entryTimeout > TIMEOUT_MS) {
      Serial.println("Entry Timeout - Resetting");
      entryState = 0; 
    }
  } 
  // State 2: เริ่มออกทาง S2, รอตัด S1
  else if (entryState == 2) {
    if (s1) {
      if (peopleCount > 0) peopleCount--;
      Serial.println("Person Exited -1 | Total: " + String(peopleCount));
      entryState = 3; 
    } 
    else if (millis() - entryTimeout > TIMEOUT_MS) {
      Serial.println("Exit Timeout - Resetting");
      entryState = 0; 
    }
  } 
  // State 3: รอจนกว่าเซนเซอร์ทั้งคู่จะเคลียร์ (ไม่มีคนบัง)
  else if (entryState == 3) {
    if (!s1 && !s2) {
      entryState = 0;
      Serial.println("Sensors Cleared - Back to Idle");
    }
  }

  // ====== Send Data (Every 1 second) ======
  if (millis() - lastMsgTime > 1000) {
    lastMsgTime = millis();

    // ultrasonic
    long distance = readDistance();
    urinalOccupied = (distance > 0 && distance < 8); 

    // create JSON
    String payload = "{";
    payload += "\"bathroom1Occupied\":" + String(bathroom1Occupied ? "true" : "false") + ",";
    payload += "\"bathroom2Occupied\":" + String(bathroom2Occupied ? "true" : "false") + ",";
    payload += "\"urinalOccupied\":" + String(urinalOccupied ? "true" : "false") + ",";
    payload += "\"peopleCount\":" + String(peopleCount);
    payload += "}";

    // Serial.print("Publishing: ");
    // Serial.println(payload);
    
    client.publish("sensor/data", payload.c_str());
  }
}