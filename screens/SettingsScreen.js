import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocationSetting } from '../LocationSettingContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { showLocation, setShowLocation } = useLocationSetting();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#0096b2" barStyle="light-content" />

            {/* <View style={[styles.header, Platform.OS === 'android' && styles.androidHeader]}>
                <Text style={styles.title}>Instellingen</Text>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
            </View> */}

            <View style={styles.content}>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Toon mijn locatie op de kaart</Text>
                    <Switch
                        value={showLocation}
                        onValueChange={setShowLocation}
                        thumbColor={showLocation ? "#0096b2" : "#ccc"}
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
    androidHeader: {
        paddingTop: StatusBar.currentHeight || 24,
    },
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
});