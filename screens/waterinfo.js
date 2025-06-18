import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, Image, ScrollView, FlatList, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native'; // Importeer useNavigation
import waters from "../data/waters.json";
import fishesData from "../assets/fish_data_of_the_netherlands.json"; // Importeer het nieuwe fishes.json bestand

const getImage = (name) => {
    const map = {
        "Kralingseplas": require("../images/Kralingseplas.png"),
        "Wijnhaven": require("../images/Wijnhaven.png"),
        "BergseVoorplas": require("../images/BergseVoorplas.png"),
        "Oudehaven": require("../images/Oudehaven.png"),
        "Haringvliet": require("../images/Haringvliet.png"),
        "Boerengat": require("../images/Boerengat.png"),
        "Zevenhuizerplas": require("../images/Zevenhuizerplas.png"),

        // Visafbeeldingen (zorg dat deze namen overeenkomen met je JSON en knoppen)
        "snoek": require("../images/snoek.png"),
        "baars": require("../images/baars.png"),
        "karper": require("../images/karper.png"),
        "brasem": require("../images/brasem.png"),
        "snoekbaars": require("../images/snoekbaars.png"),
        "meerval": require("../images/meerval.png"), // Zorg dat deze afbeeldingen bestaan
        "zalm": require("../images/zalm.png"),     // Zorg dat deze afbeeldingen bestaan
        "zeelt": require("../images/zalm.png"),   // Zorg dat deze afbeeldingen bestaan
    };

    return map[name] || require("../images/Kralingseplas.png"); // fallback
};

export default function WaterInfo({ route }) {
    const navigation = useNavigation(); // Initialiseer navigation
    const waterName = route?.params?.waterName || "Onbekend";

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

    // Functie om naar FishScreen te navigeren
    const handleFishPress = (fishNameInList) => {
        // Zoek de volledige visdata in fishesData
        const fishDetails = fishesData.find(
            (f) => f.naam.trim().toLowerCase() === fishNameInList.trim().toLowerCase()
        );

        if (fishDetails) {
            navigation.navigate('FishScreen', { fish: fishDetails });
        } else {
            console.warn(`Visdetails voor "${fishNameInList}" niet gevonden.`);
            // Optioneel: toon een alert aan de gebruiker
        }
    };

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.h1}>Water niet gevonden</Text>
            </View>
        );
    }

    const caughtFish = []; // Later uitbreidbaar

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topButtonsContainer}>
                <Pressable style={styles.topButton}>
                    <Text style={styles.topButtonText}>Route</Text>
                </Pressable>
                <Pressable style={styles.topButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.topButtonText}>Opslaan</Text>
                </Pressable>
            </View>

            <View style={styles.headerImageContainer}>
                <Image source={getImage(location.image)} style={styles.headerImage} />
            </View>

            <Text style={styles.h1}>{location.name}</Text>
            <View style={styles.underline} />
            <Text style={styles.p}>{location.description}</Text>

            <View style={styles.fishPassContainer}>
                <Image source={require("../images/fishpass.png")} style={styles.fishImage} />
                <Text style={[styles.h1, { marginTop: 10 }]}>Vispas nodig!</Text>
                <View style={styles.underline} />
                <Text style={styles.p}>Voor deze locatie heb je nog niet een geldige vispas...</Text>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Vispas aanschaffen</Text>
                </Pressable>
            </View>

            <Text style={[styles.h1, { color: '#1A3A91', marginTop: 20 }]}>
                Gevangen {location.name} <Text style={{ fontSize: 16 }}>{caughtFish.length} 🎣</Text>
            </Text>
            <FlatList
                horizontal
                data={caughtFish}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Image source={item.uri} style={styles.caughtFishImage} />
                )}
                style={{ marginVertical: 10 }}
                showsHorizontalScrollIndicator={false}
            />

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.h1, { color: '#1A3A91', marginTop: 20, textAlign: 'center' }]}>
                    Vissen {location.name}
                </Text>

                {/* Hier passen we de Pressable toe op elk vis-item */}
                {location.fishTypes.map((fish, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <Pressable
                            key={fish.id}
                            style={[
                                styles.fishItem,
                                isEven ? styles.fishItemDefault : styles.fishItemSelected,
                            ]}
                            onPress={() => handleFishPress(fish.name)} // Roep handleFishPress aan
                        >
                            {isEven ? (
                                <>
                                    <Image source={getImage(fish.image)} style={styles.fishImageStyle} />
                                    <Text style={[styles.fishText, { color: '#1A3A91' }]}>{fish.name}</Text>
                                    <Text style={styles.blueArrow}>{'>'}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.greenArrow}>{'<'}</Text>
                                    <Text style={[styles.fishText, { color: '#4C6D4D' }]}>{fish.name}</Text>
                                    <Image source={getImage(fish.image)} style={[styles.fishImageStyle, { borderColor: '#4C6D4D' }]} />
                                </>
                            )}
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
                <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: "#fff", margin: 30, padding: 20, borderRadius: 10 }}>
                        <Text style={[styles.h1, { color: '#1A3A91' }]}>Opslaan in...</Text>

                        {["favorites", "mySpots", "wantToGo"].map((type) => {
                            const label =
                                type === "favorites" ? "❤️ Favorieten" :
                                    type === "mySpots" ? "⭐ Mijn Spots" :
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

                        <Pressable onPress={() => setModalVisible(false)} style={styles.topButton}>
                            <Text style={styles.topButtonText}>Sluiten</Text>
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
    h1: {
        color: '#E5A83F',
        fontSize: 24,
        fontWeight: 'bold',
    },
    p: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 4,
    },
    underline: {
        height: 2,
        backgroundColor: '#E5A83F',
        width: '100%',
        marginVertical: 4,
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
    topButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    topButton: {
        backgroundColor: '#ADDAEF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    topButtonText: {
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
});