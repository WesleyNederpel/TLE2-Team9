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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditFishCatchScreen = ({ route }) => {
    const navigation = useNavigation();
    const { fishCatch } = route.params;

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
    const [showSpotPicker, setShowSpotPicker] = useState(false);


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
    }, []);

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

    return (
        <ScrollView style={styles.container}>
            {/*<View style={styles.header}>*/}
            {/*    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>*/}
            {/*        <Ionicons name="arrow-back" size={28} color="#FFF" />*/}
            {/*    </TouchableOpacity>*/}
            {/*    <Text style={styles.headerTitle}>Visvangst bewerken</Text>*/}
            {/*</View>*/}

            <View style={styles.formSection}>
                <Text style={styles.label}>Titel:</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Titel van de vangst"
                />

                <Text style={styles.label}>Soort:</Text>
                <TextInput
                    style={styles.input}
                    value={species}
                    onChangeText={setSpecies}
                    placeholder="Soort vis (bijv. Snoek, Baars)"
                />

                <Text style={styles.label}>Beschrijving:</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Voeg details toe over de vangst, omstandigheden, etc."
                    multiline
                />

                <Text style={styles.label}>Lengte (cm):</Text>
                <TextInput
                    style={styles.input}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="numeric"
                    placeholder="Optioneel"
                />

                <Text style={styles.label}>Gewicht (kg):</Text>
                <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="Optioneel"
                />

                <Text style={styles.label}>Datum:</Text>
                {/* De tekstweergave van datum blijft, maar er is geen kiezer meer */}
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


                <Text style={styles.label}>Gekoppelde Spot:</Text>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setShowSpotPicker(true)}
                >
                    <Text style={styles.locationButtonText}>
                        {spotName || 'Selecteer een spot'}
                    </Text>
                    <Ionicons name="map-outline" size={24} color="#004a99" />
                </TouchableOpacity>

                {/* Spot Picker Modal */}
                {showSpotPicker && (
                    <View style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        justifyContent: 'center', alignItems: 'center'
                    }}>
                        <View style={{ backgroundColor: 'white', width: '80%', borderRadius: 10, padding: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Kies een spot:</Text>
                            {markers.map(marker => (
                                <TouchableOpacity
                                    key={marker.id}
                                    onPress={() => {
                                        setSelectedLocation(marker.id);
                                        setSpotName(marker.title);
                                        setShowSpotPicker(false);
                                    }}
                                    style={{ paddingVertical: 10 }}
                                >
                                    <Text style={{ fontSize: 16 }}>{marker.title}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity onPress={() => setShowSpotPicker(false)} style={{ marginTop: 10 }}>
                                <Text style={{ color: '#007bff', textAlign: 'right' }}>Annuleren</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFishCatch}>
                <Text style={styles.saveButtonText}>Wijzigingen opslaan</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
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
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#005f99',
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
    locationButton: {
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
    locationButtonText: {
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
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditFishCatchScreen;