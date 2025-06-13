import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';

export default function CameraScreen() {
    // Set camera type to 'back' and don't provide a way to change it
    const [type] = useState('back');
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    async function requestCameraPermission() {
        try {
            const { Camera } = await import('expo-camera');
            return await Camera.requestCameraPermissionsAsync();
        } catch (err) {
            console.error("Error requesting camera permission:", err);
            return { status: 'denied' };
        }
    }

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button
                    onPress={async () => {
                        const { status } = await requestCameraPermission();
                        setHasPermission(status === 'granted');
                    }}
                    title="Grant Permission"
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                type={type}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
});