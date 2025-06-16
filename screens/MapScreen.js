import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';

const MapScreen = () => {
    // State om de geselecteerde feature (waterlichaam) voor de informatie-modal op te slaan
    const [selectedFeature, setSelectedFeature] = useState(null);

    // State om de zichtbaarheid van de "Add Marker" modal te beheren
    const [addMarkerModalVisible, setAddMarkerModalVisible] = useState(false); // Naam gewijzigd voor duidelijkheid

    // State om markerinformatie op te slaan voor de nieuwe marker
    const [markerInfo, setMarkerInfo] = useState({ title: '', description: '', latitude: null, longitude: null });

    // State om toegevoegde markers op te slaan die op de kaart worden weergegeven
    const [markers, setMarkers] = useState([]);

    // State om de huidige locatie van de gebruiker op te slaan
    const [currentLocation, setCurrentLocation] = useState(null);

    // Initiële kaartregio gecentreerd rond Rotterdam
    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // useEffect hook om locatietoestemming te vragen en de huidige locatie op te halen bij het laden van de component
    useEffect(() => {
        (async () => {
            // Vraag toestemming voor het gebruik van de voorgrondlocatie
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Toon een waarschuwing als locatietoegang is geweigerd
                Alert.alert('Toegang geweigerd', 'Locatietoegang is nodig om uw positie te bepalen.');
                return;
            }

            // Haal de huidige locatie op
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location); // Sla de opgehaalde locatie op in de state
        })();
    }, []); // De lege afhankelijkheidsarray zorgt ervoor dat deze hook slechts één keer wordt uitgevoerd (bij het mounten)

    // Functie om GeoJSON-coördinaten [lng, lat] om te zetten naar {latitude, longitude} objecten
    // Geschikt voor zowel buitenste ringen als gaten in polygonen
    const convertCoords = (coordsArray) => {
        if (!coordsArray || coordsArray.length === 0) return [];
        return coordsArray.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));
    };

    // Handler wanneer een polygoon op de kaart wordt aangeklikt
    const handlePolygonPress = (feature) => {
        setSelectedFeature(feature); // Sla de aangeklikte feature op om de informatie-modal te tonen
    };

    // Hulpfuncties om te controleren of een feature een rivier of haven is
    const isRiver = (feature) => feature?.properties?.water === 'river';
    const isHarbour = (feature) => feature?.properties?.water === 'harbour';

    // Functie om individuele polygonen te renderen, inclusief gaten
    const renderSinglePolygon = (polygonCoordsArrays, feature, keySuffix, fillColor, strokeColor) => {
        // De eerste array in polygonCoordsArrays is de buitenste ring
        const outerCoordinates = convertCoords(polygonCoordsArrays[0]);
        // De volgende arrays zijn eventuele gaten in de polygoon
        const innerHoles = polygonCoordsArrays.slice(1).map(convertCoords);

        if (outerCoordinates.length === 0) return null; // Render niets als er geen buitenste coördinaten zijn

        return (
            <Polygon
                key={`${feature.id || feature.properties?.name || keySuffix}`} // Gebruik een unieke sleutel
                coordinates={outerCoordinates}
                holes={innerHoles.length > 0 ? innerHoles : undefined} // Voeg gaten toe indien aanwezig
                fillColor={fillColor}
                strokeWidth={1}
                strokeColor={strokeColor}
                tappable={true} // Maakt de polygoon klikbaar
                onPress={() => handlePolygonPress(feature)} // Roep de handler aan bij een klik
            />
        );
    };

    // Functie om alle polygonen uit de GeoJSON-data te renderen
    const renderPolygons = () => {
        if (!waterGeoJSON?.features) return null;

        return waterGeoJSON.features.map((feature, index) => {
            const { type, coordinates } = feature.geometry;
            const props = feature.properties || {};

            let fillColor = 'rgba(0, 150, 255, 0.3)'; // Standaard waterkleur
            let strokeColor = 'rgba(0, 150, 255, 0.8)'; // Standaard randkleur

            // Aangepaste kleuren op basis van 'water' eigenschap
            if (props.water === 'river') {
                fillColor = 'rgba(128, 0, 128, 0.4)'; // Paars voor rivieren
                strokeColor = 'rgba(128, 0, 128, 0.8)';
            }
            if (props.water === 'harbour') {
                fillColor = 'rgba(128, 128, 128, 0.5)'; // Grijs voor havens
                strokeColor = 'rgba(105, 105, 105, 0.9)';
            }
            // Specifieke kleur voor Kralingse Plas
            if (props.name === 'Kralingse Plas') {
                fillColor = 'rgba(255, 165, 0, 0.6)'; // Oranje
                strokeColor = 'rgba(255, 165, 0, 0.8)';
            }

            // Render logica voor Polygon en MultiPolygon types
            if (type === 'Polygon') {
                return renderSinglePolygon(coordinates, feature, `poly-${index}`, fillColor, strokeColor);
            }
            if (type === 'MultiPolygon') {
                return coordinates.map((polygonCoords, polyIndex) =>
                    renderSinglePolygon(polygonCoords, feature, `multi-${index}-${polyIndex}`, fillColor, strokeColor)
                );
            }
            return null; // Geen ondersteuning voor andere geometrie types
        });
    };

    // Functie om een marker toe te voegen op basis van gebruikersinvoer in de modal
    const addMarker = () => {
        if (markerInfo.title && markerInfo.latitude && markerInfo.longitude) {
            setMarkers([...markers, markerInfo]); // Voeg de nieuwe marker toe aan de lijst
            setAddMarkerModalVisible(false); // Sluit de modal
            // Reset de invoervelden van de marker modal
            setMarkerInfo({ title: '', description: '', latitude: null, longitude: null });
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul alle verplichte velden (Titel, Breedtegraad, Lengtegraad) in voor de marker.');
        }
    };

    // Functie om de "Add Marker" modal te openen en de huidige locatie voor te vullen
    const openAddMarkerModal = () => {
        if (currentLocation) {
            setMarkerInfo({
                ...markerInfo,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });
        } else {
            // Reset markerInfo als er geen locatie beschikbaar is, zodat velden leeg zijn
            setMarkerInfo({ title: '', description: '', latitude: null, longitude: null });
        }
        setAddMarkerModalVisible(true); // Open de "Add Marker" modal
    };

    return (
        <View style={styles.container}>
            {/* Kaartcomponent */}
            <MapView style={styles.map} initialRegion={region} mapType={'standard'}>
                {/* Render polygonen die waterlichamen vertegenwoordigen */}
                {renderPolygons()}

                {/* Render alle markers toegevoegd door de gebruiker */}
                {markers.map((marker, index) => (
                    <Marker
                        key={`marker-${index}`} // Unieke sleutel voor elke marker
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.title}
                        description={marker.description}
                    />
                ))}

            </MapView>

            {/* Ronde knop om de "Add Marker" modal te openen */}
            <TouchableOpacity
                style={styles.roundButton}
                onPress={openAddMarkerModal}
            >
                <Text style={styles.roundButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal voor de informatie van aangeklikte waterlichamen */}
            <Modal
                visible={!!selectedFeature} // De modal is zichtbaar als selectedFeature niet null is
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)} // Sluit de modal als de gebruiker terug navigeert
            >
                <View style={styles.modalOverlay}> {/* Gebruik modalOverlay voor de achtergrond */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Waterinformatie</Text>

                        {isHarbour(selectedFeature) ? (
                            <Text style={styles.modalText}>🚫 No fish zone – havengebied</Text>
                        ) : selectedFeature?.properties ? (
                            <>
                                {Object.entries(selectedFeature.properties).map(([key, value]) => (
                                    <Text key={key} style={styles.modalText}>
                                        <Text style={{ fontWeight: 'bold' }}>{key}: </Text>
                                        {/* FIX: Zorg ervoor dat de waarde expliciet in een Text-component staat en een string is */}
                                        <Text>{value?.toString() || ''}</Text>
                                    </Text>
                                ))}

                                {isRiver(selectedFeature) ? (
                                    <Text style={[styles.modalText, { marginTop: 10 }]}>
                                        🎣 Toegankelijk met <Text style={{ fontWeight: 'bold' }}>VISpas</Text> of <Text style={{ fontWeight: 'bold' }}>Kleine VISpas</Text>.
                                    </Text>
                                ) : (
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.modalText}>🎣 VISpas van:</Text>
                                        <Text style={styles.modalText}>• HSV Groot Rotterdam (ROTTERDAM)</Text>
                                        <Text style={styles.modalText}>• Sportvisserijbelangen Delfland (DELFT)</Text>
                                        <Text style={styles.modalText}>• HSV GHV - Groene Hart (DEN HAAG)</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={styles.modalText}>Geen eigenschappen beschikbaar</Text>
                        )}

                        <TouchableOpacity onPress={() => setSelectedFeature(null)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Sluiten</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal voor gebruikersinvoer van een nieuwe marker */}
            <Modal visible={addMarkerModalVisible} transparent animationType="slide"> {/* Gebruik de nieuwe state variabele */}
                <View style={styles.modalOverlay}> {/* Gebruik modalOverlay voor de achtergrond */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Marker Informatie Invoeren</Text>

                        {/* Input voor marker titel */}
                        <TextInput
                            style={styles.input}
                            placeholder="Titel"
                            value={markerInfo.title}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, title: text })}
                        />

                        {/* Input voor marker beschrijving */}
                        <TextInput
                            style={styles.input}
                            placeholder="Beschrijving"
                            value={markerInfo.description}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, description: text })}
                        />
                        {/* Input voor Longitude, automatisch gevuld als currentLocation beschikbaar is */}
                        <TextInput
                            style={styles.input}
                            placeholder="Lengtegraad"
                            value={markerInfo.longitude !== null ? markerInfo.longitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, longitude: parseFloat(text) || null })}
                            keyboardType="numeric"
                        />
                        {/* Input voor Latitude, automatisch gevuld als currentLocation beschikbaar is */}
                        <TextInput
                            style={styles.input}
                            placeholder="Breedtegraad"
                            value={markerInfo.latitude !== null ? markerInfo.latitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, latitude: parseFloat(text) || null })}
                            keyboardType="numeric"
                        />
                        {/* Submit knop om marker toe te voegen */}
                        <TouchableOpacity style={styles.button} onPress={addMarker}>
                            <Text style={styles.buttonText}>Toevoegen</Text>
                        </TouchableOpacity>

                        {/* Knop om modal te sluiten zonder toe te voegen */}
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6347', marginTop: 10 }]} onPress={() => setAddMarkerModalVisible(false)}>
                            <Text style={styles.buttonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Stijlen voor de UI-componenten
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    roundButton: {
        position: 'absolute',
        bottom: 40, // Afstand vanaf de onderkant
        right: 20,  // Afstand vanaf de rechterkant
        backgroundColor: '#0096b2', // Blauwe achtergrondkleur
        width: 60, // Breedte van de knop
        height: 60, // Hoogte van de knop
        borderRadius: 30, // Helft van breedte/hoogte om het rond te maken
        justifyContent: 'center', // Centreer de inhoud (tekst) verticaal
        alignItems: 'center',     // Centreer de inhoud (tekst) horizontaal
        elevation: 5, // Schaduw voor Android
        shadowColor: '#000', // Schaduw voor iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    roundButtonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 30, // Centreer de '+' verticaal in de knop
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%', // Breedte van de modal
        maxHeight: '70%', // Maximale hoogte van de modal
        alignItems: 'center', // Centreer inhoud horizontaal
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15, // Afstand onder de titel
        textAlign: 'center', // Centreer de titeltekst
    },
    modalText: {
        marginBottom: 5,
        fontSize: 16,
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 5, // Lichte afronding voor inputs
    },
    button: {
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#0096b2', // Blauw    e kleur voor sluitknop
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MapScreen;