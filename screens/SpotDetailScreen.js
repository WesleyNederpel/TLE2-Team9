import React, { useState } from 'react';
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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Nodig om spotnaam op te halen

// Schermafmetingen voor de ImageViewer
const { width, height } = Dimensions.get('window');

const SpotDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { spot } = route.params;

    // NIEUW: State voor de lightbox (image viewer)
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesForViewer, setImagesForViewer] = useState([]);

    if (!spot) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Spot niet gevonden.</Text>
            </View>
        );
    }

    const openGoogleMaps = () => {
        if (typeof spot.latitude === 'number' && typeof spot.longitude === 'number') {
            const googleMapsUrl = `http://maps.google.com/maps?q=${spot.latitude},${spot.longitude}`;
            Linking.openURL(googleMapsUrl).catch(err =>
                console.error('An error occurred opening Google Maps', err)
            );
        } else {
            console.warn('Invalid coordinates for Google Maps:', spot.latitude, spot.longitude);
            alert('Locatiecoördinaten zijn ongeldig.');
        }
    };

    // Functie om de lightbox te openen
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
                {/* NIEUW: Knop naar FishCatchDetailScreen */}
                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('FishCatchDetail', { fishCatch: fish })}
                >
                    <Text style={styles.viewDetailsButtonText}>Bekijk Details</Text>
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#004a99" />
            </TouchableOpacity>

            {spot.latitude && spot.longitude ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: spot.latitude,
                        longitude: spot.longitude,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                >
                    <Marker
                        coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                        title={spot.title}
                        description={spot.description}
                    />
                </MapView>
            ) : (
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>Kaart niet beschikbaar (geen coördinaten)</Text>
                </View>
            )}

            <View style={styles.contentSection}>
                <View style={styles.infoSection}>
                    <Text style={styles.spotDetailTitle}>{spot.title}</Text>
                    {spot.description && <Text style={styles.spotDetailDescription}>{spot.description}</Text>}

                    {spot.latitude && spot.longitude && (
                        <Text style={styles.spotDetailCoordinates}>
                            Coördinaten: {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.googleMapsButton} onPress={openGoogleMaps}>
                        <Ionicons name="navigate-outline" size={20} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.googleMapsButtonText}>Open in Google Maps</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.fishCatchesSection}>
                    <Text style={styles.sectionHeader}>Gevangen Vissen</Text>
                    {spot.fishCatches && spot.fishCatches.length > 0 ? (
                        <FlatList
                            data={spot.fishCatches}
                            keyExtractor={(fish) => fish.id.toString()}
                            renderItem={renderFishItem}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.emptyFishMessage}>Nog geen vissen gevangen op deze spot.</Text>
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
    fishItemHeader: { // NIEUW: Voor titel en knop op één lijn
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    fishTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005f99',
        flexShrink: 1, // Zorg dat de titel kan krimpen als de knop veel ruimte inneemt
        marginRight: 10,
    },
    viewDetailsButton: { // NIEUW: Stijl voor de knop
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    viewDetailsButtonText: { // NIEUW: Stijl voor de tekst op de knop
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