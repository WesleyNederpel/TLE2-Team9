import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, Alert, Modal, StatusBar, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function GalleryScreen() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Load photos initially
    useEffect(() => {
        loadPhotos();
    }, []);

    // Reload photos whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadPhotos();
            return () => {}; // cleanup function
        }, [])
    );

    const loadPhotos = async () => {
        try {
            setLoading(true);
            // Get the list of photo keys
            const savedPhotoKeys = await AsyncStorage.getItem('savedPhotoKeys');

            if (savedPhotoKeys) {
                const photoKeys = JSON.parse(savedPhotoKeys);
                const photoData = [];

                // Load each photo
                for (const key of photoKeys) {
                    const photoString = await AsyncStorage.getItem(key);
                    if (photoString) {
                        photoData.push({
                            id: key,
                            ...JSON.parse(photoString)
                        });
                    }
                }

                // Sort by timestamp (newest first)
                photoData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setPhotos(photoData);
            } else {
                setPhotos([]);
            }
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePhoto = async (id) => {
        try {
            // Remove the photo from AsyncStorage
            await AsyncStorage.removeItem(id);

            // Update the saved keys list
            const savedPhotoKeys = await AsyncStorage.getItem('savedPhotoKeys');
            if (savedPhotoKeys) {
                const photoKeys = JSON.parse(savedPhotoKeys);
                const updatedKeys = photoKeys.filter(key => key !== id);
                await AsyncStorage.setItem('savedPhotoKeys', JSON.stringify(updatedKeys));
            }

            // Update state to remove the photo from the list
            setPhotos(photos.filter(photo => photo.id !== id));
        } catch (error) {
            console.error('Error deleting photo:', error);
            Alert.alert('Error', 'Failed to delete photo');
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(id) }
            ]
        );
    };

    const openPhotoModal = (photo) => {
        setSelectedPhoto(photo);
        setModalVisible(true);
    };

    const closePhotoModal = () => {
        setModalVisible(false);
        setSelectedPhoto(null);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Loading photos...</Text>
            </View>
        );
    }

    if (photos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={64} color="#0096b2" />
                <Text style={styles.emptyMessage}>No photos found</Text>
                <Text style={styles.emptySubMessage}>Photos you take will appear here</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={photos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                    <View style={styles.photoContainer}>
                        <TouchableOpacity onPress={() => openPhotoModal(item)}>
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <View style={styles.photoInfoContainer}>
                            <Text style={styles.timestamp}>
                                {new Date(item.timestamp).toLocaleDateString()}
                            </Text>
                            <TouchableOpacity
                                onPress={() => confirmDelete(item.id)}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.photoGrid}
            />

            {/* Photo Viewing Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closePhotoModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={closePhotoModal}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalDate}>
                            {selectedPhoto && new Date(selectedPhoto.timestamp).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.modalImageContainer}>
                        {selectedPhoto && (
                            <Image
                                source={{ uri: selectedPhoto.uri }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const { width, height } = Dimensions.get('window');
const photoWidth = width / 2 - 15;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    emptyMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#333',
    },
    emptySubMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
        color: '#666',
    },
    photoGrid: {
        padding: 5,
    },
    photoContainer: {
        margin: 5,
        width: photoWidth,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    photo: {
        width: photoWidth,
        height: photoWidth,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    photoInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    deleteButton: {
        padding: 4,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    closeButton: {
        padding: 5,
    },
    modalDate: {
        color: '#fff',
        fontSize: 16,
    },
    modalImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: width,
        height: height * 0.7,
    },
});