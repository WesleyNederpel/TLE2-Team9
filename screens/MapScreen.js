import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';

const MapScreen = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [addMarkerModalVisible, setAddMarkerModalVisible] = useState(false);
    const [markerInfo, setMarkerInfo] = useState({ title: '', description: '', latitude: null, longitude: null });
    const [markers, setMarkers] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);

    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Toegang geweigerd', 'Locatietoegang is nodig om uw positie te bepalen.');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location);
        })();
    }, []);

    const convertCoords = (coordsArray) => {
        if (!coordsArray || coordsArray.length === 0) return [];
        return coordsArray.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
    };

    const handlePolygonPress = (feature) => {
        setSelectedFeature(feature);
    };

    const isRiver = (feature) => feature?.properties?.water === 'river';
    const isHarbour = (feature) => feature?.properties?.water === 'harbour';

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
                onPress={() => handlePolygonPress(feature)}
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

            if (props.water === 'river') {
                fill = 'rgba(128, 0, 128, 0.4)';
                stroke = 'rgba(128, 0, 128, 0.8)';
            } else if (props.water === 'harbour') {
                fill = 'rgba(128, 128, 128, 0.5)';
                stroke = 'rgba(105, 105, 105, 0.9)';
            }
            if (props.name === 'Kralingse Plas') {
                fill = 'rgba(255, 165, 0, 0.6)';
                stroke = 'rgba(255, 165, 0, 0.8)';
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
        setAddMarkerModalVisible(true);
    };

    const addMarker = () => {
        const { title, latitude, longitude } = markerInfo;
        if (title && latitude != null && longitude != null) {
            setMarkers([...markers, markerInfo]);
            setAddMarkerModalVisible(false);
            setMarkerInfo({ title: '', description: '', latitude: null, longitude: null });
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul Titel, Breedtegraad en Lengtegraad in voor de marker.');
        }
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={region}>
                {renderPolygons()}
                {markers.map((m, i) => (
                    <Marker
                        key={`marker-${i}`}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        title={m.title}
                        description={m.description}
                    />
                ))}
            </MapView>

            <TouchableOpacity style={styles.roundButton} onPress={openAddMarkerModal}>
                <Text style={styles.roundButtonText}>+</Text>
            </TouchableOpacity>

            <Modal
                visible={!!selectedFeature}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Waterinformatie</Text>
                        {isHarbour(selectedFeature) ? (
                            <Text style={styles.modalText}>🚫 No fish zone – havengebied</Text>
                        ) : selectedFeature?.properties ? (
                            <>
                                {Object.entries(selectedFeature.properties).map(([key, val]) => (
                                    <Text key={key} style={styles.modalText}>
                                        <Text style={{ fontWeight: 'bold' }}>{key}: </Text>
                                        <Text>{val?.toString() || ''}</Text>
                                    </Text>
                                ))}

                                {isRiver(selectedFeature) ? (
                                    <Text style={[styles.modalText, { marginTop: 10 }]}>
                                        🎣 Toegankelijk met <Text style={{ fontWeight: 'bold' }}>VISpas</Text> of{' '}
                                        <Text style={{ fontWeight: 'bold' }}>Kleine VISpas</Text>.
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
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFeature(null)}>
                            <Text style={styles.closeButtonText}>Sluiten</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={addMarkerModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Marker Informatie Invoeren</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Titel"
                            value={markerInfo.title}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, title: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Beschrijving"
                            value={markerInfo.description}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, description: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Lengtegraad"
                            keyboardType="numeric"
                            value={markerInfo.longitude != null ? markerInfo.longitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, longitude: parseFloat(text) || null })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Breedtegraad"
                            keyboardType="numeric"
                            value={markerInfo.latitude != null ? markerInfo.latitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({ ...markerInfo, latitude: parseFloat(text) || null })}
                        />

                        <TouchableOpacity style={styles.button} onPress={addMarker}>
                            <Text style={styles.buttonText}>Toevoegen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#FF6347', marginTop: 10 }]}
                            onPress={() => setAddMarkerModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    roundButton: {
        position: 'absolute',
        bottom: 40,
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
    roundButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold', lineHeight: 30 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%',
        alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalText: { marginBottom: 5, fontSize: 16 },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
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
    closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default MapScreen;
