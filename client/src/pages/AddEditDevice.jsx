import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/UserContext";
import { getUserPreferences, saveUserPreferences, updateDevicesData } from "../services/calls";

const AddEditDevice = () => {
    const navigate = useNavigate();

    const { preferences, setPreferences, deviceAvailability } = usePreferences();

    const [deviceName, setDeviceName] = useState('');
    const [deviceID, setDeviceID] = useState('');
    const [previousDeviceId, setPreviousDeviceId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const prefs = await getUserPreferences();
                if (prefs.devices && prefs.devices.length > 0) {
                    const device = prefs.devices[0];
                    setDeviceName(device.device_name);
                    setDeviceID(device.device_id);
                    setPreviousDeviceId(device.device_id);
                }
            } 
            catch (err) {
                console.error('Failed to load preferences:', err);
            }
        };
        fetchData();
    }, []);

    const handleAddDevice = async () => {
        const newDevice = {
            device_name: deviceName,
            device_id: deviceID
        }
        const updatedDevices = [...preferences.devices, newDevice];
        setPreferences((prev) => ({
            ...prev,
            devices: updatedDevices,
        }));

        try {
            await saveUserPreferences({
                ...preferences,
                devices: updatedDevices,
            });
            navigate('/');
        }
        catch (error) {
            console.error("Error adding device:", error);
        }
    };

    const handleUpdateDevice = async () => {
        const updatedDevice = {
            device_id: deviceID,
            device_name: deviceName,
        };

        const updatedDevices = preferences.devices.map((device) =>
            device.device_id === previousDeviceId ? updatedDevice : device
        );
        console.log("prev id: ", previousDeviceId);
        console.log("update id: ", updatedDevice.device_id);
        console.log("update name: ", updatedDevice.device_name);

        setPreviousDeviceId(updatedDevice.device_id);
        setPreferences((prev) => ({
            ...prev,
            devices: updatedDevices,
        }));

        try {
            await updateDevicesData(updatedDevices);
            console.log("Device updated successfully");
            navigate('/');
        } 
        catch (error) {
            console.error("Error updating device:", error);
        }
    };

    const handleDeleteDevice = async () => {
        const updatedDevices = preferences.devices.filter(
            (device) => device.device_id !== deviceID
        );

        setPreferences((prev) => ({
            ...prev,
            devices: updatedDevices,
        }));

        try {
            await updateDevicesData(updatedDevices);
            console.log("Device deleted successfully");
            navigate('/');
        } 
        catch (error) {
            console.error("Error deleting device:", error);
        }
    };

    return (
        <div
            className="relative flex size-full min-h-screen flex-col bg-[var(--color-background)] justify-between group/design-root overflow-x-hidden"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <div className="flex items-center bg-[var(--color-background)] p-4 pb-2 justify-evenly">
                <div className="flex w-12 items-center justify-start">
                    <div className="text-[var(--color-primary)] flex size-12 shrink-0 items-center" data-icon="ArrowLeft" data-size="24px" data-weight="regular" onClick={() => navigate('/') }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                        </svg>
                    </div>
                </div>
                <h2 className="text-[var(--color-primary)] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center"> {(deviceAvailability)? 'Edit Device' : 'Add Device' } </h2>
                <div className="flex w-12 items-center justify-end"></div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-start w-full px-4">
                <div className="flex max-w-[480px] w-full flex-wrap items-end gap-4 px-10 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[var(--color-primary)] text-base font-medium leading-normal pb-2">Device Name</p>
                        <input
                        placeholder="Enter device name"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[var(--color-primary)] focus:outline-0 focus:ring-0 border-none bg-[#ebefed] focus:border-none h-14 placeholder:text-[#648273] p-4 text-base font-normal leading-normal"
                        />
                    </label>
                </div>

                <div className="flex max-w-[480px] w-full flex-wrap items-end gap-4 px-10 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[var(--color-primary)] text-base font-medium leading-normal pb-2">Device ID</p>
                        <input
                        placeholder="Enter device ID"
                        value={deviceID}
                        onChange={(e) => setDeviceID(e.target.value)}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[var(--color-primary)] focus:outline-0 focus:ring-0 border-none bg-[#ebefed] focus:border-none h-14 placeholder:text-[#648273] p-4 text-base font-normal leading-normal"
                        />
                    </label>
                </div>

                

                <div className="flex px-10 py-3 mt-5 gap-4">
                    <button
                        onClick={handleDeleteDevice}
                        className={`${(deviceAvailability) ? 'flex' : 'hidden'} min-w-[110px] lg:w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 lg:h-12 px-4 flex-1 bg-[#c7dbd4] text-[var(--color-accent)] text-sm font-bold leading-normal tracking-[0.015em]`}
                    >
                        <span className="truncate"> {(deviceAvailability)? 'Delete' : '' } </span>
                    </button>
                    <button
                        onClick={(deviceAvailability) ? handleUpdateDevice : handleAddDevice}
                        className="flex min-w-[110px] lg:w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 lg:h-12 px-4 flex-1 bg-[var(--color-background-darker)] text-[var(--color-accent)] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                        <span className="truncate"> {(deviceAvailability)? 'Save' : 'Add' } </span>
                    </button>
                </div>
            </div>   
        </div>
    );
};

export default AddEditDevice


{/* <div className="flex max-w-[480px] w-full flex-wrap items-end gap-4 px-10 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[var(--color-primary)] text-base font-medium leading-normal pb-2">Connection Type</p>
                        <div className="flex w-full flex-1 items-stretch rounded-xl">
                        <input
                            placeholder="Select connection type"
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[var(--color-primary)] focus:outline-0 focus:ring-0 border-none bg-[#ebefed] focus:border-none h-14 placeholder:text-[#648273] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                        />
                        <div
                            className="text-[#648273] flex border-none bg-[#ebefed] items-center justify-center pr-4 rounded-r-xl border-l-0"
                            data-icon="CaretUpDown"
                            data-size="24px"
                            data-weight="regular"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path
                                d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"
                            ></path>
                            </svg>
                        </div>
                        </div>
                    </label>
                </div>

                <div className="flex max-w-[480px] w-full flex-wrap items-end gap-4 px-10 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[var(--color-primary)] text-base font-medium leading-normal pb-2">Network SSID</p>
                        <input
                        placeholder="Enter network SSID"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[var(--color-primary)] focus:outline-0 focus:ring-0 border-none bg-[#ebefed] focus:border-none h-14 placeholder:text-[#648273] p-4 text-base font-normal leading-normal"
                        />
                    </label>
                </div>

                <div className="flex max-w-[480px] w-full flex-wrap items-end gap-4 px-10 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[var(--color-primary)] text-base font-medium leading-normal pb-2">Password</p>
                        <input
                        placeholder="Enter password"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[var(--color-primary)] focus:outline-0 focus:ring-0 border-none bg-[#ebefed] focus:border-none h-14 placeholder:text-[#648273] p-4 text-base font-normal leading-normal"
                        />
                    </label>
                </div> */}
// <div>
//                 <div className="flex gap-2 border-t border-[var(--color-background-darker)] bg-[var(--color-background)] px-4 pb-3 pt-2">
//                 {/* Home Link */}
//                 <a
//                     onClick={() => navigate('/')}
//                     className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[var(--color-accent)]`}
//                 >
//                     <div className={`flex h-8 items-center justify-center`} data-icon="House" data-size="24px" data-weight="fill">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
//                         <path
//                         d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
//                         ></path>
//                     </svg>
//                     </div>
//                 </a>
//                 {/* Bell Link (Notifications/Alerts) */}
//                 <a
//                     onClick={() => navigate('/alert')}
//                     className={`flex flex-1 flex-col items-center justify-end gap-1 text-[var(--color-primary)]`}
//                 >
//                     <div className={`flex h-8 items-center justify-center`} data-icon="Bell" data-size="24px" data-weight="fill">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
//                         <path
//                         d="M221.8,175.94A16,16,0,0,1,208,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM208,104a80,80,0,0,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200h160a16,16,0,0,0,13.8-24.06C216.25,166.38,208,139.33,208,104Z"
//                         ></path>
//                     </svg>
//                     </div>
//                 </a>
//                 {/* User Link (Profile/Settings) */}
//                 <a
//                     onClick={() => navigate('/profile')}
//                     className={`flex flex-1 flex-col items-center justify-end gap-1 text-[var(--color-primary)]`}
//                 >
//                     <div className={`flex h-8 items-center justify-center`} data-icon="User" data-size="24px" data-weight="fill">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
//                         <path
//                         d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
//                         ></path>
//                     </svg>
//                     </div>
//                 </a>
//                 </div>
//             </div>