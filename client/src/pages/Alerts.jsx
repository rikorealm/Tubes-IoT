import React, { useEffect, useState } from 'react';
import { usePreferences } from '../contexts/UserContext';

const Alert = () => {
    const { deviceAvailability } = usePreferences();
    return(
        <div></div>
        // <div className="w-full max-w-sm flex items-center rounded-2xl shadow-md bg-yellow-200 border border-gray-300 px-4 py-3 m-2">
        //     <img
        //         className="h-10 w-10 object-cover rounded-lg mr-4"
        //         src="/warning.png" // <- use just "/filename" for public folder
        //         alt="Warning"
        //     />
        //     <div className="flex-1">
        //         <div className="flex justify-between items-center text-sm text-gray-800">
        //         <span className="font-semibold">ID: 1</span>
        //         <span className="text-gray-500 text-xs"> test </span>
        //         </div>
        //         <div className="text-red-600 text-sm mt-1"> Warning! </div>
        //     </div>
        // </div>
    );
};

export default Alert