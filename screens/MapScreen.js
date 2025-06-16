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

    const convertCoordsList = (coordsArray) => {
        if (!coordsArray || coordsArray.length === 0) return [];
        return coordsArray.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));
    };

    const handlePolygonPress = (feature) => {
        setSelectedFeature(feature);
    };

    const isRiver = (feature) => feature?.properties?.water === 'river';
    const isHarbour = (feature) => feature?.properties?.water === 'harbour';

    const renderPolygons = () => {
        if (!waterGeoJSON?.features) return null;

        return waterGeoJSON.features.map((feature, index) => {
            const { type, coordinates } = feature.geometry;
            const props = feature.properties || {};

            let fillColor = 'rgba(0, 150, 255, 0.3)';
            let strokeColor = 'rgba(0, 150, 255, 0.8)';

            if (props.water === 'river') {
                fillColor = 'rgba(128, 0, 128, 0.4)';
                strokeColor = 'rgba(128, 0, 128, 0.8)';
            }

            if (props.water === 'harbour') {
                fillColor = 'rgba(128, 128, 128, 0.5)';
                strokeColor = 'rgba(105, 105, 105, 0.9)';
            }

            if (props.name === 'Kralingse Plas') {
                fillColor = 'rgba(255, 165, 0, 0.6)';
                strokeColor = 'rgba(255, 165, 0, 0.8)';
            }

            const renderSinglePolygon = (polygonCoordsArrays, keySuffix) => {
                const outerCoordinates = convertCoordsList(polygonCoordsArrays[0]);
                const innerHoles = polygonCoordsArrays.slice(1).map(convertCoordsList);

                if (outerCoordinates.length === 0) return null;

                return (
                    <Polygon
                        key={`${index}-${keySuffix}`}
                        coordinates={outerCoordinates}
                        holes={innerHoles.length > 0 ? innerHoles : undefined}
                        fillColor={fillColor}
                        strokeWidth={1}
                        strokeColor={strokeColor}
                        tappable={true}
                        onPress={() => handlePolygonPress(feature)}
                    />
                );
            };

            if (type === 'Polygon') return renderSinglePolygon(coordinates, 'single');
            if (type === 'MultiPolygon') {
                return coordinates.map((polygonCoords, polyIndex) =>
                    renderSinglePolygon(polygonCoords, `multi-${polyIndex}`)
                );
            }

            return null;
        });
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={region} mapType={'standard'}>
                {renderPolygons()}
            </MapView>

            {/* Modal */}
            <Modal
                visible={!!selectedFeature}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Waterinfo</Text>

                        {isHarbour(selectedFeature) ? (
                            <Text style={styles.modalText}>🚫 No fish zone – havengebied</Text>
                        ) : selectedFeature?.properties ? (
                            <>
                                {Object.entries(selectedFeature.properties).map(([key, value]) => (
                                    <Text key={key} style={styles.modalText}>
                                        <Text style={{ fontWeight: 'bold' }}>{key}: </Text>{value?.toString()}
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
