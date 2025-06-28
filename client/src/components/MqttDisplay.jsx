import { useEffect, useState } from 'react';
import axios from 'axios';

const MqttDisplay = () => {
  const [mqttStatus, setMqttStatus] = useState('Connecting...');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/health');
        setMqttStatus(res.data.mqtt ? 'Connected ✅' : 'Disconnected ❌');
      } catch (err) {
        setMqttStatus('Error contacting server ❌');
      }
    };

    fetchStatus();

    // Optional: poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    
    // WebSocket connection
    const socket = new WebSocket('ws://localhost:5000'); // Match your backend WebSocket port

    socket.onopen = () => {
      console.log('🌐 WebSocket connected');
    };

    socket.onmessage = (event) => {
      const { topic, message } = JSON.parse(event.data);
      console.log('📡 New MQTT message:', topic, message);
      setMessages(prev => [...prev, `${topic}: ${message}`]);
    };

    socket.onerror = (err) => {
      console.error('🚨 WebSocket error:', err);
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => { 
        clearInterval(interval); socket.close();
    };
  }, []);

  return (
    <div>
      <h2>MQTT Broker Status: {mqttStatus}</h2>
      <div>
        <h3>Messages</h3>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MqttDisplay;