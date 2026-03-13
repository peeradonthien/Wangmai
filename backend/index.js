const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const { Server } = require("socket.io");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const mqttOptions = {
  host: process.env.HOST,
  port: 8883,
  protocol: "mqtts",
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

const mqttClient = mqtt.connect(mqttOptions);

const topic = "sensor/data";

mqttClient.on("connect", () => {
  console.log(`Connected to HiveMQ Cloud! Subscribing to: ${topic}`);
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error("Subscribe error:", err);
  });
});

mqttClient.on("message", (incomingTopic, message) => {
  if (incomingTopic !== topic) return;

  try {
    const rawData = message.toString();
    let jsonData = JSON.parse(rawData);

    const time = new Date();
    jsonData["timestamp"] = time;
    console.log("Received & Emitting:", jsonData);

    io.emit("update", jsonData);
  } catch (err) {
    console.error(`Error processing message: `, err);
  }
});

io.on("connection", (socket) => {
  console.log("New Client connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

const PORT = parseInt(process.env.PORT_BACKEND || "3000", 10);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
