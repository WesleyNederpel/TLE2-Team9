import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, Image, ScrollView, FlatList, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAfbeelding = (naam) => {
    const map = {
        "Kralingseplas.png": require("../images/Kralingseplas.png"),
        "snoek.png": require("../images/snoek.png"),
        "baars.png": require("../images/baars.png"),
        "karper.png": require("../images/karper.png"),
        // voeg meer afbeeldingen toe als je die gebruikt
    };
    return map[naam] || require("../images/Kralingseplas.png"); // fallback afbeelding
};


export default function WaterInfo({ route }) {
    const locatie = {
        id: Date.now(),
        naam: "Kralingseplas",
        afbeeldingen: "Kralingseplas.png",
        screen: "WaterInfo",
    };

    const [modalVisible, setModalVisible] = useState(false);

    const [checkedItems, setCheckedItems] = useState({
        favorieten: false,
        mijnSpots: false,
        wilIkHeen: false,
    });

    useEffect(() => {
        const checkStored = async () => {
            const keys = ["favorieten", "mijnSpots", "wilIkHeen"];
            const newChecked = {};
            for (let key of keys) {
                try {
                    const existing = await AsyncStorage.getItem(`@locatie_${key}`);
                    const lijst = existing ? JSON.parse(existing) : [];
                    newChecked[key] = lijst.some(item => item.naam === locatie.naam);
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
            const key = `@locatie_${type}`;
            const existing = await AsyncStorage.getItem(key);
            let lijst = existing ? JSON.parse(existing) : [];

            const exists = lijst.some(item => item.naam === locatie.naam);

            if (exists) {
                lijst = lijst.filter(item => item.naam !== locatie.naam);
            } else {
                lijst.push({
                    ...locatie,
                    afbeeldingen: ["Kralingseplas.png"], // alleen bestandsnaam
                });

            }

            await AsyncStorage.setItem(key, JSON.stringify(lijst));

            setCheckedItems((prev) => ({
                ...prev,
                [type]: !exists,
            }));
        } catch (e) {
            console.error("Fout bij toggle opslaan:", e);
        }
    };

    // Voorbeelddata
    const gevangenVissen = [
        // { id: "1", uri: require("../images/vis1.png") },
        // { id: "2", uri: require("../images/vis2.png") },
    ];

    const vissoorten = [
        { id: "1", naam: "Snoek", afbeelding: require("../images/snoek.png") },
        { id: "2", naam: "Baars", afbeelding: require("../images/baars.png") },
        { id: "3", naam: "Karpers", afbeelding: require("../images/karper.png") },
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
                <Image source={getAfbeelding(locatie.afbeelding)} style={styles.headerImage} />
            </View>

            <Text style={styles.h1}>Kralingseplas</Text>
            <View style={styles.underline} />
            <Text style={styles.p}>
                De Kralingse Plas is een populair recreatiegebied in Rotterdam...
            </Text>

            <View style={styles.vispasContainer}>
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
                data={gevangenVissen}
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

                {vissoorten.map((vis, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <Pressable
                            key={vis.id}
                            style={[
                                styles.visItem,
                                isEven ? styles.visItemDefault : styles.visItemSelected,
                            ]}
                        >
                            {isEven ? (
                                <>
                                    <Image source={vis.afbeelding} style={styles.visImage} />
                                    <Text style={[styles.visText, { color: '#1A3A91' }]}>{vis.naam}</Text>
                                    <Text style={styles.blueArrow}>{'>'}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.greenArrow}>{'<'}</Text>
                                    <Text style={[styles.visText, { color: '#4C6D4D' }]}>{vis.naam}</Text>
                                    <Image source={vis.afbeelding} style={[styles.visImage, { borderColor: '#4C6D4D' }]} />
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


                        {["favorieten", "mijnSpots", "wilIkHeen"].map((type) => {
                            const label =
                                type === "favorieten" ? "❤️ Favorieten" :
                                    type === "mijnSpots" ? "⭐ Mijn Spots" :
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

// Je styles hier...


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
    vispasContainer: {
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
    visItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    visItemDefault: {
        backgroundColor: '#B9D9F0',
    },
    visItemSelected: {
        backgroundColor: '#C6E5B6',
    },
    visImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#1A3A91',
        marginRight: 12,
    },
    visText: {
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
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 10,
    },
    modalOptionText: {
        fontSize: 16,
        textAlign: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#E5A83F", // Geelachtig
        borderRadius: 4,
        marginLeft: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // Zorg dat het wit is als niet aangevinkt
    },
    checkboxChecked: {
        backgroundColor: "#E5A83F", // Gevulde checkbox als hij aangevinkt is
    },
    checkmark: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        lineHeight: 18,
    },

});
