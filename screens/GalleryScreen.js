import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, Alert, Modal, StatusBar, SafeAreaView, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useLocationSetting } from '../LocationSettingContext';

const { width, height } = Dimensions.get('window');
const itemWidth = width / 2 - 15; // Zorgt voor twee kolommen met wat marge

export default function GalleryScreen({ navigation, route }) {
    const [photos, setPhotos] = useState([]); // Deze kan je eventueel later helemaal verwijderen als je geen losse foto's meer opslaat
    const [fishCatches, setFishCatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [addFishModalVisible, setAddFishModalVisible] = useState(false);
    const [fishInfo, setFishInfo] = useState({
        title: '',
        description: '',
        location: '',
        species: '',
        length: '',
        weight: '',
        imageUris: []
    });
    const [markers, setMarkers] = useState([]);
    const [spotPickerModalVisible, setSpotPickerModalVisible] = useState(false);
    // Add a new state to track which "mode" the modal is in
    const [modalMode, setModalMode] = useState('fish'); // 'fish' or 'spotPicker'

    const { darkMode } = useLocationSetting();

    // useCallback voor loadPhotos en loadFishCatches om stabiele referenties te garanderen
    const loadPhotos = useCallback(async () => {
        try {
            const savedPhotoKeys = await AsyncStorage.getItem('savedPhotoKeys');
            if (savedPhotoKeys) {
                const photoKeys = JSON.parse(savedPhotoKeys);
                const photoData = [];
                for (const key of photoKeys) {
                    const photoString = await AsyncStorage.getItem(key);
                    if (photoString) {
                        photoData.push({
                            id: key,
                            type: 'photo',
                            ...JSON.parse(photoString)
                        });
                    }
                }
                photoData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setPhotos(photoData);
            } else {
                setPhotos([]);
            }
        } catch (error) {
            console.error('Fout bij het laden van foto\'s:', error);
        }
    }, []); // Geen afhankelijkheden, laadt altijd alle foto's

    const loadFishCatches = useCallback(async () => {
        try {
            const savedFishKeys = await AsyncStorage.getItem('savedFishKeys');
            if (savedFishKeys) {
                const fishKeys = JSON.parse(savedFishKeys);
                const loadedFishData = [];
                for (const key of fishKeys) {
                    const fishString = await AsyncStorage.getItem(key);
                    if (fishString) {
                        loadedFishData.push({
                            id: key,
                            type: 'fish',
                            ...JSON.parse(fishString)
                        });
                    }
                }
                loadedFishData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setFishCatches(loadedFishData);
            } else {
                setFishCatches([]);
            }
        } catch (error) {
            console.error('Fout bij het laden van visvangsten uit AsyncStorage:', error);
            Alert.alert('Fout', 'Kon de visvangsten niet laden.');
        }
    }, []); // Geen afhankelijkheden, laadt altijd alle visvangsten

    const loadMarkers = useCallback(async () => {
        try {
            const savedMarkerKeys = await AsyncStorage.getItem('savedMarkerKeys');
            if (savedMarkerKeys) {
                const markerKeys = JSON.parse(savedMarkerKeys);
                const markerData = [];
                for (const key of markerKeys) {
                    const markerString = await AsyncStorage.getItem(key);
                    if (markerString) {
                        markerData.push(JSON.parse(markerString));
                    }
                }
                setMarkers(markerData);
            } else {
                setMarkers([]);
            }
        } catch (error) {
            console.error('Fout bij het laden van markers:', error);
        }
    }, []); // Geen afhankelijkheden, laadt altijd alle markers

    useFocusEffect(
        useCallback(() => {
            const loadAllData = async () => {
                setLoading(true);
                await loadMarkers(); // Eerst markers laden voor de picker
                await loadPhotos();
                await loadFishCatches();
                setLoading(false);
            };
            loadAllData();

            // Specifieke logica voor wanneer een nieuwe foto voor vis is meegegeven via route.params
            if (route.params?.newPhotoUriForFish) {
                setAddFishModalVisible(true);
                setFishInfo(prevInfo => ({
                    ...prevInfo,
                    imageUris: [route.params.newPhotoUriForFish]
                }));
                // Belangrijk: reset de param zodat de modal niet opnieuw opent bij elke focus
                navigation.setParams({ newPhotoUriForFish: undefined });
            }

            return () => {
                // Optionele opschoning als het scherm de focus verliest
                // Bijvoorbeeld, als je event listeners zou hebben die je wilt opruimen
            };
        }, [loadMarkers, loadPhotos, loadFishCatches, route.params?.newPhotoUriForFish]) // Afhankelijkheden van useCallback
    );

    const openAddFishModal = () => {
        // Zorg ervoor dat de locatie standaard de eerste beschikbare spot is, indien aanwezig
        const defaultLocation = markers.length > 0 ? markers[0].id : '';
        setFishInfo({
            title: '',
            description: '',
            location: defaultLocation, // Stel de standaardlocatie in
            species: '',
            length: '',
            weight: '',
            imageUris: [],
        });
        setAddFishModalVisible(true);
    };

    const closeAddFishModal = () => {
        setAddFishModalVisible(false);
        setFishInfo({ // Reset fishInfo bij sluiten
            title: '',
            description: '',
            location: '',
            species: '',
            length: '',
            weight: '',
            imageUris: []
        });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImageUris = result.assets.map(asset => asset.uri);
            setFishInfo((prevFishInfo) => ({
                ...prevFishInfo,
                imageUris: [...prevFishInfo.imageUris, ...newImageUris],
            }));
        }
    };

    const addFish = async () => {
        if (fishInfo.title && fishInfo.description && fishInfo.species) {
            const newFishEntry = {
                ...fishInfo,
                id: `fish_${Date.now()}`,
                timestamp: new Date().toISOString(),
            };

            try {
                await AsyncStorage.setItem(newFishEntry.id, JSON.stringify(newFishEntry));

                const savedFishKeys = await AsyncStorage.getItem('savedFishKeys');
                let fishKeys = savedFishKeys ? JSON.parse(savedFishKeys) : [];
                fishKeys.push(newFishEntry.id);
                await AsyncStorage.setItem('savedFishKeys', JSON.stringify(fishKeys));

                // Na het toevoegen, opnieuw laden van alle visvangsten om de lijst te verversen
                await loadFishCatches(); // Dit zorgt ervoor dat de state 'fishCatches' wordt bijgewerkt
                // en de FlatList een herrender trigger.

                closeAddFishModal();
                Alert.alert('Vis toegevoegd', 'De visvangst is succesvol opgeslagen en toegevoegd aan de galerij!');
            } catch (error) {
                console.error('Fout bij het toevoegen van vis:', error);
                Alert.alert('Fout', 'Er is een fout opgetreden bij het opslaan van de visvangst.');
            }
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul alle verplichte velden (Titel, Beschrijving, Soort) in voor de vis.');
        }
    };

    // Combineer photos en fishCatches en sorteer ze hier
    const combinedData = [...photos, ...fishCatches].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Functie om de naam van de geselecteerde spot te krijgen
    const getSelectedSpotName = () => {
        const selectedSpot = markers.find(m => m.id === fishInfo.location);
        return selectedSpot ? selectedSpot.title : 'Kies een Spot Locatie';
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, darkMode && styles.loadingContainerDark]}>
                <ActivityIndicator size="large" color="#005f99" />
                <Text style={[styles.loadingText, darkMode && styles.textDark]}>Galerij laden...</Text>
            </View>
        );
    }

    const renderGalleryItem = ({ item }) => {
        if (item.type === 'photo') {
            // Dit is een standalone foto
            return (
                <View style={[styles.photoContainer, darkMode && styles.photoContainerDark]}>
                    <Image source={{ uri: item.uri }} style={styles.photo} />
                    <View style={styles.photoInfoContainer}>
                        <Text style={[styles.timestamp, darkMode && styles.textDark]}>
                            {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            );
        } else if (item.type === 'fish') {
            // Dit is een visvangst
            const firstImageUri = item.imageUris && item.imageUris.length > 0 ? item.imageUris[0] : null;
            const markerLocation = markers.find(m => m.id === item.location);
            const locationName = markerLocation ? markerLocation.title : 'Onbekende locatie';

            return (
                <TouchableOpacity
                    style={[styles.fishCatchContainer, darkMode && styles.fishCatchContainerDark]}
                    onPress={() => navigation.navigate('FishCatchDetail', { fishCatch: item })}
                >
                    {firstImageUri ? (
                        <Image source={{ uri: firstImageUri }} style={styles.fishCatchImage} />
                    ) : (
                        <View style={styles.fishCatchPlaceholder}>
                            <Ionicons name="fish-outline" size={50} color="#0096b2" />
                            <Text style={[styles.fishCatchNoImageText, darkMode && styles.textDark]}>Geen foto</Text>
                        </View>
                    )}
                    <View style={styles.fishCatchInfo}>
                        <Text style={[styles.fishCatchTitle, darkMode && styles.textDark]}>{item.title}</Text>
                        <Text style={[styles.fishCatchDate, darkMode && styles.textDark]}>
                            {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                        <Text style={[
                            styles.fishCatchLocation,
                            darkMode && styles.fishCatchLocationDark
                        ]}>
                            {locationName}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View style={[styles.container, darkMode && styles.containerDark]}>
            <FlatList
                data={combinedData}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={renderGalleryItem}
                contentContainerStyle={styles.photoGrid}
                ListEmptyComponent={() => (
                    <View style={[styles.emptyContainer, darkMode && styles.containerDark]}>
                        <Ionicons name="images-outline" size={64} color="#0096b2" />
                        <Text style={[styles.emptyMessage, darkMode && styles.textDark]}>Geen foto's of visvangsten gevonden</Text>
                        <Text style={[styles.emptySubMessage, darkMode && styles.textDark]}>Voeg een foto of visvangst toe om te beginnen!</Text>
                        <TouchableOpacity style={[styles.addFishButtonLarge, darkMode && styles.addFishButtonLargeDark]} onPress={openAddFishModal}>
                            <Ionicons name="add" size={30} color="white" />
                            <Text style={styles.addFishButtonLargeText}>Voeg Vis Toe</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity style={[styles.addFishButton, darkMode && styles.addFishButtonDark]} onPress={openAddFishModal}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Modal voor Vis Toevoegen - (deze blijft zoals die was) */}
            {/* In your render: */}
            <Modal visible={addFishModalVisible} transparent animationType="slide" onRequestClose={closeAddFishModal}>
                <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
                    {modalMode === 'fish' ? (
                        <ScrollView contentContainerStyle={[styles.scrollModalContent, darkMode && styles.scrollModalContentDark]}>
                            <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Vis Informatie Invoeren</Text>
                            <TextInput
                                style={[styles.input, darkMode && styles.inputDark]}
                                placeholder="Titel"
                                value={fishInfo.title}
                                onChangeText={(text) => setFishInfo({ ...fishInfo, title: text })}
                                placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            />
                            <TextInput
                                style={[styles.input, darkMode && styles.inputDark]}
                                placeholder="Beschrijving"
                                value={fishInfo.description}
                                onChangeText={(text) => setFishInfo({ ...fishInfo, description: text })}
                                placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                                multiline
                            />

                            <TouchableOpacity style={[styles.button, styles.imagePickerButton]} onPress={pickImage}>
                                <Ionicons name="images-outline" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.buttonText}>Kies Foto's (Telefoon Galerij)</Text>
                            </TouchableOpacity>

                            {fishInfo.imageUris.length > 0 && (
                                <ScrollView horizontal style={styles.imagePreviewScrollView} showsHorizontalScrollIndicator={false}>
                                    {fishInfo.imageUris.map((uri, index) => (
                                        <Image key={index} source={{ uri }} style={styles.fishImagePreview} />
                                    ))}
                                </ScrollView>
                            )}

                            <TextInput
                                style={[styles.input, darkMode && styles.inputDark]}
                                placeholder="Soort"
                                value={fishInfo.species}
                                onChangeText={(text) => setFishInfo({ ...fishInfo, species: text })}
                                placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            />
                            <TextInput
                                style={[styles.input, darkMode && styles.inputDark]}
                                placeholder="Lengte (cm)"
                                keyboardType="numeric"
                                value={fishInfo.length}
                                onChangeText={(text) => setFishInfo({ ...fishInfo, length: text })}
                                placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            />
                            <TextInput
                                style={[styles.input, darkMode && styles.inputDark]}
                                placeholder="Gewicht (kg)"
                                keyboardType="numeric"
                                value={fishInfo.weight}
                                onChangeText={(text) => setFishInfo({ ...fishInfo, weight: text })}
                                placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            />

                            <TouchableOpacity
                                style={[styles.pickerDisplayButton, darkMode && styles.inputDark]}
                                onPress={() => setModalMode('spotPicker')}
                            >
                                <Text style={[styles.pickerDisplayText, darkMode && { color: '#fff' }]}>{getSelectedSpotName()}</Text>
                                <Ionicons name="caret-down-outline" size={20} color={darkMode ? "#0096b2" : "#666"} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={addFish}>
                                <Text style={styles.buttonText}>Vis Toevoegen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#FF6347', marginTop: 10 }]}
                                onPress={closeAddFishModal}
                            >
                                <Text style={styles.buttonText}>Annuleren</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={[styles.spotPickerModalContent, darkMode && styles.spotPickerModalContentDark]}>
                            {/* Spot picker content */}
                            <Text style={[styles.spotPickerModalTitle, darkMode && styles.spotPickerModalTitleDark]}>Kies een Spot Locatie</Text>
                            <FlatList
                                data={markers}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.spotPickerItem, darkMode && styles.spotPickerItemDark]}
                                        onPress={() => {
                                            setFishInfo({ ...fishInfo, location: item.id });
                                            setModalMode('fish'); // Switch back to fish mode
                                        }}
                                    >
                                        <Text style={[styles.spotPickerItemText, darkMode && styles.spotPickerItemTextDark]}>{item.title}</Text>
                                        {fishInfo.location === item.id && (
                                            <Ionicons name="checkmark" size={20} color="#0096b2" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <Text style={[styles.noSpotsText, darkMode && styles.noSpotsTextDark]}>Geen spots beschikbaar. Maak eerst een spot aan op de kaart.</Text>
                                )}
                            />
                            <TouchableOpacity style={[styles.spotPickerCloseButton, darkMode && styles.spotPickerCloseButtonDark]} onPress={() => setModalMode('fish')}>
                                <Text style={[styles.spotPickerCloseButtonText, darkMode && styles.spotPickerCloseButtonTextDark]}>Sluiten</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
            {/* NIEUW: Modal voor het selecteren van een Spot Locatie */}
            <Modal
                visible={spotPickerModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSpotPickerModalVisible(false)}
            >
                <TouchableOpacity
                    style={[styles.spotPickerModalOverlay, darkMode && styles.modalOverlayDark]}
                    activeOpacity={1}
                    onPress={() => setSpotPickerModalVisible(false)}
                >
                    <View style={[
                        styles.spotPickerModalContent,
                        darkMode && styles.spotPickerModalContentDark
                    ]}>
                        <Text style={[
                            styles.spotPickerModalTitle,
                            darkMode && styles.spotPickerModalTitleDark
                        ]}>
                            Kies een Spot Locatie
                        </Text>
                        <FlatList
                            data={markers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.spotPickerItem,
                                        darkMode && styles.spotPickerItemDark
                                    ]}
                                    onPress={() => {
                                        setFishInfo({ ...fishInfo, location: item.id });
                                        setSpotPickerModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.spotPickerItemText,
                                        darkMode && styles.spotPickerItemTextDark
                                    ]}>
                                        {item.title}
                                    </Text>
                                    {fishInfo.location === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#0096b2" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={[
                                    styles.noSpotsText,
                                    darkMode && styles.noSpotsTextDark
                                ]}>
                                    Geen spots beschikbaar. Maak eerst een spot aan op de kaart.
                                </Text>
                            )}
                        />
                        <TouchableOpacity
                            style={[
                                styles.spotPickerCloseButton,
                                darkMode && styles.spotPickerCloseButtonDark
                            ]}
                            onPress={() => setSpotPickerModalVisible(false)}
                        >
                            <Text style={[
                                styles.spotPickerCloseButtonText,
                                darkMode && styles.spotPickerCloseButtonTextDark
                            ]}>
                                Sluiten
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    loadingContainerDark: {
        backgroundColor: '#181818',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#005f99',
    },
    textDark: {
        color: '#eee',
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
        textAlign: 'center',
    },
    addFishButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0096b2',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        marginTop: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addFishButtonLargeDark: {
        backgroundColor: '#00505e',
    },
    addFishButtonLargeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
    },
    photoGrid: {
        padding: 5,
        paddingBottom: 80,
    },
    photoContainer: {
        margin: 5,
        width: itemWidth,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    photoContainerDark: {
        backgroundColor: '#232323',
    },
    photo: {
        width: '100%',
        height: itemWidth,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        resizeMode: 'cover',
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

    fishCatchContainer: {
        margin: 5,
        width: itemWidth,
        backgroundColor: '#e0f2f7',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        paddingBottom: 8,
    },
    fishCatchContainerDark: {
        backgroundColor: '#232323',
    },
    fishCatchImage: {
        width: '100%',
        height: itemWidth * 0.7,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        resizeMode: 'cover',
    },
    fishCatchPlaceholder: {
        width: '100%',
        height: itemWidth * 0.7,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#ccecf2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fishCatchNoImageText: {
        color: '#666',
        fontSize: 12,
        marginTop: 5,
    },
    fishCatchInfo: {
        padding: 8,
        alignItems: 'center',
        width: '100%',
    },
    fishCatchTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        color: '#005f99',
    },
    fishCatchDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    fishCatchLocation: {
        fontSize: 12,
        color: '#333',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    fishCatchLocationDark: {
        color: '#0096b2',
    },


    // Stijlen voor de "Vis Toevoegen" modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalOverlayDark: {
        backgroundColor: 'rgba(10,20,30,0.85)',
    },
    scrollModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: 'center',
        marginTop: '15%',
    },
    scrollModalContentDark: {
        backgroundColor: '#232323',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#004a99',
    },
    modalTitleDark: {
        color: '#0096b2',
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 5,
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#232323',
        color: '#fff',
        borderBottomColor: '#0096b2',
    },
    button: {
        backgroundColor: '#0096b2',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    imagePickerButton: {
        backgroundColor: '#1E90FF',
        marginBottom: 10,
    },
    imagePreviewScrollView: {
        width: '100%',
        marginBottom: 15,
        paddingVertical: 5,
    },
    fishImagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pickerContainer: {
        width: '100%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    pickerItem: {
        fontSize: 16,
        color: '#333',
    },
    addFishButton: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        backgroundColor: '#0096b2',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addFishButtonDark: {
        backgroundColor: '#00505e',
    },
    pickerDisplayButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    spotPickerModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    spotPickerModalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%',
        padding: 15,
        alignItems: 'center',
    },
    spotPickerModalContentDark: {
        backgroundColor: '#232323',
    },
    spotPickerModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#004a99',
    },
    spotPickerModalTitleDark: {
        color: '#fff',
    },
    spotPickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    spotPickerItemDark: {
        borderBottomColor: '#333',
    },
    spotPickerItemText: {
        fontSize: 16,
        color: '#333',
    },
    spotPickerItemTextDark: {
        color: '#fff',
    },
    noSpotsText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 20,
    },
    noSpotsTextDark: {
        color: '#fff',
    },
    spotPickerCloseButton: {
        marginTop: 20,
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    spotPickerCloseButtonDark: {
        backgroundColor: '#00505e',
    },
    spotPickerCloseButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    spotPickerCloseButtonTextDark: {
        color: '#fff',
    },
});