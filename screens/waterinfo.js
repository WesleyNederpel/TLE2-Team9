import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, Image, ScrollView, FlatList, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getImage = (name) => {
    const map = {
        "Kralingseplas.png": require("../images/Kralingseplas.png"),
        "snoek.png": require("../images/snoek.png"),
        "baars.png": require("../images/baars.png"),
        "karper.png": require("../images/karper.png"),
        // add more images if you use them
    };
    return map[name] || require("../images/Kralingseplas.png"); // fallback image
};

export default function WaterInfo({ route }) {
    const location = {
        id: Date.now(),
        name: "Kralingseplas",
        image: "Kralingseplas.png",
        screen: "WaterInfo",
    };

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
        checkStored();
    }, []);

    const toggleItem = async (type) => {
        try {
            const key = `@location_${type}`;
            const existing = await AsyncStorage.getItem(key);
            let list = existing ? JSON.parse(existing) : [];

            const exists = list.some(item => item.name === location.name);

            if (exists) {
                list = list.filter(item => item.name !== location.name);
            } else {
                list.push({
                    ...location,
                    image: ["Kralingseplas.png"], // only filename
                });
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

    // Example data
    const caughtFish = [
        // { id: "1", uri: require("../images/vis1.png") },
        // { id: "2", uri: require("../images/vis2.png") },
    ];

    const fishTypes = [
        { id: "1", name: "Snoek", image: require("../images/snoek.png") },
        { id: "2", name: "Baars", image: require("../images/baars.png") },
        { id: "3", name: "Karpers", image: require("../images/karper.png") },
    ];

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

            <Text style={styles.h1}>Kralingseplas</Text>
            <View style={styles.underline} />
            <Text style={styles.p}>
                De Kralingse Plas is een populair recreatiegebied in Rotterdam...
            </Text>

            <View style={styles.fishPassContainer}>
                <Image source={require("../images/fishpass.png")} style={styles.fishImage} />
                <Text style={[styles.h1, { marginTop: 10 }]}>Vispas nodig!</Text>
                <View style={styles.underline} />
                <Text style={styles.p}>
                    Voor deze locatie heb je nog niet een geldige vispas...
                </Text>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Vispas aanschaffen</Text>
                </Pressable>
            </View>

            <Text style={[styles.h1, { color: '#1A3A91', marginTop: 20 }]}>
                Gevangen kralingseplas <Text style={{ fontSize: 16 }}>2 🎣</Text>
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
                    Vissen Kralingseplas
                </Text>

                {fishTypes.map((fish, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <Pressable
                            key={fish.id}
                            style={[
                                styles.fishItem,
                                isEven ? styles.fishItemDefault : styles.fishItemSelected,
                            ]}
                        >
                            {isEven ? (
                                <>
                                    <Image source={fish.image} style={styles.fishImageStyle} />
                                    <Text style={[styles.fishText, { color: '#1A3A91' }]}>{fish.name}</Text>
                                    <Text style={styles.blueArrow}>{'>'}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.greenArrow}>{'<'}</Text>
                                    <Text style={[styles.fishText, { color: '#4C6D4D' }]}>{fish.name}</Text>
                                    <Image source={fish.image} style={[styles.fishImageStyle, { borderColor: '#4C6D4D' }]} />
                                </>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: "#fff", margin: 30, padding: 20, borderRadius: 10 }}>
                        <Text style={[styles.h1, {color:'#1A3A91'}]}>Opslaan in...</Text>

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

// Styles blijven ongewijzigd

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
