import React, { useEffect, useState } from 'react';
import { usePreferences } from '../contexts/UserContext';

const Alert = () => {
    const { deviceAvailability } = usePreferences();
    return(
        <div>Hello world</div>
    );
};

export default Alert