import { createContext, useContext, useEffect, useState, startTransition } from 'react';
import { subscribeToUserPreferences } from '../services/calls';

const PreferenceContext = createContext();

export const PreferenceProvider = ({ children }) => {
    const [preferences, setPreferences] = useState({
        devices: [],
    });

    const [deviceAvailability, setDeviceAvailability] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let unsubscribe;
        const init = () => {
            try {
                unsubscribe = subscribeToUserPreferences((prefs) => {
                    startTransition(() => {
                            setTimeout(() => {
                                setPreferences(prefs);
                                setDeviceAvailability(prefs.devices?.length > 0);
                            }, 600);
                        }
                    );
                });
            }
            catch (err) {
                console.error('Error subscribing to preferences:', err);
            }
            finally {
                setTimeout(() => {
                    setIsLoading(false);
                    
                }, 800);
            }
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);


    return (
        <PreferenceContext.Provider value={{ preferences, setPreferences, deviceAvailability, isLoading }}>
            {children}
        </PreferenceContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferenceContext);