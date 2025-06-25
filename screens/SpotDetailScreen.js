import React, { useState, useEffect, useCallback } from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Linking,
    FlatList,
    Modal,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SpotDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { spot } = route.params;
    const [spotDetails, setSpotDetails] = useState(spot);

    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesForViewer, setImagesForViewer] = useState([]);
    const [loadingFishCatches, setLoadingFishCatches] = useState(true);

    const loadFishCatchesForSpot = useCallback(async () => {
        setLoadingFishCatches(true);
        try {
            const savedFishKeysString = await AsyncStorage.getItem('savedFishKeys');
            const fishKeys = savedFishKeysString ? JSON.parse(savedFishKeysString) : [];
            const allFishCatches = [];

            for (const key of fishKeys) {
                const fishString = await AsyncStorage.getItem(key);
                if (fishString) {
                    allFishCatches.push(JSON.parse(fishString));
                }
            }

            const filteredFishCatches = allFishCatches.filter(
                (fish) => fish.location === spot.id
            );

            filteredFishCatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setSpotDetails(prevDetails => ({
                ...prevDetails,
                fishCatches: filteredFishCatches,
            }));

        } catch (error) {
            console.error("Fout bij het laden van visvangsten voor spot:", error);
        } finally {
            setLoadingFishCatches(false);
        }
    }, [spot.id]);

    useFocusEffect(
        useCallback(() => {
            loadFishCatchesForSpot();
            return () => { };
        }, [loadFishCatchesForSpot])
    );

    const handleDeleteSpot = async () => {
        Alert.alert(
            "Spot verwijderen",
            "Weet je zeker dat je deze spot wilt verwijderen? Vissen die aan deze spot gekoppeld zijn, blijven behouden maar hun locatie wordt ontkoppeld. Deze actie kan niet ongedaan worden gemaakt.",
            [
                {
                    text: "Annuleren",
                    style: "cancel"
                },
                {
                    text: "Verwijderen",
                    onPress: async () => {
                        try {
                            // Check eerst of de spot bestaat met de marker_ prefix
                            const markerKey = `marker_${spot.id}`;
                            const spotExists = await AsyncStorage.getItem(markerKey);

                            if (!spotExists) {
                                Alert.alert("Fout", "Spot bestaat niet in opslag");
                                return;
                            }

                            // Verwijder de spot met de juiste prefix
                            await AsyncStorage.removeItem(markerKey);
                            console.log(`Spot met ID ${markerKey} verwijderd.`);

                            // Update de lijst met marker keys (niet spots keys)
                            const savedMarkerKeysString = await AsyncStorage.getItem('savedMarkerKeys');
                            let savedMarkerKeys = savedMarkerKeysString ? JSON.parse(savedMarkerKeysString) : [];

                            // Filter de marker key eruit
                            const updatedMarkerKeys = savedMarkerKeys.filter(
                                (key) => key !== markerKey
                            );

                            // Sla de bijgewerkte lijst op
                            await AsyncStorage.setItem('savedMarkerKeys', JSON.stringify(updatedMarkerKeys));
                            console.log(`ID ${markerKey} verwijderd uit savedMarkerKeys.`);

                            Alert.alert('Succes', 'Spot succesvol verwijderd!');
                            navigation.goBack();
                        } catch (error) {
                            console.error("Fout bij het verwijderen van de spot:", error);
                            Alert.alert("Fout", "Kon de spot niet verwijderen. Probeer het opnieuw.");
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };
    if (!spotDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Spot niet gevonden.</Text>
            </View>
        );
    }

    const openGoogleMaps = () => {
        if (typeof spotDetails.latitude === 'number' && typeof spotDetails.longitude === 'number') {
            const googleMapsUrl = `http://maps.google.com/?q=${spotDetails.latitude},${spotDetails.longitude}`; // Corrected Google Maps URL
            Linking.openURL(googleMapsUrl).catch(err =>
                console.error('Er is een fout opgetreden bij het openen van Google Maps', err)
            );
        } else {
            console.warn('Ongeldige coördinaten voor Google Maps:', spotDetails.latitude, spotDetails.longitude);
            alert('Locatiecoördinaten zijn ongeldig.');
        }
    };

    const openImageViewer = (uris, index) => {
        const formattedImages = uris.map(uri => ({ url: uri }));
        setImagesForViewer(formattedImages);
        setCurrentImageIndex(index);
        setIsImageViewerVisible(true);
    };

    const renderFishItem = ({ item: fish }) => (
        <View style={styles.fishItem}>
            <View style={styles.fishItemHeader}>
                <Text style={styles.fishTitle}>{fish.title}</Text>
                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('FishCatchDetail', { fishCatch: fish })}
                >
                    <Text style={styles.viewDetailsButtonText}>Details</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.fishSpecies}>{fish.species}</Text>
            <Text style={styles.fishDate}>{new Date(fish.timestamp).toLocaleDateString()}</Text>
            {fish.length && <Text style={styles.fishInfo}>Lengte: {fish.length} cm</Text>}
            {fish.weight && <Text style={styles.fishInfo}>Gewicht: {fish.weight} kg</Text>}
            {fish.description && <Text style={styles.fishDescription}>{fish.description}</Text>}

            {fish.imageUris && fish.imageUris.length > 0 ? (
                <FlatList
                    data={fish.imageUris}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(uri, index) => `${fish.id}-${index}`}
                    renderItem={({ item: uri, index }) => (
                        <TouchableOpacity onPress={() => openImageViewer(fish.imageUris, index)}>
                            <Image source={{ uri }} style={styles.fishImage} />
                        </TouchableOpacity>
                    )}
                    style={styles.fishImagesContainer}
                />
            ) : (
                <View style={styles.fishImagePlaceholderContainer}>
                    <Ionicons name="fish-outline" size={50} color="#ccc" />
                    <Text style={styles.noImageText}>Geen foto beschikbaar</Text>
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/*<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>*/}
            {/*    <Ionicons name="arrow-back" size={28} color="#004a99" />*/}
            {/*</TouchableOpacity>*/}

            {spotDetails.latitude && spotDetails.longitude ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: spotDetails.latitude,
                        longitude: spotDetails.longitude,
                        latitudeDelta: 0.006,
                        longitudeDelta: 0.006,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                >
                    <Marker
                        coordinate={{ latitude: spotDetails.latitude, longitude: spotDetails.longitude }}
                    // title={spotDetails.title}
                    // description={spotDetails.description}
                    />
                </MapView>
            ) : (
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>Kaart niet beschikbaar (geen coördinaten)</Text>
                </View>
            )}

            <View style={styles.contentSection}>
                <View style={styles.infoSection}>
                    <Text style={styles.spotDetailTitle}>{spotDetails.title}</Text>
                    {spotDetails.description && <Text style={styles.spotDetailDescription}>{spotDetails.description}</Text>}

                    {spotDetails.latitude && spotDetails.longitude && (
                        <Text style={styles.spotDetailCoordinates}>
                            Coördinaten: {spotDetails.latitude.toFixed(6)}, {spotDetails.longitude.toFixed(6)}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.googleMapsButton} onPress={openGoogleMaps}>
                        <Ionicons name="navigate-outline" size={20} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.googleMapsButtonText}>Open in Google Maps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteSpotButton} onPress={handleDeleteSpot}>
                        <Ionicons name="trash-outline" size={20} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.deleteSpotButtonText}>Verwijder Spot</Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.fishCatchesSection}>
                    <Text style={styles.sectionHeader}>Gevangen Vissen</Text>
                    {loadingFishCatches ? (
                        <View style={styles.loadingFishCatchesContainer}>
                            <ActivityIndicator size="small" color="#005f99" />
                            <Text style={styles.loadingFishCatchesText}>Vissen laden...</Text>
                        </View>
                    ) : spotDetails.fishCatches && spotDetails.fishCatches.length > 0 ? (
                        <FlatList
                            data={spotDetails.fishCatches}
                            keyExtractor={(fish) => fish.id.toString()}
                            renderItem={renderFishItem}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={styles.emptyFishMessage}>Nog geen vissen gevangen op deze spot.</Text>
                            <Text style={styles.emptyFishMessage}>Je kan een vis toevoegen aan deze spot via de galerij.</Text>
                        </View >
                    )}
                </View>
            </View>

            <Modal visible={isImageViewerVisible} transparent={true} onRequestClose={() => setIsImageViewerVisible(false)}>
                <ImageViewer
                    imageUrls={imagesForViewer}
                    index={currentImageIndex}
                    onCancel={() => setIsImageViewerVisible(false)}
                    enableSwipeDown={true}
                    saveToLocalByLongPress={false}
                    renderHeader={() => (
                        <View style={styles.imageViewerHeader}>
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
    },
    map: {
        width: '100%',
        height: 200,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    mapPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        color: '#666',
        fontSize: 16,
        fontStyle: 'italic',
    },
    contentSection: {
        padding: 15,
    },
    infoSection: {
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    spotDetailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#004a99',
    },
    spotDetailDescription: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
        marginBottom: 10,
    },
    spotDetailCoordinates: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    googleMapsButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    googleMapsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteSpotButton: {
        backgroundColor: '#dc3545',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    deleteSpotButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fishCatchesSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#004a99',
        textAlign: 'center',
    },
    fishItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    fishItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    fishTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005f99',
        flexShrink: 1,
        marginRight: 10,
    },
    viewDetailsButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    viewDetailsButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    fishSpecies: {
        fontSize: 16,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    fishDate: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    fishInfo: {
        fontSize: 14,
        color: '#444',
        marginBottom: 3,
    },
    fishDescription: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    fishImagesContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 5,
    },
    fishImage: {
        width: 120,
        height: 90,
        borderRadius: 5,
        marginRight: 10,
        resizeMode: 'cover',
    },
    fishImagePlaceholderContainer: {
        width: 120,
        height: 90,
        backgroundColor: '#e0f7fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 5,
    },
    noImageText: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
    },
    emptyFishMessage: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#777',
        marginTop: 10,
        fontSize: 16,
    },
    loadingFishCatchesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingFishCatchesText: {
        marginLeft: 10,
        color: '#005f99',
        fontSize: 16,
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

export default SpotDetailScreen;