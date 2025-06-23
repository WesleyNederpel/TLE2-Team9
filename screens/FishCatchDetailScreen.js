import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Nog steeds nodig

const { width } = Dimensions.get('window');

const FishCatchDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { fishCatch } = route.params;

    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesForViewer, setImagesForViewer] = useState([]);
    const [spotName, setSpotName] = useState('Onbekende locatie'); // State voor spotnaam

    useEffect(() => {
        const fetchSpotDetails = async () => {
            if (fishCatch.location) {
                try {
                    // JOUW VOORGESTELDE LOGICA HIER:
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

                    // Zoek de juiste spot op basis van de fishCatch.location ID
                    const foundSpot = loadedMarkers.find(marker => marker.id === fishCatch.location);

                    if (foundSpot) {
                        setSpotName(foundSpot.title || 'Onbekende locatie');
                        console.log("Spot gevonden:", foundSpot.title); // DEBUG LOG
                    } else {
                        setSpotName('Locatie niet gevonden in spots'); // Specifieker bericht
                        console.log("Spot niet gevonden voor ID:", fishCatch.location); // DEBUG LOG
                    }
                } catch (error) {
                    console.error("Fout bij het ophalen van spotnaam voor visvangst:", error);
                    setSpotName('Fout bij laden locatie');
                }
            } else {
                setSpotName('Geen locatie gekoppeld'); // Als fishCatch.location leeg is
            }
        };
        fetchSpotDetails();
    }, [fishCatch.location]); // Draai dit effect opnieuw als de locatie-ID verandert

    if (!fishCatch) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Visvangst details niet gevonden.</Text>
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
        <TouchableOpacity onPress={() => openImageViewer(fishCatch.imageUris, index)}>
            <Image source={{ uri }} style={styles.fullImage} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#004a99" />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>{fishCatch.title}</Text>
                {fishCatch.species && <Text style={styles.species}>{fishCatch.species}</Text>}
            </View>

            <View style={styles.detailsSection}>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Datum:</Text>{' '}
                    {new Date(fishCatch.timestamp).toLocaleDateString()}
                </Text>
                {/* Toon de spotnaam */}
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Spot:</Text>{' '}
                    {spotName}
                </Text>
                {fishCatch.length && (
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Lengte:</Text> {fishCatch.length} cm
                    </Text>
                )}
                {fishCatch.weight && (
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Gewicht:</Text> {fishCatch.weight} kg
                    </Text>
                )}
                {fishCatch.description && (
                    <Text style={styles.descriptionText}>
                        <Text style={styles.detailLabel}>Notities:</Text> {fishCatch.description}
                    </Text>
                )}
            </View>

            <View style={styles.imagesSection}>
                <Text style={styles.sectionHeader}>Foto's</Text>
                {fishCatch.imageUris && fishCatch.imageUris.length > 0 ? (
                    <FlatList
                        data={fishCatch.imageUris}
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

            <Modal visible={isImageViewerVisible} transparent={true}>
                <ImageViewer
                    imageUrls={imagesForViewer}
                    index={currentImageIndex}
                    onCancel={() => setIsImageViewerVisible(false)}
                    enableSwipeDown={true}
                    saveToLocalByLongPress={false}
                    renderHeader={() => (
                        <View style={styles.imageViewerHeader}>
                            <TouchableOpacity onPress={() => setIsImageViewerVisible(false)} style={styles.imageViewerCloseButton}>
                                <Ionicons name="close-circle" size={35} color="white" />
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
    },
    header: {
        backgroundColor: '#e6f2ff',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
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
        color: '#004a99',
        textAlign: 'center',
    },
    fullImage: {
        width: '100%',
        height: width * 0.6,
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
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        zIndex: 1,
    },
    imageViewerCloseButton: {
        padding: 5,
    },
});

export default FishCatchDetailScreen;