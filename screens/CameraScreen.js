import React, { useState, useEffect, useRef } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'; // Alert toegevoegd
import { CameraView } from 'expo-camera';
// AsyncStorage is niet meer nodig in CameraScreen voor directe opslag van foto's
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';
import { useLocationSetting } from '../LocationSettingContext';

export default function CameraScreen({ navigation }) {
    const [type] = useState('back');
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);
    const [isTakingPicture, setIsTakingPicture] = useState(false);
    const [zoom, setZoom] = useState(0);

    const isFocused = useIsFocused();
    const { darkMode } = useLocationSetting();

    useEffect(() => {
        (async () => {
            if (isFocused) {
                const { status } = await requestCameraPermission();
                setHasPermission(status === 'granted');
            } else {
                setHasPermission(null);
            }
        })();
    }, [isFocused]);

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

                // In plaats van opslaan, navigeer naar GalleryScreen met de foto URI
                navigation.navigate('Galerij', { newPhotoUriForFish: photo.uri }); // Let op: 'Galerij' moet de naam van je GalleryScreen in de navigator zijn.
                console.log('Photo taken, navigating to GalleryScreen for fish data entry.');

            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Fout', 'Kon geen foto maken. Probeer opnieuw.');
            } finally {
                setIsTakingPicture(false);
            }
        }
    };

    // savePhotoToStorage is niet meer nodig in CameraScreen
    // const savePhotoToStorage = async (photo) => { ... };

    const zoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 1));
    };

    const zoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0));
    };

    if (hasPermission === null && isFocused) {
        return <View style={styles.container}><Text>Permissie voor camera aanvragen...</Text></View>;
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We hebben je permissie nodig om de camera te tonen.</Text>
                <Button
                    onPress={async () => {
                        const { status } = await requestCameraPermission();
                        setHasPermission(status === 'granted');
                    }}
                    title="Geef Permissie"
                />
            </View>
        );
    }

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
                    style={[
                        styles.shutterButton,
                        darkMode && styles.shutterButtonDark
                    ]}
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
    cameraPlaceholder: {
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
    shutterButtonDark: {
        backgroundColor: '#00505e',
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