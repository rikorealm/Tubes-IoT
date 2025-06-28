import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../contexts/UserContext';
import { useDeviceData } from '../contexts/deviceDataProvider';
import { count } from 'firebase/firestore';

const Home = () => {
  const { preferences, deviceAvailability, isLoading } = usePreferences();
  const [sensorData, setSensorData] = useState({});
  const [now, setNow] = useState(Date.now());

  // const deviceId = preferences?.devices?.[0]?.device_id;

  const { data, lastUpdated }  = useDeviceData();

  console.log("data: ", data);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (!data?.message) return;

    try {
      const rawArray = JSON.parse(data.message); // <-- parse the string message
      const structured = {};

      rawArray.forEach(({ payload_subject, content }) => {
        structured[payload_subject] = {};

        content.forEach(({ param_key, param_val }) => {
          structured[payload_subject][param_key] = param_val;
        });
      });

      setSensorData(structured);
      console.log("struct: ", structured);

    } catch (err) {
      console.error('Error parsing message:', err);
    }
  }, [data]);

  const pumpState = () => {
    if (sensorData?.ultrasonic_1?.pump_state === 0) {
      return 'Pump is OFF';
    }
    else if (sensorData?.ultrasonic_1?.pump_state === 1)
      return 'Pump is ON';
    else {
      return 'N/A';
    }
  };

  const needLight = () => {
    if (sensorData?.ldr_1?.need_light === 0) {
      return '🌞 Not Needed';
    }
    else if (sensorData?.ldr_1?.need_light === 1)
      return '🌞 Needed';
    else {
      return 'N/A';
    }
  };

  const fromLed = () => {
    if (sensorData?.ldr_1?.from_led === 0) {
      return 'Light not from LED';
    }
    else if (sensorData?.ldr_1?.from_led === 1)
      return 'Light from LED';
    else {
      return 'N/A';
    }
  };

  const countPassedTime = (timestamp) => {
    const seconds = Math.floor(Math.max(0, Math.floor(timestamp) / 1000));

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if ( isLoading ) { 
    return (
      <div className="bg-[var(--color-background)]">
        <h1 className="font-bold text-xl">Loading...</h1>
      </div>
    ); 
  }
  else if ( isLoading === false ) {
    return (
      <div className='w-full justify-center items-center'>
        <div className={`${(!deviceAvailability) ? '' : 'hidden'} flex flex-col justify-center items-center px-4`}>
          <h1 className="text-sm text-center text-[var(--color-accent)] mb-4">
            No device has been added yet, please add device.
          </h1>
          <div className="flex w-full gap-3 flex-wrap justify-center">
            <button
              onClick={() => navigate('/add-edit-device')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4
                          bg-[var(--color-background-darker)] text-[var(--color-accent)] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Add Device</span>
            </button>
          </div>
        </div>
        
        <div className={`${(deviceAvailability) ? '' : 'hidden'} grid grid-cols-1 md:grid-cols-1 gap-6 px-8 w-full mt-5`}>
          
          <div className="bg-[#ffe7c5] shadow-lg rounded-2xl p-4 flex flex-col items-start justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="text-red-500">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 15.5V5a1 1 0 10-2 0v10.5a3.5 3.5 0 102 0z" /><path d="M12 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-700">Temperature</h4>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2"> {sensorData?.dht_1?.suhu ?? 'N/A'}°C </div>
            <span className="text-xs text-gray-500 mt-1">Updated {(now && lastUpdated) ? countPassedTime(now - lastUpdated) : 'N/A'}</span>
          </div>

          
          <div className="bg-[var(--color-primary)]/30 shadow-lg rounded-2xl p-4 flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="text-blue-500">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s5.5 5.97 5.5 10.5A5.5 5.5 0 0112 18a5.5 5.5 0 01-5.5-5.5C6.5 7.97 12 2 12 2z" /></svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-700">Humidity</h4>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2"> {sensorData?.dht_1?.kelembaban ?? 'N/A'}%</div>
            <span className="text-xs text-gray-500 mt-1">Updated {(now && lastUpdated) ? countPassedTime(now - lastUpdated) : 'N/A'}</span>
          </div>

          
          <div className="bg-[#cfe6ff] shadow-lg rounded-2xl p-4 flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="text-teal-500">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C12 2 4 10 4 14a8 8 0 0016 0c0-4-8-12-8-12z" /></svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-700">Water Level</h4>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2"> {sensorData?.ultrasonic_1?.depth ?? 'N/A'} cm </div>
            <span className="text-xs text-gray-500 mt-1"> { pumpState() } </span>
          </div>

          
          <div className="bg-[#f8f8e6] shadow-lg rounded-2xl p-4 flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="text-yellow-500">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l.707.707M3 12h1m16 0h1m-2.222 7.778l-.707-.707M6.343 17.657l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-700">Light</h4>
            </div>
            <div className="text-xl font-bold mt-2 text-gray-900"> { needLight() } </div>
            <span className="text-xs text-gray-500 mt-1"> { fromLed() } </span>
          </div>
        </div>
      </div>
    );
  }
};

export default Home;