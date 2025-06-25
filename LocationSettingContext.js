import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationSettingContext = createContext();

export function LocationSettingProvider({ children }) {
    const [showLocation, setShowLocation] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const value = await AsyncStorage.getItem('showLocation');
                setShowLocation(value !== null ? value === 'true' : true);
            } catch {
                setShowLocation(true);
            }
        })();
    }, []);

    const updateShowLocation = async (value) => {
        setShowLocation(value);
        await AsyncStorage.setItem('showLocation', value ? 'true' : 'false');
    };

    return (
        <LocationSettingContext.Provider value={{ showLocation, setShowLocation: updateShowLocation }}>
            {children}
        </LocationSettingContext.Provider>
    );
}

export function useLocationSetting() {
    return useContext(LocationSettingContext);
}
