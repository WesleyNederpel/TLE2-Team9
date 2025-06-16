import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Modal, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // Importeer expo-location
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';

const MapScreen = () => {
    // State om de zichtbaarheid van de modal te beheren
    const [modalVisible, setModalVisible] = useState(false);

    // State om markerinformatie op te slaan
    const [markerInfo, setMarkerInfo] = useState({ title: '', description: '', latitude: null, longitude: null });

    // State om toegevoegde markers op te sladen
    const [markers, setMarkers] = useState([]);

    // State om de huidige locatie op te slaan
    const [currentLocation, setCurrentLocation] = useState(null); // Naam gewijzigd naar currentLocation om verwarring te voorkomen

    // Initiële kaartregio gecentreerd rond Rotterdam
    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // useEffect hook om de locatie op te vragen bij het laden van de component
    useEffect(() => {
        (async () => {
            // Vraag toestemming voor locatie
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Toegang geweigerd', 'Locatietoegang is nodig om uw positie te bepalen.');
                return;
            }

            // Haal de huidige locatie op
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location); // Sla de locatie op in de state
            console.log('Huidige locatie:', location.coords); // Log de locatie naar de console
        })();
    }, []); // De lege array zorgt ervoor dat deze useEffect slechts één keer wordt uitgevoerd bij het mounten van het component

    // Functie om GeoJSON-coördinaten om te zetten van [lng, lat] naar {latitude, longitude}
    const convertCoords = (coordsArray) =>
        coordsArray.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));

    // Functie om polygonen te renderen voor waterlichamen uit de GeoJSON-data
    const renderPolygons = () => {
        if (!waterGeoJSON || !waterGeoJSON.features) {
            return null;
        }

        return waterGeoJSON.features.map((feature, index) => {
            const { type } = feature.geometry;

            // Als de feature een Polygon is, gebruik dan de eerste ring om de vorm te tekenen
            if (type === 'Polygon') {
                const coords = convertCoords(feature.geometry.coordinates[0]);
                return (
                    <Polygon
                        key={index}
                        coordinates={coords}
                        fillColor="rgba(0, 150, 255, 0.3)"
                        strokeColor="rgba(0, 150, 255, 0.8)"
                    />
                );
            }

            // Als de feature een MultiPolygon is, itereer dan over elke polygoonsectie
            if (type === 'MultiPolygon') {
                return feature.geometry.coordinates.map((polygonCoords, polyIndex) => {
                    const coords = convertCoords(polygonCoords[0]);
                    return (
                        <Polygon
                            key={`${index}-${polyIndex}`}
                            coordinates={coords}
                            fillColor="rgba(0, 150, 255, 0.3)"
                            strokeColor="rgba(0, 150, 255, 0.8)"
                        />
                    );
                });
            }

            return null;
        });
    };

    // Functie om een marker toe te voegen op basis van gebruikersinvoer
    const addMarker = () => {
        if (markerInfo.title && markerInfo.latitude && markerInfo.longitude) {
            // Sla marker op in state
            setMarkers([...markers, markerInfo]);

            // Sluit modal en reset invoervelden
            setModalVisible(false);
            setMarkerInfo({ title: '', description: '', latitude: null, longitude: null });
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul alle velden in voor de marker.');
        }
    };

    // Functie om de modal te openen en direct de huidige locatie in te vullen
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
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Kaartcomponent */}
            <MapView
                style={styles.map}
                initialRegion={region}
            >
                {/* Render polygonen die waterlichamen vertegenwoordigen */}
                {renderPolygons()}

                {/* Render alle markers toegevoegd door de gebruiker */}
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.title}
                        description={marker.description}
                    />
                ))}

            </MapView>

            {/* Ronde knop om de modal voor markerinvoer te openen */}
            <TouchableOpacity
                style={styles.roundButton}
                onPress={openAddMarkerModal}
            >
                <Text style={styles.roundButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal voor gebruikersinvoer */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Marker Information</Text>

                        {/* Input voor marker titel */}
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={markerInfo.title}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, title: text })}
                        />

                        {/* Input voor marker beschrijving */}
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={markerInfo.description}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, description: text })}
                        />
                        {/* Input voor Longitude, automatisch gevuld als currentLocation beschikbaar is */}
                        <TextInput
                            style={styles.input}
                            placeholder="Longitude"
                            value={markerInfo.longitude !== null ? markerInfo.longitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, longitude: parseFloat(text) || null })}
                            keyboardType="numeric"
                        />
                        {/* Input voor Latitude, automatisch gevuld als currentLocation beschikbaar is */}
                        <TextInput
                            style={styles.input}
                            placeholder="Latitude"
                            value={markerInfo.latitude !== null ? markerInfo.latitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, latitude: parseFloat(text) || null })}
                            keyboardType="numeric"
                        />
                        {/* Submit knop om marker toe te voegen */}
                        <TouchableOpacity style={styles.button} onPress={addMarker}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>

                        {/* Knop om modal te sluiten zonder toe te voegen */}
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6347', marginTop: 10 }]} onPress={() => setModalVisible(false)}>
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
    // NIEUWE STIJL VOOR DE RONDE KNOP
    roundButton: {
        position: 'absolute',
        bottom: 70, // Afstand vanaf de onderkant
        right: 20,  // Afstand vanaf de rechterkant
        backgroundColor: '#2196F3', // Blauwe achtergrondkleur
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MapScreen;