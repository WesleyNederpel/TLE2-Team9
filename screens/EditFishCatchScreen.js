import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    Modal, // Importeer Modal
    FlatList, // Importeer FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocationSetting } from '../LocationSettingContext';

const EditFishCatchScreen = ({ route }) => {
    const navigation = useNavigation();
    const { fishCatch } = route.params;
    const { darkMode } = useLocationSetting();

    const [title, setTitle] = useState(fishCatch.title);
    const [species, setSpecies] = useState(fishCatch.species);
    const [description, setDescription] = useState(fishCatch.description);
    const [length, setLength] = useState(fishCatch.length ? String(fishCatch.length) : '');
    const [weight, setWeight] = useState(fishCatch.weight ? String(fishCatch.weight) : '');
    const [timestamp, setTimestamp] = useState(new Date(fishCatch.timestamp));
    const [selectedLocation, setSelectedLocation] = useState(fishCatch.location || null);
    const [spotName, setSpotName] = useState('Selecteer Locatie');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [showSpotPickerModal, setShowSpotPickerModal] = useState(false); // Nieuwe state voor modal zichtbaarheid

    useEffect(() => {
        const loadSpots = async () => {
            try {
                const savedMarkerKeys = await AsyncStorage.getItem('savedMarkerKeys');
                let loadedMarkers = [];

                if (savedMarkerKeys) {
                    const markerKeys = JSON.parse(savedMarkerKeys);
                    for (const key of markerKeys) {
                        const markerString = await AsyncStorage.getItem(key);
                        if (markerString) {
                            loadedMarkers.push(JSON.parse(markerString));
                        }
                    }
                }

                setMarkers(loadedMarkers);

                if (fishCatch.location) {
                    const matchingMarker = loadedMarkers.find(marker => marker.id === fishCatch.location);
                    if (matchingMarker) {
                        setSpotName(matchingMarker.title);
                    }
                }
            } catch (error) {
                console.error("Fout bij het laden van spots:", error);
            }
        };

        loadSpots();
    }, [fishCatch.location]); // Voeg fishCatch.location toe aan de dependency array

    const handleSaveFishCatch = async () => {
        if (!title || !species || !description) {
            Alert.alert('Invoer ontbreekt', 'Vul alle verplichte velden (Titel, Soort, Notities) in.');
            return;
        }

        const updatedFishCatch = {
            ...fishCatch,
            title,
            species,
            description,
            length: length ? parseFloat(length) : null,
            weight: weight ? parseFloat(weight) : null,
            timestamp: timestamp.toISOString(),
            location: selectedLocation,
        };

        try {
            await AsyncStorage.setItem(updatedFishCatch.id, JSON.stringify(updatedFishCatch));
            Alert.alert('Succes', 'Visvangst succesvol bijgewerkt!');
            navigation.goBack();
        } catch (error) {
            console.error('Fout bij het bijwerken van de visvangst:', error);
            Alert.alert('Fout', 'Kon de visvangst niet bijwerken. Probeer het opnieuw.');
        }
    };

    // Functie om de geselecteerde spot naam te krijgen voor weergave
    const getSelectedSpotName = () => {
        const selectedSpot = markers.find(marker => marker.id === selectedLocation);
        return selectedSpot ? selectedSpot.title : 'Selecteer Locatie';
    };

    return (
        <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
            <View style={[styles.formSection, darkMode && styles.formSectionDark]}>
                <Text style={[styles.label, darkMode && styles.labelDark]}>Titel:</Text>
                <TextInput
                    style={[styles.input, darkMode && styles.inputDark]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Titel van de vangst"
                    placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                />

                <Text style={[styles.label, darkMode && styles.labelDark]}>Soort:</Text>
                <TextInput
                    style={[styles.input, darkMode && styles.inputDark]}
                    value={species}
                    onChangeText={setSpecies}
                    placeholder="Soort vis (bijv. Snoek, Baars)"
                    placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                />

                <Text style={[styles.label, darkMode && styles.labelDark]}>Beschrijving:</Text>
                <TextInput
                    style={[styles.input, styles.textArea, darkMode && styles.inputDark]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Voeg details toe over de vangst, omstandigheden, etc."
                    multiline
                    placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                />

                <Text style={[styles.label, darkMode && styles.labelDark]}>Lengte (cm):</Text>
                <TextInput
                    style={[styles.input, darkMode && styles.inputDark]}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="numeric"
                    placeholder="Optioneel"
                    placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                />

                <Text style={[styles.label, darkMode && styles.labelDark]}>Gewicht (kg):</Text>
                <TextInput
                    style={[styles.input, darkMode && styles.inputDark]}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="Optioneel"
                    placeholderTextColor={darkMode ? "#80d8e6" : "#888"}
                />

                <Text style={[styles.label, darkMode && styles.labelDark]}>Datum:</Text>
                <TouchableOpacity style={styles.dateDisplayContainer} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateDisplayText}>
                        {timestamp.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#004a99" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={timestamp}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setTimestamp(selectedDate);
                        }}
                    />
                )}

                <Text style={[styles.label, darkMode && styles.labelDark]}>Gekoppelde Spot:</Text>
                <TouchableOpacity
                    style={[styles.pickerDisplayButton, darkMode && styles.inputDark]}
                    onPress={() => setShowSpotPickerModal(true)} // Open de modal
                >
                    <Text style={[styles.pickerDisplayText, darkMode && { color: '#fff' }]}>{getSelectedSpotName()}</Text>
                    <Ionicons name="caret-down-outline" size={20} color={darkMode ? "#0096b2" : "#666"} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.saveButton, darkMode && styles.saveButtonDark]} onPress={handleSaveFishCatch}>
                <Text style={styles.saveButtonText}>Wijzigingen opslaan</Text>
            </TouchableOpacity>

            {/* Spot Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSpotPickerModal} // Gebruik de nieuwe state
                onRequestClose={() => {
                    setShowSpotPickerModal(false); // Sluit de modal bij hardware terugknop
                }}
            >
                <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
                    <View style={[styles.spotPickerModalContent, darkMode && styles.spotPickerModalContentDark]}>
                        <Text style={[styles.spotPickerModalTitle, darkMode && { color: '#0096b2' }]}>Kies een Spot Locatie</Text>
                        <FlatList
                            data={markers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.spotPickerItem}
                                    onPress={() => {
                                        setSelectedLocation(item.id);
                                        setSpotName(item.title); // Update spotName voor weergave
                                        setShowSpotPickerModal(false); // Sluit de modal na selectie
                                    }}
                                >
                                    <Text style={styles.spotPickerItemText}>{item.title}</Text>
                                    {selectedLocation === item.id && ( // Controleer of dit de geselecteerde is
                                        <Ionicons name="checkmark" size={20} color="#0096b2" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.noSpotsText}>Geen spots beschikbaar. Maak eerst een spot aan op de kaart.</Text>
                            )}
                        />
                        <TouchableOpacity style={[styles.spotPickerCloseButton, darkMode && styles.saveButtonDark]} onPress={() => setShowSpotPickerModal(false)}>
                            <Text style={styles.spotPickerCloseButtonText}>Sluiten</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    containerDark: {
        backgroundColor: '#181818',
    },
    header: {
        backgroundColor: '#004a99',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 60 : 20,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    formSection: {
        padding: 20,
        backgroundColor: 'white',
        margin: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    formSectionDark: {
        backgroundColor: '#232323',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#005f99',
    },
    labelDark: {
        color: '#0096b2',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#232323',
        color: '#fff',
        borderColor: '#0096b2',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateDisplayContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f0f8ff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateDisplayText: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 5,
    },
    pickerDisplayButton: { // Nieuwe stijl voor de knop die de modal opent
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f0f8ff',
    },
    pickerDisplayText: { // Nieuwe stijl voor de tekst in de knop
        fontSize: 16,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 15,
        marginBottom: 30,
    },
    saveButtonDark: {
        backgroundColor: '#00505e',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal stijlen
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlayDark: {
        backgroundColor: 'rgba(10,20,30,0.85)',
    },
    spotPickerModalContent: {
        backgroundColor: 'white',
        width: '85%', // Iets breder voor betere bruikbaarheid
        maxHeight: '70%', // Beperk de hoogte
        borderRadius: 10,
        padding: 20, // Meer padding
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    spotPickerModalContentDark: {
        backgroundColor: '#232323',
    },
    spotPickerModalTitle: {
        fontSize: 20, // Grotere titel
        fontWeight: 'bold',
        marginBottom: 15, // Meer ruimte onder de titel
        textAlign: 'center',
        color: '#004a99',
    },
    spotPickerItem: {
        paddingVertical: 12, // Meer padding voor elk item
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    spotPickerItemText: {
        fontSize: 16,
        color: '#333',
    },
    noSpotsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: '#666',
    },
    spotPickerCloseButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#ff6347',
        borderRadius: 8,
        alignItems: 'center',
    },
    spotPickerCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditFishCatchScreen;