import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocationSetting } from '../LocationSettingContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { showLocation, setShowLocation, darkMode, setDarkMode } = useLocationSetting();

    return (
        <View style={[styles.container, darkMode && styles.containerDark]}>
            <View style={styles.content}>
                <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, darkMode && styles.switchLabelDark]}>Toon mijn locatie op de kaart</Text>
                    <Switch
                        value={showLocation}
                        onValueChange={setShowLocation}
                        thumbColor={showLocation ? "#0096b2" : "#ccc"}
                        trackColor={{ false: "#ccc", true: "#80d8e6" }}
                    />
                </View>
                <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, darkMode && styles.switchLabelDark]}>Darkmode</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        thumbColor={darkMode ? "#0096b2" : "#ccc"}
                        trackColor={{ false: "#ccc", true: "#80d8e6" }}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    containerDark: {
        backgroundColor: '#181818',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0096b2',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    // androidHeader: {
    //     paddingTop: StatusBar.currentHeight || 24,
    // },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    switchLabelDark: {
        color: '#eee',
    },
});