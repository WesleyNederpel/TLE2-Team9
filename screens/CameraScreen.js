import React, { useState, useEffect, useRef } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native'; // Importeer useIsFocused

export default function CameraScreen({ navigation }) {
    const [type] = useState('back');
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);
    const [isTakingPicture, setIsTakingPicture] = useState(false);
    const [zoom, setZoom] = useState(0);

    const isFocused = useIsFocused(); // Gebruik de hook hier

    useEffect(() => {
        (async () => {
            if (isFocused) { // Voer permissieaanvraag alleen uit als het scherm in focus is
                const { status } = await requestCameraPermission();
                setHasPermission(status === 'granted');
            } else {
                // Optioneel: reset de permissiestatus of doe iets anders wanneer het scherm niet in focus is
                setHasPermission(null);
            }
        })();
    }, [isFocused]); // Herlaad de effect wanneer de focus verandert

    async function requestCameraPermission() {
        try {
            const { Camera } = await import('expo-camera');
            return await Camera.requestCameraPermissionsAsync();
        } catch (err) {
            console.error("Error requesting camera permission:", err);
            return { status: 'denied' };
        }
    }

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPicture) {
            try {
                setIsTakingPicture(true);
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1.0,
                    base64: false,
                });

                await savePhotoToStorage(photo);
                console.log('Photo taken and saved to AsyncStorage');

            } catch (error) {
                console.error('Error taking picture:', error);
            } finally {
                setIsTakingPicture(false);
            }
        }
    };

    const savePhotoToStorage = async (photo) => {
        try {
            const photoKey = `photo_${new Date().getTime()}`;

            const photoData = {
                uri: photo.uri,
                width: photo.width,
                height: photo.height,
                timestamp: new Date().toISOString()
            };

            await AsyncStorage.setItem(photoKey, JSON.stringify(photoData));

            const savedPhotoKeys = await AsyncStorage.getItem('savedPhotoKeys');
            const photoKeys = savedPhotoKeys ? JSON.parse(savedPhotoKeys) : [];
            photoKeys.push(photoKey);
            await AsyncStorage.setItem('savedPhotoKeys', JSON.stringify(photoKeys));
        } catch (error) {
            console.error('Error saving photo to AsyncStorage:', error);
            throw error;
        }
    };

    // Function to increase zoom (with upper limit of 1)
    const zoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 1));
    };

    // Function to decrease zoom (with lower limit of 0)
    const zoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0));
    };

    if (hasPermission === null && isFocused) { // Toon dit alleen als het scherm in focus is
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

    // Render de CameraView alleen als het scherm in focus is en permissie is verleend
    return (
        <View style={styles.container}>
            {isFocused && hasPermission ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    type={type}
                    zoom={zoom}
                />
            ) : (
                // Optioneel: Toon een placeholder of lege View wanneer de camera niet actief is
                <View style={styles.cameraPlaceholder} />
            )}
            <View style={styles.zoomControlsContainer}>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={zoomOut}
                    disabled={zoom <= 0 || !isFocused}
                >
                    <Ionicons
                        name="remove"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
                <Text style={styles.zoomText}>{Math.round(zoom * 10)}x</Text>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={zoomIn}
                    disabled={zoom >= 1 || !isFocused}
                >
                    <Ionicons
                        name="add"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.shutterButton}
                    onPress={takePicture}
                    disabled={isTakingPicture || !isFocused}
                >
                    <Ionicons
                        name="camera"
                        size={36}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
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
    cameraPlaceholder: { // Voeg een placeholder stijl toe
        flex: 1,
        backgroundColor: 'black',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#0297b7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    zoomControlsContainer: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 10,
        flexDirection: 'column',
        alignItems: 'center',
    },
    zoomButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    zoomText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
    },
});