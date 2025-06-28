import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTT_BROKER_URL = '';

export default function useMqtt(deviceId) {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    if (!deviceId) return;

    const client = mqtt.connect(MQTT_BROKER_URL);

    const topic = `data/${deviceId}`;

    client.on('connect', () => {
      console.log(`Connected to MQTT broker. Subscribing to ${topic}`);
      client.subscribe(topic);
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(data);
        setSensorData(data); // { temperature: xx, humidity: xx, ... }
      } catch (err) {
        console.error('Failed to parse MQTT message', err);
      }
    });

    return () => {
      client.end();
    };
  }, [deviceId]);

  return sensorData;
}