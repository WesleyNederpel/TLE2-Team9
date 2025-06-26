import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Modal, Image, Text, TextInput, TouchableOpacity, Alert, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, AppState } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';
import waters from "../data/waters.json";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocationSetting } from '../LocationSettingContext';

const getAfbeelding = (name) => {
    switch (name) {
        case 'Kralingse Plas':
            return require('../images/Kralingseplas.png');
        case 'Wijnhaven':
            return require('../images/Wijnhaven.png');
        case 'Bergse Voorplas':
            return require('../images/BergseVoorplas.png');
        case 'Oudehaven':
            return require('../images/Oudehaven.png');
        case 'Haringvliet':
            return require('../images/Haringvliet.png');
        case 'Boerengat':
            return require('../images/Boerengat.png');
        case 'Zevenhuizerplas':
            return require('../images/Zevenhuizerplas.png');
        case 'De Rotte':
            return require('../images/deRotte.png');
        case 'Nieuwe Maas':
            return require('../images/NieuweMaas.png');
        default:
            return null; // Geen afbeelding beschikbaar
    }
};

// Voeg een custom dark map style toe
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a2326' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2326' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#0096b2' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#222f3e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#222' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#232323' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#232323' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#232323' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#232323' }] },
];

const MapScreen = ({ navigation }) => {
    const [selectedFeature, setSelectedFeature] = useState(null);

    const [addMarkerModalVisible, setAddMarkerModalVisible] = useState(false);
    const [markerInfo, setMarkerInfo] = useState({ title: '', description: '', latitude: null, longitude: null });
    const [markers, setMarkers] = useState([]); // Array van spots (markers)
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [locationSource, SetLocationSource] = useState('current'); // 'current', 'picked', 'manual'
    const [initialLocationSet, setInitialLocationSet] = useState(false);
    const mapRef = useRef(null); // Reference to the MapView component

    const { showLocation, darkMode } = useLocationSetting();

    // Default region (Rotterdam)
    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // Laad markers bij opstarten
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
            console.error('Error loading markers from AsyncStorage:', error);
            Alert.alert('Fout', 'Kon de spots niet laden.');
        }
    }, []);

    // Center map on user location
    const centerMapOnUserLocation = useCallback(() => {
        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000); // Animation duration in ms
        }
    }, [currentLocation]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Toegang geweigerd', 'Locatietoegang is nodig om uw positie te bepalen.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location);

            // Only center map on first load, not on subsequent location updates
            if (!initialLocationSet && location && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
                setInitialLocationSet(true);
            }
        })();
        loadMarkers(); // Laad markers bij opstarten
    }, [loadMarkers, initialLocationSet]);

    const convertCoords = (coordsArray) => {
        if (!coordsArray || coordsArray.length === 0) return [];
        return coordsArray.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
    };

    const handlePolygonPress = (feature) => {
        // Vind de volledige water-data uit waters.json op basis van de naam
        const featureName = feature.properties?.name ?? '';
        const waterData = waters.find(w => (w.name ?? '').trim().toLowerCase() === featureName.trim().toLowerCase());
        setSelectedFeature({ ...feature, waterData });
        setSelectedFeature({ ...feature, waterData: waterData }); // Voeg waterData toe aan de geselecteerde feature
        if (!isPickingLocation) {
            setSelectedFeature(feature);
        }
    };

    const renderSinglePolygon = (polygonCoordsArrays, feature, keySuffix, fillColor, strokeColor) => {
        const outer = convertCoords(polygonCoordsArrays[0]);
        const holes = polygonCoordsArrays.slice(1).map(convertCoords);
        if (outer.length === 0) return null;

        return (
            <Polygon
                key={`${feature.id || feature.properties?.name || keySuffix}`}
                coordinates={outer}
                holes={holes.length > 0 ? holes : undefined}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={1}
                tappable={true}
                onPress={(event) => {
                    if (isPickingLocation) {
                        const { latitude, longitude } = event.nativeEvent.coordinate;
                        setMarkerInfo((prevInfo) => ({
                            ...prevInfo,
                            latitude: latitude,
                            longitude: longitude,
                        }));
                        SetLocationSource('picked');
                        setIsPickingLocation(false);
                        setAddMarkerModalVisible(true);
                    } else {
                        handlePolygonPress(feature);
                    }
                }}
            />
        );
    };

    const renderPolygons = () => {
        if (!waterGeoJSON?.features) return null;
        return waterGeoJSON.features.map((feature, idx) => {
            const { type, coordinates } = feature.geometry;
            const props = feature.properties || {};

            let fill = 'rgba(0, 150, 255, 0.3)';
            let stroke = 'rgba(0, 150, 255, 0.8)';

            if (props.name === 'Nieuwe Maas') {
                fill = 'rgba(128, 0, 128, 0.4)';
                stroke = 'rgba(128, 0, 128, 0.8)';
            } else if (props.water === 'harbour') {
                fill = 'rgba(128, 128, 128, 0.5)';
                stroke = 'rgba(105, 105, 105, 0.9)';
            }

            if (type === 'Polygon') {
                return renderSinglePolygon(coordinates, feature, `poly-${idx}`, fill, stroke);
            }
            if (type === 'MultiPolygon') {
                return coordinates.map((polyArr, pi) =>
                    renderSinglePolygon(polyArr, feature, `multi-${idx}-${pi}`, fill, stroke)
                );
            }
            return null;
        });
    };

    const openAddMarkerModal = () => {
        setMarkerInfo({
            title: '',
            description: '',
            latitude: currentLocation?.coords.latitude ?? null,
            longitude: currentLocation?.coords.longitude ?? null,
        });
        SetLocationSource('current');
        setAddMarkerModalVisible(true);
    };

    // addMarker functie aangepast om markers op te slaan
    const addMarker = async () => {
        const { title, description, latitude, longitude } = markerInfo;
        if (title && latitude != null && longitude != null) {
            const newMarkerEntry = {
                title,
                description,
                latitude,
                longitude,
                id: Date.now().toString(), // Unieke ID voor de marker
            };

            try {
                await AsyncStorage.setItem(`marker_${newMarkerEntry.id}`, JSON.stringify(newMarkerEntry));
                const savedMarkerKeys = await AsyncStorage.getItem('savedMarkerKeys');
                let markerKeys = savedMarkerKeys ? JSON.parse(savedMarkerKeys) : [];
                markerKeys.push(`marker_${newMarkerEntry.id}`);
                await AsyncStorage.setItem('savedMarkerKeys', JSON.stringify(markerKeys));

                setMarkers((prevMarkers) => [...prevMarkers, newMarkerEntry]);
                setAddMarkerModalVisible(false);
                setMarkerInfo({ title: '', description: '', latitude: null, longitude: null });
                Alert.alert('Spot Toegevoegd', 'De spot is succesvol aan de kaart toegevoegd!');
            } catch (error) {
                console.error('Error adding marker:', error);
                Alert.alert('Fout', 'Er is een fout opgetreden bij het opslaan van de spot.');
            }
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul Titel in en kies een locatie voor de marker.');
        }
    };

    const startPickingLocation = () => {
        setAddMarkerModalVisible(false);
        setIsPickingLocation(true);
        Alert.alert('Locatie Kiezen', 'Tik op de kaart om de marker locatie te kiezen.');
    };

    const handleMapPress = (event) => {
        if (isPickingLocation) {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            setMarkerInfo((prevInfo) => ({
                ...prevInfo,
                latitude: latitude,
                longitude: longitude,
            }));
            SetLocationSource('picked');
            setIsPickingLocation(false);
            setAddMarkerModalVisible(true);
        }
    };

    return (
        <View style={[styles.container, darkMode && styles.containerDark]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
                onLongPress={(event) => {
                    // Langdruk opent direct het 'Spot toevoegen' scherm met de gekozen locatie
                    const { latitude, longitude } = event.nativeEvent.coordinate;
                    setMarkerInfo({
                        title: '',
                        description: '',
                        latitude: latitude,
                        longitude: longitude,
                    });
                    SetLocationSource('picked'); // Set source to 'picked' for long press
                    setAddMarkerModalVisible(true);
                }}
                showsUserLocation={showLocation}
                showsMyLocationButton={false}
                mapType="standard"
                customMapStyle={darkMode ? darkMapStyle : []}
            >
                {renderPolygons()}
                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        title={m.title}
                        description={m.description}
                    />
                ))}
            </MapView>
            
            {/* Location center button */}
            <TouchableOpacity
                style={[
                    styles.locationButton,
                    darkMode && { backgroundColor: '#00505e' }
                ]}
                onPress={centerMapOnUserLocation}
            >
                <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[
                    styles.roundButton,
                    darkMode && { backgroundColor: '#00505e' }
                ]}
                onPress={openAddMarkerModal}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Modal voor waterinformatie */}
            <Modal
                visible={!!selectedFeature}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)}
            >
                <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.modalContent, darkMode && styles.modalContentDark]}
                        onPress={() => {
                            const name = selectedFeature?.properties?.name || 'Onbekend';
                            const coords = selectedFeature?.geometry?.coordinates;

                            let center = { latitude: null, longitude: null };

                            if (selectedFeature.geometry.type === 'Polygon' && coords?.length > 0) {
                                const outerRing = coords[0]; // gebruik de eerste ring van de polygon
                                const lngLatPairs = outerRing.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
                                if (lngLatPairs.length > 0) {
                                    const avgLat = lngLatPairs.reduce((sum, p) => sum + p.latitude, 0) / lngLatPairs.length;
                                    const avgLng = lngLatPairs.reduce((sum, p) => sum + p.longitude, 0) / lngLatPairs.length;
                                    center = { latitude: avgLat, longitude: avgLng };
                                }
                            }

                            setSelectedFeature(null);

                            navigation.navigate('WaterInfo', {
                                waterName: name,
                                latitude: center.latitude,
                                longitude: center.longitude,
                            });
                        }}

                    >
                        {getAfbeelding(selectedFeature?.properties?.name) ? (
                            <Image
                                source={getAfbeelding(selectedFeature.properties.name)}
                                style={{ width: 250, height: 150, borderRadius: 8, marginBottom: 10 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                style={{
                                    width: 250,
                                    height: 150,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#ccc',
                                    marginBottom: 10,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={[darkMode && { color: '#eee' }]}>Geen afbeelding</Text>
                            </View>
                        )}

                        <Text style={[
                            styles.modalTitle,
                            darkMode && { color: '#0096b2' }
                        ]}>
                            {selectedFeature?.properties?.name || 'Onbekende locatie'}
                        </Text>

                        {
                            selectedFeature?.properties?.name === 'Nieuwe Maas' ? (
                                <View style={styles.permissionsScrollView}>
                                    <Text style={[styles.modalSubTitle, darkMode && { color: '#0096b2' }]}>🎣 Nodige Vergunningen:</Text>
                                    <Text style={[styles.modalText, darkMode && { color: '#eee' }]}>• VISpas of Kleine VISpas</Text>
                                </View>
                            ) : selectedFeature?.properties?.water === 'harbour' ? (
                                <View style={styles.permissionsScrollView}>
                                    <Text style={[styles.modalSubTitle, darkMode && { color: '#0096b2' }]}>🚫 Verboden te Vissen:</Text>
                                    <Text style={[styles.modalText, darkMode && { color: '#eee' }]}>Het is hier niet toegestaan om te vissen.</Text>
                                </View>
                            ) : selectedFeature?.waterData?.AdditionalPermissions?.length > 0 ? (
                                <ScrollView style={styles.permissionsScrollView}>
                                    <Text style={[styles.modalSubTitle, darkMode && { color: '#0096b2' }]}>🎣 Nodige Vergunningen:</Text>
                                    {selectedFeature.waterData.AdditionalPermissions.map((permission, index) => (
                                        <View key={permission.id || index} style={styles.permissionRow}>
                                            {permission.name === "NachtVISpas" ? (
                                                <Ionicons name="moon" size={20} color={darkMode ? "#0096b2" : "#1A3A91"} style={styles.permissionIcon} />
                                            ) : (
                                                <View style={styles.permissionIconPlaceholder} />
                                            )}
                                            <View style={styles.permissionTextContainer}>
                                                <Text style={[styles.permissionNameModal, darkMode && { color: '#0096b2' }]}>{permission.name}</Text>
                                                <Text style={[styles.permissionDescriptionModal, darkMode && { color: '#eee' }]}>{permission.description}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.noPermissionsContainer}>
                                    <Text style={[styles.modalSubTitle, darkMode && { color: '#0096b2' }]}>🎣 Nodige Vergunningen:</Text>
                                    <Text style={[styles.modalText, darkMode && { color: '#eee' }]}>• HSV Groot Rotterdam (ROTTERDAM)</Text>
                                    <Text style={[styles.modalText, darkMode && { color: '#eee' }]}>• Sportvisserijbelangen Delfland (DELFT)</Text>
                                    <Text style={[styles.modalText, darkMode && { color: '#eee' }]}>• HSV GHV - Groene Hart (DEN HAAG)</Text>
                                </View>
                            )
                        }

                        <Text
                            style={[
                                styles.modalText,
                                { marginTop: 15, fontWeight: 'bold', color: darkMode ? '#0096b2' : '#005f99' }
                            ]}
                        >
                            Tik om meer informatie te zien
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.closeButton, { marginTop: 15 }, darkMode && styles.closeButtonDark]}
                        onPress={() => setSelectedFeature(null)}
                    >
                        <Text style={[styles.closeButtonText, darkMode && { color: '#fff' }]}>Sluiten</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Modal voor marker informatie invoeren */}
            <Modal
                visible={addMarkerModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddMarkerModalVisible(false)}
            >
                <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
                    <ScrollView contentContainerStyle={[styles.scrollModalContent, darkMode && styles.modalContentDark]}>
                        <Text style={[styles.modalTitle, darkMode && { color: '#0096b2' }]}>Spot Informatie Invoeren</Text>
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            placeholder="Titel"
                            placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            value={markerInfo.title}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, title: text })}
                        />
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            placeholder="Beschrijving"
                            placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                            value={markerInfo.description}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, description: text })}
                        />
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            placeholder={
                                locationSource === 'current'
                                    ? 'Locatie: Huidige locatie'
                                    : 'Locatie: Gekozen locatie'
                            }
                            editable={false}
                            placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                        />

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#4CAF50', marginBottom: 10 }]}
                            onPress={startPickingLocation}
                        >
                            <Text style={styles.buttonText}>Kies Locatie op Kaart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={addMarker}>
                            <Text style={styles.buttonText}>Spot Toevoegen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#FF6347', marginTop: 10 }]}
                            onPress={() => setAddMarkerModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Visuele cue wanneer in picking mode */}
            {
                isPickingLocation && (
                    <View style={styles.pickingLocationOverlay} pointerEvents="none">
                        <Text style={styles.pickingLocationText}>Tik op de kaart...</Text>
                    </View>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    containerDark: { backgroundColor: '#181818' },
    map: { flex: 1 },
    roundButton: {
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
    locationButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#0096b2',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
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
        marginTop: '30%',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%',
        alignItems: 'center',
    },
    modalContentDark: {
        backgroundColor: '#232323',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalSubTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 5, color: '#1A3A91' }, // Nieuwe stijl
    modalText: { marginBottom: 5, fontSize: 16 },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 5,
    },
    inputDark: {
        backgroundColor: '#232323',
        color: '#fff',
        borderBottomColor: '#0096b2',
    },
    button: {
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonDark: {
        backgroundColor: '#00505e',
    },
    closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    permissionsScrollView: {
        width: '100%',
        maxHeight: 200, // Beperk de hoogte van de scrollview voor vergunningen
        marginBottom: 10,
        paddingVertical: 5,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'left',
        backgroundColor: '#F7F7F7', // Lichtgrijze achtergrond
        padding: 8,
        borderRadius: 5,
        marginBottom: 5,
        borderLeftWidth: 3,
        borderLeftColor: '#ADDAEF', // Een zachte blauwe kleur
    },
    permissionIcon: {
        marginRight: 8,
    },
    permissionIconPlaceholder: {
        width: 20, // Zelfde breedte als icoon voor uitlijning
        height: 20, // Zelfde hoogte als icoon voor uitlijning
        marginRight: 8,
    },
    permissionTextContainer: {
        flex: 1,
    },
    calloutContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#005f99',
        marginBottom: 4,
    },
    calloutDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    calloutButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 4,
    },
    calloutButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    permissionNameModal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A3A91',
        marginBottom: 2,
    },
    permissionDescriptionModal: {
        fontSize: 13,
        color: '#555',
    },
    noPermissionsContainer: {
        paddingVertical: 10,
        alignItems: 'left',
    },
    pickingLocationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickingLocationText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    locationDisplay: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
        alignSelf: 'flex-start', // Align text to the left
        marginLeft: '5%', // Match input field alignment
        marginTop: 5,
    },
});

export default MapScreen;