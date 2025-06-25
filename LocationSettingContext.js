import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationSettingContext = createContext();

export function LocationSettingProvider({ children }) {
    const [showLocation, setShowLocation] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const value = await AsyncStorage.getItem('showLocation');
                setShowLocation(value !== null ? value === 'true' : true);
                const darkValue = await AsyncStorage.getItem('darkMode');
                setDarkMode(darkValue === 'true');
            } catch {
                setShowLocation(true);
                setDarkMode(false);
            }
        })();
    }, []);

    const updateShowLocation = async (value) => {
        setShowLocation(value);
        await AsyncStorage.setItem('showLocation', value ? 'true' : 'false');
    };

    const updateDarkMode = async (value) => {
        setDarkMode(value);
        await AsyncStorage.setItem('darkMode', value ? 'true' : 'false');
    };

    return (
        <LocationSettingContext.Provider value={{
            showLocation,
            setShowLocation: updateShowLocation,
            darkMode,
            setDarkMode: updateDarkMode
        }}>
            {children}
        </LocationSettingContext.Provider>
    );
}

export function useLocationSetting() {
    return useContext(LocationSettingContext);
}
