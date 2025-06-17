import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Image, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Image,
    ScrollView // Importeer ScrollView voor scrollbare modals
} from 'react-native';
import MapView, {Polygon, Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {Picker} from '@react-native-picker/picker';
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';


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
        default:
            return null; // of een standaardafbeelding, bv. require('../images/placeholder.png');
    }
};




const MapScreen = ({ navigation }) => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [addMenuModalVisible, setAddMenuModalVisible] = useState(false);

    const [addMarkerModalVisible, setAddMarkerModalVisible] = useState(false);
    const [markerInfo, setMarkerInfo] = useState({title: '', description: '', latitude: null, longitude: null});
    const [markers, setMarkers] = useState([]); // Array van spots (markers)
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isPickingLocation, setIsPickingLocation] = useState(false);

    // imageUris is nu een array
    const [fishInfo, setFishInfo] = useState({
        title: '',
        description: '',
        location: '',
        species: '',
        length: '',
        weight: '',
        imageUris: []
    });
    const [fish, setFish] = useState([]); // Array van visvangsten
    const [addFishModalVisible, setAddFishModalVisible] = useState(false);

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
        return coordsArray.map(([lng, lat]) => ({latitude: lat, longitude: lng}));
    };

    const handlePolygonPress = (feature) => {
        if (!isPickingLocation) {
            setSelectedFeature(feature);
        }
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
                onPress={(event) => {
                    if (isPickingLocation) {
                        const {latitude, longitude} = event.nativeEvent.coordinate;
                        setMarkerInfo((prevInfo) => ({
                            ...prevInfo,
                            latitude: latitude,
                            longitude: longitude,
                        }));
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
            const {type, coordinates} = feature.geometry;
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

    const toggleAddMenuModal = () => {
        setAddMenuModalVisible(!addMenuModalVisible);
    };
    const toggleAddMarkerModal = () => {
        setAddMarkerModalVisible(!addMarkerModalVisible);
        if (addMarkerModalVisible) {
            setAddMenuModalVisible(false);
        }
    };
    const toggleAddFishModal = () => {
        setAddFishModalVisible(!addFishModalVisible);
        if (addFishModalVisible) {
            setAddMenuModalVisible(false);
        }
    };

    const openAddMarkerModal = () => {
        setMarkerInfo({
            title: '',
            description: '',
            latitude: currentLocation?.coords.latitude ?? null,
            longitude: currentLocation?.coords.longitude ?? null,
        });
        setAddMarkerModalVisible(true);
        setAddMenuModalVisible(false);
    };

    const openAddFishModal = () => {
        setFishInfo({
            title: '',
            description: '',
            location: markers.length > 0 ? markers[0].title : '', // Standaard de eerste marker als locatie
            species: '',
            length: '',
            weight: '',
            imageUris: [], // Zorg dat dit een lege array is bij openen
        });
        setAddFishModalVisible(true);
        setAddMenuModalVisible(false);
    };

    const addFish = () => {
        if (fishInfo.title && fishInfo.description && fishInfo.species) {
            setFish([...fish, fishInfo]);
            setAddFishModalVisible(false);
            setFishInfo({title: '', description: '', location: '', species: '', length: '', weight: '', imageUris: []});
            Alert.alert('Vis toegevoegd', 'De vis is succesvol toegevoegd!');
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul alle verplichte velden (Titel, Beschrijving, Soort, Locatie) in voor de vis.');
        }
    };

    const addMarker = () => {
        const {title, latitude, longitude} = markerInfo;
        if (title && latitude != null && longitude != null) {
            setMarkers([...markers, markerInfo]);
            setAddMarkerModalVisible(false);
            setMarkerInfo({title: '', description: '', latitude: null, longitude: null});
            Alert.alert('Spot Toegevoegd', 'De spot is succesvol aan de kaart toegevoegd!');
        } else {
            Alert.alert('Invoer ontbreekt', 'Vul Titel, Breedtegraad en Lengtegraad in voor de marker.');
        }
    };

    const startPickingLocation = () => {
        setAddMarkerModalVisible(false);
        setIsPickingLocation(true);
        Alert.alert('Locatie Kiezen', 'Tik op de kaart om de marker locatie te kiezen.');
    };

    const handleMapPress = (event) => {
        if (isPickingLocation) {
            const {latitude, longitude} = event.nativeEvent.coordinate;
            setMarkerInfo((prevInfo) => ({
                ...prevInfo,
                latitude: latitude,
                longitude: longitude,
            }));
            setIsPickingLocation(false);
            setAddMarkerModalVisible(true);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, // Belangrijk: sta meerdere selecties toe
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImageUris = result.assets.map(asset => asset.uri);
            setFishInfo((prevFishInfo) => ({
                ...prevFishInfo,
                imageUris: [...prevFishInfo.imageUris, ...newImageUris], // Voeg nieuwe URIs toe aan de bestaande
            }));
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
            >
                {renderPolygons()}
                {markers.map((m, i) => (
                    <Marker
                        key={`marker-${i}`}
                        coordinate={{latitude: m.latitude, longitude: m.longitude}}
                        title={m.title}
                        description={m.description}
                    />
                ))}
            </MapView>

            <TouchableOpacity style={styles.roundButton} onPress={toggleAddMenuModal}>
                <Text style={styles.roundButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal voor waterinformatie */}
            <Modal
                visible={!!selectedFeature}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedFeature(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.modalContent}
                        onPress={() => {
                            const name = selectedFeature?.properties?.name || 'Onbekend';
                            setSelectedFeature(null);
                            navigation.navigate('WaterInfo', { waterName: name });
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
                                <Text>Geen afbeelding</Text>
                            </View>
                        )}

                        <Text style={styles.modalTitle}>
                            {selectedFeature?.properties?.name || 'Onbekende locatie'}
                        </Text>

                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.modalText}>🎣 Nodige Vispas:</Text>
                            <Text style={styles.modalText}>• HSV Groot Rotterdam (ROTTERDAM)</Text>
                            <Text style={styles.modalText}>• Sportvisserijbelangen Delfland (DELFT)</Text>
                            <Text style={styles.modalText}>• HSV GHV - Groene Hart (DEN HAAG)</Text>
                        </View>

                        <Text
                            style={[
                                styles.modalText,
                                { marginTop: 15, fontWeight: 'bold', color: '#005f99' },
                            ]}
                        >
                            Tik om meer informatie te zien
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.closeButton, { marginTop: 15 }]}
                        onPress={() => setSelectedFeature(null)}
                    >
                        <Text style={styles.closeButtonText}>Sluiten</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Modal voor Spot/Vis toevoegen menu */}
            <Modal
                visible={addMenuModalVisible}
                transparent
                animationType="fade"
                onRequestClose={toggleAddMenuModal}
            >
                <TouchableWithoutFeedback onPress={toggleAddMenuModal}>
                    <View style={styles.menuModalOverlay}>
                        <View style={styles.addMenuContent}>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={openAddMarkerModal}
                            >
                                <Text style={styles.menuButtonText}>Spot Toevoegen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={openAddFishModal}
                            >
                                <Text style={styles.menuButtonText}>Vis Toevoegen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal voor marker informatie invoeren */}
            <Modal visible={addMarkerModalVisible} transparent animationType="slide"
                   onRequestClose={toggleAddMarkerModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Spot Informatie Invoeren</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Titel"
                            value={markerInfo.title}
                            onChangeText={(text) => setMarkerInfo({...markerInfo, title: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Beschrijving"
                            value={markerInfo.description}
                            onChangeText={(text) => setMarkerInfo({...markerInfo, description: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Breedtegraad"
                            keyboardType="numeric"
                            value={markerInfo.latitude != null ? markerInfo.latitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({
                                ...markerInfo,
                                latitude: parseFloat(text) || null
                            })}
                            editable={!isPickingLocation}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Lengtegraad"
                            keyboardType="numeric"
                            value={markerInfo.longitude != null ? markerInfo.longitude.toString() : ''}
                            onChangeText={(text) => setMarkerInfo({
                                ...markerInfo,
                                longitude: parseFloat(text) || null
                            })}
                            editable={!isPickingLocation}
                        />

                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: '#4CAF50', marginBottom: 10}]}
                            onPress={startPickingLocation}
                        >
                            <Text style={styles.buttonText}>Kies Locatie op Kaart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={addMarker}>
                            <Text style={styles.buttonText}>Spot Toevoegen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: '#FF6347', marginTop: 10}]}
                            onPress={() => setAddMarkerModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Visuele cue wanneer in picking mode */}
            {isPickingLocation && (
                <View style={styles.pickingLocationOverlay} pointerEvents="none">
                    <Text style={styles.pickingLocationText}>Tik op de kaart...</Text>
                </View>
            )}

            {/* Modal voor vis toevoegen */}
            <Modal visible={addFishModalVisible} transparent animationType="slide" onRequestClose={toggleAddFishModal}>
                <View style={styles.modalOverlay}>
                    {/* ScrollView om content scrollbaar te maken */}
                    <ScrollView contentContainerStyle={styles.scrollModalContent}>
                        <Text style={styles.modalTitle}>Vis Informatie Invoeren</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Titel"
                            value={fishInfo.title}
                            onChangeText={(text) => setFishInfo({...fishInfo, title: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Beschrijving"
                            value={fishInfo.description}
                            onChangeText={(text) => setFishInfo({...fishInfo, description: text})}
                        />

                        {/* Knop voor foto kiezen, direct onder Beschrijving */}
                        <TouchableOpacity style={[styles.button, styles.imagePickerButton]} onPress={pickImage}>
                            <Text style={styles.buttonText}>Kies Foto's</Text>
                        </TouchableOpacity>

                        {/* Afbeeldingen preview in een horizontale ScrollView */}
                        {fishInfo.imageUris.length > 0 && (
                            <ScrollView horizontal style={styles.imagePreviewScrollView}>
                                {fishInfo.imageUris.map((uri, index) => (
                                    <Image key={index} source={{uri}} style={styles.fishImagePreview}/>
                                ))}
                            </ScrollView>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Soort"
                            value={fishInfo.species}
                            onChangeText={(text) => setFishInfo({...fishInfo, species: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Lengte (cm)"
                            keyboardType="numeric"
                            value={fishInfo.length}
                            onChangeText={(text) => setFishInfo({...fishInfo, length: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Gewicht (kg)"
                            keyboardType="numeric"
                            value={fishInfo.weight}
                            onChangeText={(text) => setFishInfo({...fishInfo, weight: text})}
                        />

                        {/* Dropdown voor Locatie */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={fishInfo.location}
                                style={styles.picker}
                                onValueChange={(itemValue) => setFishInfo({...fishInfo, location: itemValue})}
                            >
                                <Picker.Item label="Kies een Spot Locatie" value=""/>
                                {markers.map((marker, index) => (
                                    <Picker.Item key={index} label={marker.title} value={marker.title}/>
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={addFish}>
                            <Text style={styles.buttonText}>Vis Toevoegen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: '#FF6347', marginTop: 10}]}
                            onPress={() => setAddFishModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    map: {flex: 1},
    roundButton: {
        position: 'absolute',
        bottom: 40,
        left: 20, // Aangepast naar links
        backgroundColor: '#0096b2',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    roundButtonText: {color: 'white', fontSize: 30, fontWeight: 'bold', lineHeight: 30},
    modalOverlay: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'},
    scrollModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '300',
        alignItems: 'center',
        marginTop: '20%',
    },
    modalContent: { // Dit is de stijl voor de watermodal, ongewijzigd
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%',
        alignItems: 'flex-start',
    },
    modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center'},
    modalText: {marginBottom: 5, fontSize: 16},
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
    buttonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
    closeButton: {
        marginTop: 20,
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
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
    menuModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-start', // Aangepast naar links uitlijnen
        backgroundColor: 'rgba(0,0,0,0)',
    },
    addMenuContent: {
        marginBottom: 150, // Passend bij de bottom van de roundButton + hoogte + extra marge
        marginLeft: 20, // Lijn uit met de linkerkant van de '+' knop
        alignItems: 'flex-start', // Zorgt ervoor dat de knoppen links uitlijnen
    },
    menuButton: {
        backgroundColor: '#0096b2',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    menuButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'left', // Aangepast naar links uitlijnen
    },
    imagePickerButton: {
        backgroundColor: '#1E90FF', // Een andere kleur voor de foto knop
        width: '100%',
        marginBottom: 10, // Meer ruimte onder de knop
    },
    fishImagePreview: {
        width: 80, // Kleinere breedte voor meerdere afbeeldingen
        height: 80,
        borderRadius: 10,
        marginRight: 10, // Ruimte tussen afbeeldingen
        resizeMode: 'cover',
    },
    imagePreviewScrollView: {
        width: '260',
        marginBottom: 10, // Ruimte onder de horizontale scrollview
        paddingVertical: 5, // Kleinere padding voor strakker uiterlijk
    },
    pickerContainer: {
        width: '100%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 50,
    },
});

export default MapScreen;
