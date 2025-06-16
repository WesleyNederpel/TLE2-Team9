import React, {useState, useEffect, useRef} from 'react';
import { Button, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen({ navigation }) {
    // Set camera type to 'back' and don't provide a way to change it
    const [type] = useState('back');
    const [hasPermission, setHasPermission] = useState(null);
    const [zoom, setZoom] = useState(Platform.OS === 'ios' ? 1.0 : 0);
    const cameraRef = useRef(null)
    const [isTakingPicture, setIsTakingPicture] = useState(false)

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

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPicture) {
            try {
                setIsTakingPicture(true);
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1.0,
                    base64: true,
                });

                // Save photo to AsyncStorage
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
            // Create a unique key for the photo based on timestamp
            const photoKey = `photo_${new Date().getTime()}`;

            // Save the photo URI and data to AsyncStorage
            const photoData = {
                uri: photo.uri,
                base64: photo.base64,
                width: photo.width,
                height: photo.height,
                timestamp: new Date().toISOString()
            };

            // Save the photo data as a JSON string
            await AsyncStorage.setItem(photoKey, JSON.stringify(photoData));

            // Optionally, save a list of all photo keys for easier access later
            const savedPhotoKeys = await AsyncStorage.getItem('savedPhotoKeys');
            const photoKeys = savedPhotoKeys ? JSON.parse(savedPhotoKeys) : [];
            photoKeys.push(photoKey);
            await AsyncStorage.setItem('savedPhotoKeys', JSON.stringify(photoKeys));
        } catch (error) {
            console.error('Error saving photo to AsyncStorage:', error);
            throw error;
        }
    };

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
                ref={cameraRef}
                style={styles.camera}
                type={type}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.shutterButton}
                    onPress={takePicture}
                    disabled={isTakingPicture}
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
});