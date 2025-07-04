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