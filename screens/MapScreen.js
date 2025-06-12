import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';

const MapScreen = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);

    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // Deze functie converteert een enkele lijst van [longitude, latitude] naar { latitude, longitude } objecten
    const convertCoordsList = (coordsArray) => {
        if (!coordsArray || coordsArray.length === 0) {
            return []; // Zorg ervoor dat een lege array wordt teruggegeven bij null/lege input
        }
        return coordsArray.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));
    };

    const handlePolygonPress = (feature) => {
        setSelectedFeature(feature);
    };

    const renderPolygons = () => {
        if (!waterGeoJSON || !waterGeoJSON.features) {
            return null;
        }

        return waterGeoJSON.features.map((feature, index) => {
            const { type, coordinates } = feature.geometry;
            const props = feature.properties || {};

            const fillColor = 'rgba(0, 150, 255, 0.3)';
            const strokeColor = 'rgba(0, 150, 255, 0.8)';

            // Functie om een individuele Polygon te renderen, inclusief gaten
            const renderSinglePolygon = (polygonCoordsArrays, keySuffix) => {
                // De eerste array is de buitenrand
                const outerCoordinates = convertCoordsList(polygonCoordsArrays[0]);
                // Alle volgende arrays zijn de gaten
                const innerHoles = polygonCoordsArrays.slice(1).map(convertCoordsList);

                // Als de buitenste coördinaten leeg zijn, render dan niets om fouten te voorkomen
                if (outerCoordinates.length === 0) {
                    return null;
                }

                return (
                    <Polygon
                        key={`${index}-${keySuffix}`} // Gebruik een unieke key
                        coordinates={outerCoordinates}
                        holes={innerHoles.length > 0 ? innerHoles : undefined} // Geef `holes` alleen mee als er daadwerkelijk gaten zijn
                        fillColor={fillColor}
                        strokeWidth={1}
                        strokeColor={strokeColor}
                        tappable={true}
                        onPress={() => handlePolygonPress(feature)}
                    />
                );
            };


            if (type === 'Polygon') {
                // Voor een enkel Polygon, geef de volledige `coordinates` array door
                // die de buitenrand en eventuele gaten bevat
                return renderSinglePolygon(coordinates, 'single');
            }

            if (type === 'MultiPolygon') {
                // Voor een MultiPolygon, loop over elke individuele polygoon
                // en render deze met de `renderSinglePolygon` helper
                return coordinates.map((polygonCoords, polyIndex) =>
                    renderSinglePolygon(polygonCoords, `multi-${polyIndex}`)
                );
            }

            return null;
        });
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={region} mapType={'satellite'}>
                {renderPolygons()}
            </MapView>

            {/* Modal met info over waterlichaam */}
            <Modal
                visible={!!selectedFeature}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Waterinfo</Text>
                        {selectedFeature?.properties ? (
                            <>
                                {Object.entries(selectedFeature.properties).map(([key, value]) => (
                                    <Text key={key} style={styles.modalText}>
                                        <Text style={{ fontWeight: 'bold' }}>{key}: </Text>{value?.toString()}
                                    </Text>
                                ))}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MapScreen;