import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { sendDeviceIdToBackend } from '../services/calls';
import { usePreferences } from './UserContext';

const DeviceDataContext = createContext();
const server_url = "tubes-iot-production.up.railway.app/";

export const DeviceDataProvider = ({ children }) => {
  const { preferences, isLoading: preferencesLoading } = usePreferences();
  const deviceId = preferences.devices?.[0]?.device_id;

  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const timeoutRef = useRef(null);
  const previousDeviceIdRef = useRef(null);
  const deviceWasMissingRef = useRef(false);
  const deviceWasPreviouslyDefinedRef = useRef(false);

  //Get stored data on device id change
  useEffect(() => {
    const saved = localStorage.getItem('deviceData');
    const savedTime = localStorage.getItem('deviceLastUpdated');

    if (saved && savedTime) {
      try {
        setData(JSON.parse(saved));
        setLastUpdated(parseInt(savedTime, 10));
        console.log('Restored device data from localStorage.');
      } catch (err) {
        console.warn('Failed to parse saved data from localStorage:', err);
        setData(null);
        setLastUpdated(null);
        localStorage.removeItem('deviceData');
        localStorage.removeItem('deviceLastUpdated');
      }
    }
  }, [deviceId]);

  //Handle change of device id and loading of preferences (user data)
  useEffect(() => {
    const currentDeviceId = deviceId;
    const previousDeviceId = previousDeviceIdRef.current;
    const oldSocket = socketRef.current;

    if (preferencesLoading) {
      console.log('Preferences not ready yet, skipping effect.');
      return;
    }

    if (deviceId && !deviceWasPreviouslyDefinedRef.current) {
      deviceWasPreviouslyDefinedRef.current = true;
    }

    //Cleans ws and local data
    const cleanupWebSocket = ({ clearLocal = false } = {}) => {
      if (socketRef.current && socketRef.current === oldSocket) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsWebSocketConnected(false);

      
      if (clearLocal) {
        setData(null);
        setLastUpdated(null);
        localStorage.removeItem('deviceData');
        localStorage.removeItem('deviceLastUpdated');
      }
    };

    //Handle device deletion
    const wasDeleted = !deviceId && deviceWasPreviouslyDefinedRef.current;
    if (!deviceId) {
      console.log('Device is missing.');
      deviceWasMissingRef.current = true;
      if (wasDeleted) {
        console.log('Device was deleted. Clearing localStorage and state.');
        cleanupWebSocket({ clearLocal: true });
      } else {
        console.log('No device ever set (e.g. on refresh). Skipping local cleanup.');
        cleanupWebSocket({ clearLocal: false });
      }
      return;
    }

    //Handle if a new connection is not required
    const needsNewConnection = deviceWasMissingRef.current || currentDeviceId !== previousDeviceId;
    if (!needsNewConnection) {
      console.log('Device ID is present and matches previous ID. No new connection needed.');
      return;
    }

    //Handle if new connection is required (default) and establish new ws conn
    deviceWasMissingRef.current = false;
    const establishWebSocketConnection = async () => {
      try {
        console.log(`Attempt sending device ID ${deviceId} to backend...`);
        await sendDeviceIdToBackend(deviceId);
        console.log('Device ID sent to backend successfully. Proceeding to establish WS.');
        
        //Clear timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        //Connect WebSocket immediately after backend call
        const socket = new WebSocket('wss://' + server_url);
        socketRef.current = socket; // Store the new socket instance

        socket.onopen = () => {
          console.log('WebSocket opened successfully. Sending device ID to backend via WS.');
          socket.send(JSON.stringify({ deviceId }));
          setIsWebSocketConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            //Get & parse obtained data from mqtt broker (through backend ws)
            const parsed = JSON.parse(event.data);
            if (parsed && typeof parsed.topic === 'string' && typeof parsed.message !== 'undefined') {
              const { topic, message } = parsed;
              const timestamp = Date.now();
              const parsedData = { topic, message };
              setData(parsedData);
              setLastUpdated(timestamp);
              localStorage.setItem('deviceData', JSON.stringify(parsedData));
              localStorage.setItem('deviceLastUpdated', timestamp.toString());
              console.log('Received WebSocket message:', parsedData);
            } else {
              console.warn('Received malformed WebSocket message:', parsed);
            }
          } catch (err) {
            console.warn('Error parsing WebSocket message:', err, 'Raw data:', event.data);
          }
        };

        socket.onerror = (err) => {
          console.error('WebSocket error:', err);
          setIsWebSocketConnected(false);
        };

        socket.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          if (socketRef.current === socket) {
            socketRef.current = null;
            setIsWebSocketConnected(false);
          }
        };

      } catch (error) {
        console.error('Failed to send device ID to backend or establish WebSocket:', error);
        setIsWebSocketConnected(false);
      }
    };
    establishWebSocketConnection();
    
    return () => {
      const nextDeviceId = preferences.devices?.[0]?.device_id;
      //Compare with previousDeviceId we saved to check whether data reset is needed
      if (nextDeviceId !== previousDeviceId || deviceWasMissingRef.current) {
        console.log('Cleanup is required due to deviceId change or device reappearance.');
        cleanupWebSocket({ clearLocal: true });
      } else {
        console.log('Skipping cleanup: deviceId unchanged and device was not missing.');
      }
      //Update the previous ref
      previousDeviceIdRef.current = currentDeviceId;
    };

  }, [preferences.devices, preferencesLoading]);

  const isLoading = preferencesLoading || (deviceId && !isWebSocketConnected && !data);

  return (
    <DeviceDataContext.Provider value={{ data, lastUpdated, isLoading }}>
      {children}
    </DeviceDataContext.Provider>
  );
};

export const useDeviceData = () => useContext(DeviceDataContext);
