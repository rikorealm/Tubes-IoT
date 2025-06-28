import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { sendDeviceIdToBackend } from '../services/calls'; // Assuming this sends ID to your Node.js backend
import { usePreferences } from './UserContext'; // Assuming this provides preferences.devices

const DeviceDataContext = createContext();

export const DeviceDataProvider = ({ children }) => {
  const { preferences, isLoading: preferencesLoading } = usePreferences(); // Renamed isLoading to preferencesLoading to avoid confusion
  const deviceId = preferences.devices?.[0]?.device_id; // Get the first device ID

  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false); // New state to track WS connection status

  const socketRef = useRef(null);
  const timeoutRef = useRef(null); // For any potential debouncing/retry timeouts
  const previousDeviceIdRef = useRef(null); // Tracks the deviceId from the *last successful connection attempt*
  const deviceWasMissingRef = useRef(false); // True if the device was just removed/missing

  // Restore cached data on initial load
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
  }, []); // Run only once on mount

  // Main effect to manage WebSocket connection based on device ID changes
  useEffect(() => {
    console.log('--- useEffect triggered ---');
    console.log('Current deviceId from preferences:', deviceId);
    console.log('Previous deviceIdRef.current:', previousDeviceIdRef.current);
    console.log('deviceWasMissingRef.current:', deviceWasMissingRef.current);

    // --- Cleanup function for the effect ---
    // This runs when the component unmounts OR when the dependencies change
    const cleanupWebSocket = () => {
      if (socketRef.current) {
        console.log('Cleaning up: Closing existing WebSocket connection.');
        socketRef.current.close(); // Close the WebSocket
        socketRef.current = null;  // Clear the ref
      }
      if (timeoutRef.current) {
        console.log('Cleaning up: Clearing timeout.');
        clearTimeout(timeoutRef.current); // Clear any pending timeouts
        timeoutRef.current = null;
      }
      setIsWebSocketConnected(false); // Reset WS connection status
      setData(null); // Clear current data
      setLastUpdated(null); // Clear last updated timestamp
      localStorage.removeItem('deviceData'); // Clear localStorage
      localStorage.removeItem('deviceLastUpdated');
      console.log('Cleanup complete.');
    };

    // Scenario 1: No device ID is available (device removed or not yet added)
    if (!deviceId) {
      console.log('Scenario 1: Device ID is missing. Setting deviceWasMissingRef to true and cleaning up.');
      deviceWasMissingRef.current = true; // Mark that device was missing
      previousDeviceIdRef.current = null; // Ensure previous ID is cleared
      cleanupWebSocket(); // Perform full cleanup
      return; // Exit the effect early
    }

    // Scenario 2: Device ID is available. Determine if a new connection is needed.
    // A new connection is needed if:
    // a) The device was previously missing (it was just re-added).
    // b) The current deviceId is different from the previously connected one.
    const needsNewConnection =
      deviceWasMissingRef.current || deviceId !== previousDeviceIdRef.current;

    // If no new connection is needed, simply update previousDeviceIdRef and exit.
    // This prevents unnecessary reconnections if the same device ID remains active.
    if (!needsNewConnection) {
      console.log('Scenario 2: Device ID is present and matches previous. No new connection needed.');
      // Important: Update previousDeviceIdRef here too, in case the effect re-runs
      // without an actual device ID change (e.g., other preference changes).
      previousDeviceIdRef.current = deviceId;
      return;
    }

    // If we reach here, a new connection is required.
    console.log(`Scenario 3: New connection required for device ID: ${deviceId}.`);
    console.log(`Reason: deviceWasMissingRef=${deviceWasMissingRef.current}, previousDeviceId=${previousDeviceIdRef.current}`);

    // Reset flags and perform cleanup before attempting new connection
    deviceWasMissingRef.current = false; // Reset the "was missing" flag
    cleanupWebSocket(); // Clean up any lingering old connections/data

    // Store the current deviceId as the 'previous' one for the next comparison
    previousDeviceIdRef.current = deviceId;

    // --- Establish New WebSocket Connection ---
    const establishWebSocketConnection = async () => {
      try {
        console.log(`Attempting to send device ID ${deviceId} to backend...`);
        // Assuming sendDeviceIdToBackend is an async function that might take time.
        // Await its completion to ensure backend is ready to process this device ID.
        await sendDeviceIdToBackend(deviceId);
        console.log('Device ID sent to backend successfully. Proceeding to establish WebSocket.');

        // Clear any existing timeouts before setting up a new WebSocket
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Connect WebSocket immediately after backend call (no arbitrary setTimeout)
        const socket = new WebSocket('ws://localhost:5000');
        socketRef.current = socket; // Store the new socket instance

        socket.onopen = () => {
          console.log('WebSocket opened successfully. Sending deviceId to backend via WS.');
          // Send deviceId to backend via WebSocket for subscription
          socket.send(JSON.stringify({ deviceId }));
          setIsWebSocketConnected(true); // Update connection status
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            // Ensure the message has expected properties before processing
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
          setIsWebSocketConnected(false); // Update connection status on error
          // Consider implementing a retry mechanism here if desired
        };

        socket.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          // Only clear the ref if it's the specific socket instance that just closed
          if (socketRef.current === socket) {
            socketRef.current = null;
            setIsWebSocketConnected(false); // Update connection status
          }
        };

      } catch (error) {
        console.error('Failed to send device ID to backend or establish WebSocket:', error);
        setIsWebSocketConnected(false); // Ensure status is false on error
        // Implement a retry with exponential backoff if this is a transient error
        // For now, just log and stop.
      }
    };

    // Call the async function to establish connection
    establishWebSocketConnection();

    // The return of useEffect is its cleanup function
    return () => {
      console.log('--- useEffect cleanup return ---');
      const nextDeviceId = preferences.devices?.[0]?.device_id;
      if (nextDeviceId !== previousDeviceIdRef.current || deviceWasMissingRef.current) {
        console.log('Cleanup is required due to deviceId change or device reappearance.');
        cleanupWebSocket();
      } else {
        console.log('Skipping cleanup: deviceId unchanged and device was not missing.');
      }
    };

  }, [preferences.devices]); // Dependency array: re-run this effect when preferences.devices changes

  // Optional: Provide loading state or connection status
  const isLoading = preferencesLoading || (deviceId && !isWebSocketConnected && !data);

  return (
    <DeviceDataContext.Provider value={{ data, lastUpdated, isLoading }}>
      {children}
    </DeviceDataContext.Provider>
  );
};

export const useDeviceData = () => useContext(DeviceDataContext);
