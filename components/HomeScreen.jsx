import React, { useState } from 'react';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import waterCoordinatesThree from '../assets/waterCoordinatesThree.json';

export default function HomeScreen() {
    const [selectedWaterInfo, setSelectedWaterInfo] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const getCenterOfPolygon = (coords) => {
        if (!coords || coords.length === 0) return { latitude: 0, longitude: 0 };
        let latSum = 0;
        let lonSum = 0;
        coords.forEach(coord => {
            latSum += coord.latitude;
            lonSum += coord.longitude;
        });
        return {
            latitude: latSum / coords.length,
            longitude: lonSum / coords.length,
        };
    };

    const parseWaterElement = (element) => {
        const tags = element.tags || {};
        let coordinates = [];

        if (element.type === 'way' && Array.isArray(element.geometry)) {
            coordinates = element.geometry.map(coord => ({
                latitude: coord.lat,
                longitude: coord.lon,
            }));
        }

        if (element.type === 'relation' && Array.isArray(element.members)) {
            coordinates = element.members
                .filter(m => m.role === 'outer' && Array.isArray(m.geometry))
                .flatMap(m => m.geometry.map(coord => ({
                    latitude: coord.lat,
                    longitude: coord.lon,
                })));
        }

        if (coordinates.length === 0) return null;

        return {
            id: element.id,
            coordinates,
            center: getCenterOfPolygon(coordinates),
            name: tags.name || `Water Area ${element.id}`,
            wikidata: tags.wikidata,
            wikipedia: tags.wikipedia,
            waterType: tags.water || tags.waterway || tags.natural,
        };
    };

    const isWaterFeature = (element) => {
        const tags = element.tags || {};
        return (
            (element.type === 'way' || element.type === 'relation') &&
            (
                tags.natural === 'water' ||
                tags.water === 'river' ||
                tags.waterway === 'riverbank' ||
                tags.waterway === 'river'
            )
        );
    };

    const waterPolygons = waterCoordinatesThree.elements
        .filter(isWaterFeature)
        .map(parseWaterElement)
        .filter(Boolean);

    const handlePolygonPress = (polygon) => {
        setSelectedWaterInfo(polygon);
        setModalVisible(true);
    };

    const initialRegion = {
        latitude: 51.927, // iets noordelijker dan voorheen
        longitude: 4.51,
        latitudeDelta: 0.05,
        longitudeDelta: 0.15,
    };

    return (
        <View style={styles.container}>
            <MapView initialRegion={initialRegion} style={styles.map}>
                {waterPolygons.map(polygon => (
                    <React.Fragment key={polygon.id}>
                        <Polygon
                            coordinates={polygon.coordinates}
                            strokeColor="#000"
                            fillColor="rgba(0, 0, 255, 0.5)"
                            strokeWidth={0.5}
                        />
                        <Marker
                            coordinate={polygon.center}
                            onPress={() => handlePolygonPress(polygon)}
                            opacity={0}
                        >
                            <View style={{ width: 20, height: 20, backgroundColor: 'transparent' }} />
                        </Marker>
                    </React.Fragment>
                ))}
            </MapView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedWaterInfo && (
                            <>
                                <Text style={styles.modalTitle}>{selectedWaterInfo.name}</Text>
                                {selectedWaterInfo.waterType && (
                                    <Text style={styles.modalText}>Type water: {selectedWaterInfo.waterType}</Text>
                                )}
                                {selectedWaterInfo.wikidata && (
                                    <Text style={styles.modalText}>Wikidata: {selectedWaterInfo.wikidata}</Text>
                                )}
                                {selectedWaterInfo.wikipedia && (
                                    <Text style={styles.modalText}>Wikipedia: {selectedWaterInfo.wikipedia}</Text>
                                )}
                            </>
                        )}
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Sluiten</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
        paddingBottom: 50,
        backgroundColor: 'lightblue',
    },
    map: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalText: {
        marginBottom: 5,
        textAlign: 'center',
    },
});
