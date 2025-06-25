import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, Image, ScrollView, FlatList, Modal, Platform, Linking, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import waters from "../data/waters.json";
import fishesData from "../assets/fish_data_of_the_netherlands.json";
import { useRoute } from '@react-navigation/native';
import { useLocationSetting } from '../LocationSettingContext';


const getImage = (name) => {
    const map = {
        "Kralingseplas": require("../images/Kralingseplas.png"),
        "Wijnhaven": require("../images/Wijnhaven.png"),
        "Bergse Voorplas": require("../images/BergseVoorplas.png"),
        "Oudehaven": require("../images/Oudehaven.png"),
        "Haringvliet": require("../images/Haringvliet.png"),
        "Boerengat": require("../images/Boerengat.png"),
        "Zevenhuizerplas": require("../images/Zevenhuizerplas.png"),
        "Rottemeren": require("../images/Rottemeren.png"),
        "Nieuwe Maas": require("../images/NieuweMaas.png"),
        "De Rotte": require("../images/deRotte.png"),

        // Visafbeeldingen (zorg dat deze namen overeenkomen met je JSON en knoppen)
        "snoek": require("../images/snoek.png"),
        "baars": require("../images/baars.png"),
        "karper": require("../images/karper.png"),
        "brasem": require("../images/brasem.png"),
        "snoekbaars": require("../images/snoekbaars.png"),
        "meerval": require("../images/meerval.png"),
        "zalm": require("../images/zalm.png"),
        "zeelt": require("../images/zeelt.png"),
    };

    // Fallback naar een standaardafbeelding als de naam niet in de map staat
    return map[name] || require("../images/Kralingseplas.png");
};

export default function WaterInfo({ route }) {
    const navigation = useNavigation();
    const { waterName, latitude, longitude } = route.params;
    const { darkMode } = useLocationSetting();

    const location = waters.find(
        (w) => w.name.trim().toLowerCase() === waterName.trim().toLowerCase()
    );

    const [modalVisible, setModalVisible] = useState(false);
    const [checkedItems, setCheckedItems] = useState({
        favorites: false,
        mySpots: false,
        wantToGo: false,
    });

    useEffect(() => {
        const checkStored = async () => {
            const keys = ["favorites", "mySpots", "wantToGo"];
            const newChecked = {};
            for (let key of keys) {
                try {
                    const existing = await AsyncStorage.getItem(`@location_${key}`);
                    const list = existing ? JSON.parse(existing) : [];
                    newChecked[key] = list.some(item => item.name === location.name);
                } catch (e) {
                    console.error(e);
                    newChecked[key] = false;
                }
            }
            setCheckedItems(newChecked);
        };
        if (location) checkStored();
    }, [location]);

    const toggleItem = async (type) => {
        try {
            const key = `@location_${type}`;
            const existing = await AsyncStorage.getItem(key);
            let list = existing ? JSON.parse(existing) : [];
            const exists = list.some(item => item.name === location.name);

            if (exists) {
                list = list.filter(item => item.name !== location.name);
            } else {
                list.push({ ...location, images: [location.image] });
            }

            await AsyncStorage.setItem(key, JSON.stringify(list));
            setCheckedItems((prev) => ({
                ...prev,
                [type]: !exists,
            }));
        } catch (e) {
            console.error("Error saving toggle:", e);
        }
    };

    //route openen in Google Maps of Apple Maps
    const openDirections = async () => {
        const label = encodeURIComponent(waterName || 'Bestemming');

        let url;

        if (latitude && longitude) {
            const latLng = `${latitude},${longitude}`;

            if (Platform.OS === 'ios') {
                const googleMapsUrl = `comgooglemaps://?q=${latLng}&zoom=15&directionsmode=driving`;
                const appleMapsUrl = `maps:0,0?q=${label}@${latLng}`;

                try {
                    const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
                    url = canOpenGoogleMaps ? googleMapsUrl : appleMapsUrl;
                } catch (error) {
                    console.error("Fout bij controleren Google Maps beschikbaarheid op iOS:", error);
                    url = appleMapsUrl;
                }
            } else {
                url = `https://www.google.com/maps/dir/?api=1&destination=${latLng}&travelmode=driving`;
            }

        } else if (waterName) {
            // Fallback: gebruik naam als zoekopdracht
            if (Platform.OS === 'ios') {
                url = `maps:0,0?q=${label}`;
            } else {
                url = `https://www.google.com/maps/search/?api=1&query=${label}`;
            }
        } else {
            console.warn("Geen locatie of naam beschikbaar om route te openen.");
            return;
        }

        Linking.openURL(url).catch(err =>
            console.error("Kon de route niet openen", err)
        );
    };

    // Functie om naar FishScreen te navigeren
    const handleFishPress = (fishNameInList) => {
        const fishDetails = fishesData.find(
            (f) => f.naam.trim().toLowerCase() === fishNameInList.trim().toLowerCase()
        );

        if (fishDetails) {
            navigation.navigate('FishScreen', { fish: fishDetails });
        } else {
            console.warn(`Visdetails voor "${fishNameInList}" niet gevonden.`);
        }
    };

    if (!location) {
        return (
            <View style={[styles.container, darkMode && styles.containerDark]}>
                <Text style={[styles.h1, darkMode && styles.textAccent]}>Water niet gevonden</Text>
            </View>
        );
    }

    const caughtFish = []; // Later uitbreidbaar

    return (
        <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
            <View style={styles.headerImageContainer}>
                <Image source={getImage(location.image)} style={styles.headerImage} />
            </View>

            <View style={styles.bottomButtonsContainer}>
                <Pressable style={[styles.bottomButton, darkMode && styles.bottomButtonDark]} onPress={openDirections}>
                    <Text style={[styles.bottomButtonText, darkMode && styles.textAccent]}>Route</Text>
                </Pressable>
                <Pressable style={[styles.bottomButton, darkMode && styles.bottomButtonDark]} onPress={() => setModalVisible(true)}>
                    <Text style={[styles.bottomButtonText, darkMode && styles.textAccent]}>Opslaan</Text>
                </Pressable>
            </View>
            <View style={[styles.underline, darkMode && styles.underlineDark]} />
            <Text style={[styles.p, darkMode && styles.textLight]}>{location.description}</Text>

            {/* Nieuwe sectie voor AdditionalPermissions */}
            {location.AdditionalPermissions && location.AdditionalPermissions.length > 0 && (
                <View style={[styles.additionalPermissionsSection, darkMode && styles.additionalPermissionsSectionDark]}>
                    <Text style={[styles.h2, darkMode && styles.textAccent]}>Aanvullende Vergunningen</Text>
                    <View style={[styles.underline, darkMode && styles.underlineDark]} />
                    {location.AdditionalPermissions.map((permission, index) => (
                        <View key={permission.id || index} style={[styles.permissionItem, darkMode && styles.permissionItemDark]}>
                            {permission.name === "NachtVISpas" ? (
                                <Ionicons name="moon" size={24} color={darkMode ? "#0096b2" : "#1A3A91"} style={styles.permissionIcon} />
                            ) : (
                                <View style={styles.permissionIconPlaceholder} />
                            )}
                            <View style={styles.permissionTextContent}>
                                <Text style={[styles.permissionName, darkMode && styles.textAccent]}>{permission.name}</Text>
                                <Text style={[styles.permissionDescription, darkMode && styles.textLight]}>{permission.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.h1, { color: darkMode ? '#0096b2' : '#1A3A91', marginTop: 20, textAlign: 'center' }]}>
                    Vissen {location.name}
                </Text>

                {location.fishTypes.map((fish, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <Pressable
                            key={fish.id}
                            style={[
                                styles.fishItem,
                                isEven
                                    ? (darkMode ? styles.fishItemDefaultDark : styles.fishItemDefault)
                                    : (darkMode ? styles.fishItemSelectedDark : styles.fishItemSelected),
                            ]}
                            onPress={() => handleFishPress(fish.name)}
                        >
                            <Image source={getImage(fish.image)} style={[
                                styles.fishImageStyle,
                                !isEven && { borderColor: darkMode ? '#1b4d2b' : '#4C6D4D' }
                            ]} />
                            <Text style={[
                                styles.fishText,
                                isEven
                                    ? { color: darkMode ? '#7fd6e7' : '#1A3A91' }
                                    : { color: darkMode ? '#7fd6e7' : '#4C6D4D' }
                            ]}>
                                {fish.name}
                            </Text>
                            <Text style={isEven
                                ? [styles.blueArrow, darkMode && { color: '#7fd6e7' }]
                                : [styles.greenArrow, darkMode && { color: '#7fd6e7' }]
                            }>
                                {'>'}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: "center", backgroundColor: darkMode ? "rgba(10,20,30,0.85)" : "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: darkMode ? "#232323" : "#fff", margin: 30, padding: 20, borderRadius: 10 }}>
                        <Text style={[styles.h1, { color: '#1A3A91' }, darkMode && styles.textAccent]}>Opslaan in...</Text>

                        {["favorites", "wantToGo"].map((type) => {
                            const label =
                                type === "favorites" ? "❤️ Favorieten" :
                                    "🚩 Wil ik heen";

                            const checked = checkedItems[type];

                            return (
                                <Pressable
                                    key={type}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderColor: "#ccc",
                                    }}
                                    onPress={() => toggleItem(type)}
                                >
                                    <Text style={styles.checkboxLabel}>{label}</Text>
                                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                                        {checked && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </Pressable>
                            );
                        })}

                        <Pressable onPress={() => setModalVisible(false)} style={[styles.bottomButton, darkMode && styles.bottomButtonDark]}>
                            <Text style={[styles.bottomButtonText, darkMode && styles.textAccent]}>Sluiten</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 10,
    },
    containerDark: {
        backgroundColor: '#181818',
    },
    h1: {
        color: '#E5A83F',
        fontSize: 24,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    p: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 4,
        color: '#222',
    },
    textLight: {
        color: '#eee',
    },
    textAccent: {
        color: '#0096b2',
    },
    underline: {
        height: 2,
        backgroundColor: '#E5A83F',
        width: '100%',
        marginBottom: 4,
    },
    underlineDark: {
        backgroundColor: '#0096b2',
    },
    headerImageContainer: {
        width: '100%',
        height: 200,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    fishPassContainer: {
        marginTop: 20,
    },
    fishImage: {
        width: '100%',
        height: 80,
        resizeMode: 'contain',
    },
    button: {
        backgroundColor: '#E5A83F',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    caughtFishImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    fishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    fishItemDefault: {
        backgroundColor: '#B9D9F0',
    },
    fishItemSelected: {
        backgroundColor: '#C6E5B6',
    },
    fishItemDefaultDark: {
        backgroundColor: '#003a4d', // donkerder blauw
    },
    fishItemSelectedDark: {
        backgroundColor: '#184d36', // donkerder groen
    },
    fishImageStyle: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#1A3A91',
        marginRight: 12,
    },
    fishText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    blueArrow: {
        fontSize: 20,
        color: '#1A3A91',
        fontWeight: 'bold',
    },
    greenArrow: {
        fontSize: 20,
        color: '#4C6D4D',
        fontWeight: 'bold',
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    bottomButton: {
        backgroundColor: '#ADDAEF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginHorizontal: 5,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomButtonDark: {
        backgroundColor: '#00505e',
    },
    bottomButtonText: {
        color: '#1A3A91',
        fontWeight: '600',
    },
    checkboxLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A3A91',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderWidth: 2,
        borderColor: '#1A3A91',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#1A3A91',
    },
    checkmark: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    additionalPermissionsSection: {
        marginTop: 20,
        paddingHorizontal: 5,
    },
    additionalPermissionsSectionDark: {
        backgroundColor: '#232323',
        borderRadius: 8,
        padding: 10,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#ADDAEF',
    },
    permissionItemDark: {
        backgroundColor: '#00505e',
        borderLeftColor: '#0096b2',
    },
    permissionIcon: {
        marginRight: 10,
    },
    permissionIconPlaceholder: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    permissionTextContent: {
        flex: 1,
    },
    permissionName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A3A91',
        marginBottom: 2,
    },
    permissionDescription: {
        fontSize: 14,
        color: '#555',
    },
});