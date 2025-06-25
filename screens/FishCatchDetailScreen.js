import React, { useState, useEffect, useCallback } from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    FlatList,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocationSetting } from '../LocationSettingContext';

const { width } = Dimensions.get('window');

const FishCatchDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const initialCatch = route.params.fishCatch;
    const { darkMode } = useLocationSetting();

    const [updatedCatch, setUpdatedCatch] = useState(initialCatch);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesForViewer, setImagesForViewer] = useState([]);
    const [spotName, setSpotName] = useState('Onbekende locatie');

    useFocusEffect(
        useCallback(() => {
            const fetchLatestCatch = async () => {
                try {
                    const stored = await AsyncStorage.getItem(initialCatch.id);
                    if (stored) {
                        setUpdatedCatch(JSON.parse(stored));
                    }
                } catch (e) {
                    console.error("Fout bij herladen van visvangst:", e);
                }
            };

            fetchLatestCatch();
        }, [initialCatch.id])
    );

    useEffect(() => {
        const fetchSpotDetails = async () => {
            if (updatedCatch.location) {
                try {
                    const savedMarkerKeys = await AsyncStorage.getItem('savedMarkerKeys');
                    let loadedMarkers = [];
                    if (savedMarkerKeys) {
                        const markerKeys = JSON.parse(savedMarkerKeys);
                        for (const key of markerKeys) {
                            const markerString = await AsyncStorage.getItem(key);
                            if (markerString) {
                                loadedMarkers.push(JSON.parse(markerString));
                            }
                        }
                    }

                    const foundSpot = loadedMarkers.find(marker => marker.id === updatedCatch.location);

                    if (foundSpot) {
                        setSpotName(foundSpot.title || 'Onbekende locatie');
                    } else {
                        setSpotName('Locatie niet gevonden in spots');
                    }
                } catch (error) {
                    console.error("Fout bij het ophalen van spotnaam:", error);
                    setSpotName('Fout bij laden locatie');
                }
            } else {
                setSpotName('Geen locatie gekoppeld');
            }
        };
        fetchSpotDetails();
    }, [updatedCatch.location]);

    const handleDeleteFishCatch = async () => {
        Alert.alert(
            "Visvangst verwijderen",
            "Weet je zeker dat je deze visvangst wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
            [
                {
                    text: "Annuleren",
                    style: "cancel"
                },
                {
                    text: "Verwijderen",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(updatedCatch.id);
                            const savedFishKeysString = await AsyncStorage.getItem('savedFishKeys');
                            let savedFishKeys = savedFishKeysString ? JSON.parse(savedFishKeysString) : [];
                            const updatedFishKeys = savedFishKeys.filter(
                                (key) => key !== updatedCatch.id
                            );
                            await AsyncStorage.setItem('savedFishKeys', JSON.stringify(updatedFishKeys));
                            Alert.alert('Succes', 'Visvangst succesvol verwijderd!');
                            navigation.goBack();
                        } catch (error) {
                            console.error("Fout bij het verwijderen van de visvangst:", error);
                            Alert.alert("Fout", "Kon de visvangst niet verwijderen. Probeer het opnieuw.");
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    const handleEditFishCatch = () => {
        navigation.navigate('EditFishCatch', { fishCatch: updatedCatch });
    };

    if (!updatedCatch) {
        return (
            <View style={[styles.container, darkMode && styles.containerDark]}>
                <Text style={[styles.errorText, darkMode && styles.textLight]}>Visvangst details niet gevonden.</Text>
            </View>
        );
    }

    const openImageViewer = (uris, index) => {
        const formattedImages = uris.map(uri => ({ url: uri }));
        setImagesForViewer(formattedImages);
        setCurrentImageIndex(index);
        setIsImageViewerVisible(true);
    };

    const renderFishItem = ({ item: uri, index }) => (
        <TouchableOpacity onPress={() => openImageViewer(updatedCatch.imageUris, index)}>
            <Image source={{ uri }} style={styles.fullImage} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
            <View style={styles.topButtonsContainer}>
                {/*<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>*/}
                {/*    <Ionicons name="arrow-back" size={28} color="#004a99" />*/}
                {/*</TouchableOpacity>*/}
                <View style={styles.rightButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditFishCatch}>
                        <Ionicons name="pencil-outline" size={28} color="#004a99" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFishCatch}>
                        <Ionicons name="trash-outline" size={28} color="#dc3545" />
                    </TouchableOpacity>
                </View>
            </View>

            {/*<View style={styles.header}>*/}
            {/*    <Text style={styles.title}>{updatedCatch.title}</Text>*/}
            {/*    {updatedCatch.species && <Text style={styles.species}>{updatedCatch.species}</Text>}*/}
            {/*</View>*/}

            <View style={[styles.detailsSection, darkMode && styles.detailsSectionDark]}>
                <Text style={[styles.detailText, darkMode && styles.textLight]}>
                    <Text style={[styles.detailLabel, darkMode]}>Soort:</Text>{' '}
                    {updatedCatch.species && <Text>{updatedCatch.species}</Text>}
                </Text>
                <Text style={[styles.detailText, darkMode && styles.textLight]}>
                    <Text style={styles.detailLabel}>Datum:</Text>{' '}
                    {new Date(updatedCatch.timestamp).toLocaleDateString()}
                </Text>
                <Text style={[styles.detailText, darkMode && styles.textLight]}>
                    <Text style={styles.detailLabel}>Spot:</Text>{' '}
                    {spotName}
                </Text>
                {updatedCatch.length && (
                    <Text style={[styles.detailText, darkMode && styles.textLight]}>
                        <Text style={styles.detailLabel}>Lengte:</Text> {updatedCatch.length} cm
                    </Text>
                )}
                {updatedCatch.weight && (
                    <Text style={[styles.detailText, darkMode && styles.textLight]}>
                        <Text style={styles.detailLabel}>Gewicht:</Text> {updatedCatch.weight} kg
                    </Text>
                )}
                {updatedCatch.description && (
                    <Text style={[styles.descriptionText, darkMode && styles.textLight]}>
                        <Text style={styles.detailLabel}>Beschrijving:</Text> {updatedCatch.description}
                    </Text>
                )}
            </View>

            <View style={styles.imagesSection}>
                <Text style={[styles.sectionHeader, darkMode && styles.textAccent]}>Foto's</Text>
                {updatedCatch.imageUris && updatedCatch.imageUris.length > 0 ? (
                    <FlatList
                        data={updatedCatch.imageUris}
                        keyExtractor={(uri, index) => index.toString()}
                        renderItem={renderFishItem}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="fish-outline" size={80} color="#ccc" />
                        <Text style={styles.noImagesText}>Geen foto's beschikbaar voor deze visvangst.</Text>
                    </View>
                )}
            </View>

            <Modal visible={isImageViewerVisible} transparent={true} onRequestClose={() => setIsImageViewerVisible(false)}>
                <ImageViewer
                    imageUrls={imagesForViewer}
                    index={currentImageIndex}
                    onCancel={() => setIsImageViewerVisible(false)}
                    enableSwipeDown={true}
                    saveToLocalByLongPress={false}
                    renderHeader={() => (
                        <View style={[styles.imageViewerHeader, { paddingTop: Platform.OS === 'ios' ? 50 : 0 }]}>
                            <TouchableOpacity onPress={() => setIsImageViewerVisible(false)} style={styles.imageViewerCloseButton}>
                                <Ionicons name="close-circle" size={50} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    containerDark: {
        backgroundColor: '#181818',
    },
    topButtonsContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 10,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
    },
    rightButtons: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
    },
    header: {
        backgroundColor: '#fdfdfd',
        padding: 20,
        paddingTop: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#cce0f5',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 5,
        textAlign: 'center',
    },
    species: {
        fontSize: 20,
        fontStyle: 'italic',
        color: '#005f99',
        textAlign: 'center',
    },
    detailsSection: {
        padding: 20,
        backgroundColor: 'white',
        margin: 15,
        borderRadius: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        elevation: 3,
    },
    detailsSectionDark: {
        backgroundColor: '#232323',
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#005f99',
    },
    descriptionText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    imagesSection: {
        padding: 15,
        marginTop: 10,
    },
    sectionHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#005f99',
        textAlign: 'center',
    },
    fullImage: {
        width: '100%',
        height: width * 0.9,
        borderRadius: 10,
        marginBottom: 15,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        backgroundColor: '#e0f7fa',
        height: 200,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    noImagesText: {
        color: '#888',
        fontSize: 16,
        marginTop: 10,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 18,
        color: 'red',
        marginTop: 50,
    },
    imageViewerHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 100 : 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        zIndex: 1,
    },
    imageViewerCloseButton: {
        padding: 5,
        zIndex: 3,
    },
    textLight: {
        color: '#fff',
    },
    textAccent: {
        color: '#0096b2',
    },
});

export default FishCatchDetailScreen;