import admin from 'firebase-admin';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const MQTT_URL = process.env.MQTT_URL;
const MQTT_USER = process.env.MQTT_USERNAME;
const MQTT_PASS = process.env.MQTT_PASSWORD;

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  }),
});

const mqttClient = mqtt.connect(MQTT_URL, {
  clientId: 'backend-server-' + Math.random().toString(16).substr(2, 8),
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  console.log(`MQTT connected to ${MQTT_URL}`);
});

mqttClient.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

mqttClient.on('close', () => {
  console.warn('MQTT connection closed');
});

const wsDeviceSubscriptions = new Map();

mqttClient.on('message', (topic, message) => {
  const [prefix, deviceId] = topic.split('/');

  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN && wsDeviceSubscriptions.get(ws) === deviceId) {
      ws.send(JSON.stringify({ topic, deviceId, message: message.toString() }));
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'server running', mqtt: mqttClient.connected });
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).send("Unauthorized");

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

app.post('/api/subscribe', authenticate, async (req, res) => {
  const { deviceId } = req.body;
  const uid = req.user.uid;
  const topic = `data/${deviceId}`;

  if (mqttClient.connected) {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error('MQTT subscription error:', err);
        return res.status(500).json({ error: 'MQTT subscription failed' });
      }
      console.log(`User ${uid} subscribed to topic: ${topic}`);
      return res.status(200).json({ success: true, topic });
    });
  }
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (msg) => {
    try {
      const { deviceId } = JSON.parse(msg.toString());
      wsDeviceSubscriptions.set(ws, deviceId);
      console.log(`WebSocket client subscribed to device: ${deviceId}`);
    } catch (err) {
      console.error('Invalid WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    wsDeviceSubscriptions.delete(ws);
    console.log('WebSocket client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
