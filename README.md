# WangMai 🚻
### Real-time Restroom Availability Monitoring System

WangMai is a web-based system designed to help people quickly find available restrooms during urgent situations. The system monitors restroom usage in real time using IoT sensors and displays the availability through a web application.

By combining ESP32 hardware sensors, MQTT messaging, Node.js backend, and a Next.js frontend, the system provides live restroom status updates to users through their web browsers.

## Problem 
In many public places, it is difficult to know whether a restroom is available without physically checking each one. This becomes especially problematic in urgent situations.
**WangMai** solves this problem by providing a real-time dashboard that shows restroom availability.

## System Overview
The system consists of three main components:

Hardware Layer – Sensors connected to an ESP32 board collect restroom usage data.

Backend Layer – Node.js processes sensor data and manages communication.

Frontend Layer – A web interface that displays restroom availability to users.

Sensor data is transmitted using MQTT (HiveMQ) and processed by the backend before being displayed on the web interface.

## System Architecture

Flow Explanation

1. Sensors connected to the ESP32 detect restroom usage.

2. The ESP32 sends data such as: Number of people in restrooms, Urinal occupancy, Door status

3. Data is published to HiveMQ (MQTT Broker).

4. The Node.js Backend subscribes to MQTT topics and processes the data.

5. The backend service is deployed on Render.

6. The Frontend (Next.js) is deployed on Vercel.

7. The frontend sends HTTP requests to the backend API to fetch the latest restroom status.

8. Users access the web application through a browser.


## Hardware

The hardware system uses an ESP32 microcontroller with several sensors to monitor restroom usage.

### ESP32

The ESP32 is responsible for collecting sensor data and sending it to the MQTT broker.

### Sensors Used

Photoelectric Sensor

- Counts the number of people entering and exiting the restroom.

Ultrasonic Sensor

- Detects whether a person is standing at the urinal.

Magnetic Door Switch

- Detects whether a restroom stall door is open or closed.

- Used to determine whether a restroom stall is available.


## Software Stack
### Frontend
- Next.js
- Deployed on Vercel

The frontend displays:
- Real-time restroom availability
- Occupancy information

### Backend
- Node.js
- MQTT communication
- Deployed on Render

Responsibilities:
- Subscribe to MQTT messages from ESP32
- Process sensor data
- Provide REST APIs for the frontend

### Messaging
- HiveMQ (MQTT Broker)

Used for real-time communication between:
- ESP32 hardware
- Backend server

## Contributor
1. Peeradon Thienpongkasem ([peeradonthien](https://github.com/peeradonthien))
2. Phaolap Kulteera ([PhoengZ](https://github.com/PhoengZ))
3. Tinnapat Sittisuwan ([dewwts](https://github.com/dewwts))
