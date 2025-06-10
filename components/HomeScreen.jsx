import React, { useState } from 'react';
import MapView, { Polygon, Marker } from 'react-native-maps'; // Importeer Marker
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import waterCoordinates from '../assets/waterCoordinates.json';

export default function HomeScreen() {
    const [selectedWaterInfo, setSelectedWaterInfo] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Functie om het middelpunt van een reeks coördinaten te berekenen
    const getCenterOfPolygon = (coords) => {
        let latSum = 0;
        let lonSum = 0;
        for (let i = 0; i < coords.length; i++) {
            latSum += coords[i].latitude;
            lonSum += coords[i].longitude;
        }
        return {
            latitude: latSum / coords.length,
            longitude: lonSum / coords.length,
        };
    };

    const waterPolygons = waterCoordinates.elements
        .filter(element => element.type === "way" && element.tags && element.tags.natural === "water")
        .map(element => {
            const coords = element.geometry.map(coord => ({
                latitude: coord.lat,
                longitude: coord.lon,
            }));
            return {
                id: element.id,
                coordinates: coords,
                center: getCenterOfPolygon(coords), // Bereken het middelpunt
                name: element.tags.name || `Water Area ${element.id}`,
                wikidata: element.tags.wikidata,
                wikipedia: element.tags.wikipedia,
                waterType: element.tags.water,
            };
        });

    const handlePolygonPress = (polygon) => {
        setSelectedWaterInfo(polygon);
        setModalVisible(true);
    };

    const initialRegion = {
        latitude: 51.9173619,
        longitude: 4.4839952,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                initialRegion={initialRegion}
                style={styles.map}
            >
                {waterPolygons.map((polygon) => (
                    <React.Fragment key={polygon.id}>
                        <Polygon
                            coordinates={polygon.coordinates}
                            strokeColor="#000"
                            fillColor="rgba(0, 0, 255, 0.5)"
                            strokeWidth={1}
                        // onPress={() => handlePolygonPress(polygon)} // We gebruiken nu de marker voor clicks
                        />
                        {/* Voeg een transparante marker toe voor klikbaarheid */}
                        <Marker
                            coordinate={polygon.center}
                            onPress={() => handlePolygonPress(polygon)}
                            opacity={0} // Maak de marker onzichtbaar
                        >
                            {/* De View binnen de Marker is nog steeds nodig om een klikbaar gebied te garanderen */}
                            <View style={{ width: 20, height: 20, backgroundColor: 'transparent' }} />
                        </Marker>
                    </React.Fragment>
                ))}
            </MapView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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