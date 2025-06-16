import React, {useState} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    FlatList,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const gevangenVissen = [
    {
        id: '1',
        uri: require("../images/Kralingseplas.png"), // vervang met echte foto's
    },
    {
        id: '2',
        uri: require("../images/Kralingseplas.png"),
    },
];

const vissoorten = [
    {
        id: '1',
        naam: 'Snoek',
        afbeelding: require("../images/snoek.png"),
    },
    {
        id: '2',
        naam: 'Baars',
        afbeelding: require("../images/baars.png"),
    },
    {
        id: '3',
        naam: 'Karper',
        afbeelding: require("../images/karper.png"),
    },
];

export default function WaterInfo({ route }) {

    const [modalVisible, setModalVisible] = useState(false);

    const handleSave = async (type) => {
        const locatie = {
            id: Date.now(),
            naam: 'Kralingseplas',
            afbeeldingen: [require("../images/Kralingseplas.png")],
            screen: 'WaterInfo',
        };

        try {
            const key = `@locatie_${type}`;
            const existing = await AsyncStorage.getItem(key);
            const lijst = existing ? JSON.parse(existing) : [];

            const exists = lijst.some((item) => item.naam === locatie.naam);
            if (!exists) {
                lijst.push(locatie);
                await AsyncStorage.setItem(key, JSON.stringify(lijst));
                alert(`Opgeslagen in ${type}`);
            } else {
                alert(`Locatie staat al in ${type}`);
            }
        } catch (e) {
            console.error("Fout bij opslaan:", e);
        }
    };

    return (
        <ScrollView style={styles.container}>

            {/* Actieknoppen boven afbeelding */}
            <View style={styles.topButtonsContainer}>
                <Pressable style={styles.topButton}>
                    <Text style={styles.topButtonText}>Route</Text>
                </Pressable>
                <Pressable style={styles.topButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.topButtonText}>Opslaan</Text>
                </Pressable>
            </View>


            {/* Header afbeelding */}
            <View style={styles.headerImageContainer}>
                <Image
                    source={require("../images/Kralingseplas.png")}
                    style={styles.headerImage}
                />
            </View>

            {/* Titel en omschrijving */}
            <Text style={styles.h1}>Kralingseplas</Text>
            <View style={styles.underline} />
            <Text style={styles.p}>
                De Kralingse Plas is een populair recreatiegebied in Rotterdam, gelegen in de wijk Kralingen.
                Het meer is omgeven door een prachtig park en biedt volop mogelijkheden voor ontspanning,
                zoals wandelen, fietsen, picknicken, zeilen en zwemmen.
            </Text>

            {/* Vispas waarschuwing */}
            <View style={styles.vispasContainer}>
                <Image
                    source={require("../images/fishpass.png")}
                    style={styles.fishImage}
                />
                <Text style={[styles.h1, { marginTop: 10 }]}>Vispas nodig!</Text>
                <View style={styles.underline} />
                <Text style={styles.p}>
                    Voor deze locatie heb je nog niet een geldige vispas, haal de pas hier voordat je gaat vissen!
                </Text>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Vispas aanschaffen</Text>
                </Pressable>
            </View>

            {/* Gevangen vissen */}
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

            {/* Vissoorten lijst */}
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
                                isEven ? styles.visItemDefault : styles.visItemSelected, // achtergrondkleur wisselt nog steeds
                            ]}
                        >
                            {isEven ? (
                                <>
                                    <Image source={vis.afbeelding} style={styles.visImage} />
                                    <Text style={[styles.visText, { color: '#1A3A91' }]}>
                                        {vis.naam}
                                    </Text>
                                    <Text style={styles.blueArrow}>{'>'}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.greenArrow}>{'<'}</Text>
                                    <Text style={[styles.visText, { color: '#4C6D4D' }]}>
                                        {vis.naam}
                                    </Text>
                                    <Image source={vis.afbeelding} style={[styles.visImage, {borderColor: '#4C6D4D'}]} />
                                </>
                            )}
                        </Pressable>
                    );
                })}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Opslaan in...</Text>
                            <Pressable style={styles.modalOption} onPress={() => handleSave('favorieten')}>
                                <Text style={styles.modalOptionText}>❤️ Favorieten</Text>
                            </Pressable>
                            <Pressable style={styles.modalOption} onPress={() => handleSave('mijnSpots')}>
                                <Text style={styles.modalOptionText}>⭐ Mijn Spots</Text>
                            </Pressable>
                            <Pressable style={styles.modalOption} onPress={() => handleSave('wilIkHeen')}>
                                <Text style={styles.modalOptionText}>🚩 Wil ik heen</Text>
                            </Pressable>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>Annuleer</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>



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
        color: '#17589A',
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

});
