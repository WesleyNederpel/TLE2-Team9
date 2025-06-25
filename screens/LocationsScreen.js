import { useEffect, useState, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import waters from "../data/waters.json"; // Importeer de waters data
import { useLocationSetting } from '../LocationSettingContext';

export default function LocationsScreen({ navigation }) {

    const [locationData, setLocationData] = useState({
        favorites: [],
        mySpots: [],
        wantToGo: [],
        rotterdam: Array.from({ length: 7 }, (_, i) => ({
            id: 100 + i,
            name: 'Gemeentewater Rotterdam',
            association: 'HSV Groot Rotterdam',
            // Voeg hier eventueel een standaardafbeelding toe voor 'Gemeentewater Rotterdam' als deze bestaat
            image: 'Kralingseplas', // Voorbeeld, pas dit aan naar de juiste afbeeldingsnaam
        })),
    });

    const [visibleSections, setVisibleSections] = useState({
        favorites: false,
        mySpots: false,
        wantToGo: false,
        rotterdam: false,
    });

    const [expandedFishLists, setExpandedFishLists] = useState({});
    const { darkMode } = useLocationSetting();

    const toggleFishList = (spotId) => {
        setExpandedFishLists(prev => ({
            ...prev,
            [spotId]: !prev[spotId]
        }));
    };

    const loadAllLocationData = useCallback(async () => {
        try {
            const keysToLoad = ['favorites', 'wantToGo'];
            const entries = await Promise.all(
                keysToLoad.map(async (key) => {
                    const json = await AsyncStorage.getItem(`@location_${key}`);
                    return [key, json ? JSON.parse(json) : []];
                })
            );
            const loadedGeneralData = Object.fromEntries(entries);

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

            const savedFishKeys = await AsyncStorage.getItem('savedFishKeys');
            let loadedFishCatches = [];
            if (savedFishKeys) {
                const fishKeys = JSON.parse(savedFishKeys);
                for (const key of fishKeys) {
                    const fishString = await AsyncStorage.getItem(key);
                    if (fishString) {
                        loadedFishCatches.push(JSON.parse(fishString));
                    }
                }
                loadedFishCatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }

            const mySpotsWithFish = loadedMarkers.map(marker => {
                const fishAtThisSpot = loadedFishCatches.filter(
                    fish => fish.location === marker.id
                );
                return {
                    ...marker,
                    fishCatches: fishAtThisSpot,
                };
            });
            mySpotsWithFish.sort((a, b) => a.title.localeCompare(b.title));

            setLocationData((prev) => ({
                ...prev,
                ...loadedGeneralData,
                mySpots: mySpotsWithFish,
            }));

        } catch (e) {
            console.error("Error loading all locations data:", e);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadAllLocationData);
        loadAllLocationData();
        return unsubscribe;
    }, [navigation, loadAllLocationData]);

    const toggleSection = (key) => {
        setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Verbeterde getImage functie die overeenkomt met WaterInfo.js
    const getImage = (imageName) => {
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
            "de Rotte": require("../images/deRotte.png"), // Aangepast naar "de Rotte" om overeen te komen met je JSON

            // Visafbeeldingen zijn hier niet direct nodig, maar kunnen worden toegevoegd indien nodig
        };
        return map[imageName] || require("../images/Kralingseplas.png"); // Fallback
    };

    const getFishCountText = (count) => {
        if (count === 0) {
            return "0 vissen gevangen";
        } else if (count === 1) {
            return "1 vis gevangen";
        } else {
            return `${count} vissen gevangen`;
        }
    };

    const renderMySpots = (spots) =>
        spots.map((spot) => (
            <View key={spot.id} style={[styles.mySpotContainer, darkMode && styles.mySpotContainerDark]}>
                <View style={styles.spotHeaderRow}>
                    <Ionicons name="location-outline" size={18} color={darkMode ? "#0096b2" : "#005f99"} style={styles.spotIcon} />
                    <View style={styles.spotTextContainer}>
                        <Text style={[styles.spotTitle, darkMode && styles.spotTitleDark]}>{spot.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.detailsButton, darkMode && styles.detailsButtonDark]}
                        onPress={() => navigation.navigate('SpotDetail', { spot: spot })}
                    >
                        <Text style={[styles.detailsButtonText, darkMode ? styles.detailsButtonTextDark : styles.detailsButtonTextLight]}>Details</Text>
                    </TouchableOpacity>
                </View>

                {spot.description ? <Text style={[styles.spotDescription, darkMode && styles.textLight]}>{spot.description}</Text> : null}

                <Pressable
                    style={styles.toggleFishListButton}
                    onPress={() => toggleFishList(spot.id)}
                >
                    <Text style={[styles.toggleFishListText, darkMode ? styles.toggleFishListTextDark : styles.toggleFishListTextLight]}>
                        Vissen ({getFishCountText(spot.fishCatches?.length || 0)}){' '}
                        <Ionicons
                            name={expandedFishLists[spot.id] ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={darkMode ? "#eee" : "#005f99"}
                            style={{ marginLeft: 2, marginBottom: -2 }}
                        />
                    </Text>
                </Pressable>

                {expandedFishLists[spot.id] && spot.fishCatches && spot.fishCatches.length > 0 ? (
                    <View style={[styles.fishListContainer, darkMode && styles.fishListContainerDark]}>
                        {spot.fishCatches.map((fish) => (
                            <View key={fish.id} style={[styles.fishItem, darkMode && styles.fishItemDark]}>
                                {fish.imageUris && fish.imageUris.length > 0 ? (
                                    <Image
                                        source={{ uri: fish.imageUris[0] }}
                                        style={styles.fishImage}
                                    />
                                ) : (
                                    <View style={styles.fishImagePlaceholder}>
                                        <Ionicons name="fish-outline" size={24} color="#888" />
                                    </View>
                                )}
                                <View style={styles.fishDetails}>
                                    <Text style={[styles.fishTitle, darkMode && styles.textAccent]}>{fish.title}</Text>
                                    <Text style={[styles.fishDate, darkMode && styles.textLight]}>
                                        {new Date(fish.timestamp).toLocaleDateString()}
                                    </Text>
                                    <Text style={[styles.fishSpecies, darkMode && styles.textLight]}>{fish.species}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : expandedFishLists[spot.id] ? (
                    <Text style={[styles.emptyFishText, darkMode && styles.textLight]}>(Nog geen vissen gevangen op deze spot)</Text>
                ) : null}
            </View>
        ));

    const renderStandardSpots = (spots) =>
        spots.map((spot) => (
            <Pressable
                key={spot.id}
                style={[styles.spotRow, darkMode && styles.spotRowDark]}
                onPress={() => navigation.navigate('WaterInfo', { waterName: spot.name })}
            >
                <Text style={[styles.spotTitle, darkMode && styles.spotTitleDark]}>{spot.name}</Text>
                {spot.images && spot.images.length > 0 && (
                    <Image source={getImage(spot.images[0])} style={styles.image} />
                )}
                {spot.image && !spot.images && (
                    <Image source={getImage(spot.image)} style={styles.image} />
                )}
            </Pressable>
        ));

    // Deze functie wordt niet gebruikt in de huidige render, maar is hier voor de volledigheid
    const renderWaterItems = (items) =>
        items.map((item) => (
            <View key={item.id} style={styles.waterItem}>
                <Text style={styles.waterTitle}>{item.name}</Text>
                <Text style={styles.waterSubtitle}>{item.association}</Text>
            </View>
        ));

    return (
        <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
            <View style={styles.paddingBottom} >
                <Text style={[styles.title, darkMode && styles.textAccent]}>Locaties</Text>

                <Pressable style={styles.sectionHeader} onPress={() => toggleSection('mySpots')}>
                    <Text style={styles.sectionIcon}>⭐</Text>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Mijn spots</Text>
                    <Text style={styles.arrow}>{visibleSections.mySpots ? '▲' : '▼'}</Text>
                </Pressable>
                {visibleSections.mySpots && (
                    locationData.mySpots.length === 0 ? (
                        <Text style={styles.emptyText}>(Nog geen spots toegevoegd)</Text>
                    ) : (
                        renderMySpots(locationData.mySpots)
                    )
                )}

                <Pressable style={styles.sectionHeader} onPress={() => toggleSection('favorites')}>
                    <Text style={styles.sectionIcon}>❤️</Text>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Favorieten</Text>
                    <Text style={styles.arrow}>{visibleSections.favorites ? '▲' : '▼'}</Text>
                </Pressable>
                {visibleSections.favorites && (
                    locationData.favorites.length === 0 ? (
                        <Text style={styles.emptyText}>(Nog geen favorieten toegevoegd)</Text>
                    ) : (
                        renderStandardSpots(locationData.favorites)
                    )
                )}

                <Pressable style={styles.sectionHeader} onPress={() => toggleSection('wantToGo')}>
                    <Text style={styles.sectionIcon}>🚩</Text>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Wil ik heen</Text>
                    <Text style={styles.arrow}>{visibleSections.wantToGo ? '▲' : '▼'}</Text>
                </Pressable>
                {visibleSections.wantToGo && (
                    locationData.wantToGo.length === 0 ? (
                        <Text style={styles.emptyText}>(Nog geen plekken toegevoegd)</Text>
                    ) : (
                        renderStandardSpots(locationData.wantToGo)
                    )
                )}
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#181818',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#004a99',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#cce0f5',
        borderBottomWidth: 1,
        paddingVertical: 12,
        marginTop: 10,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    sectionHeaderDark: {
        borderBottomColor: '#0096b2',
        borderBottomWidth: 1.5,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    sectionIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004a99',
        flex: 1,
    },
    sectionTitleDark: {
        color: '#0096b2',
    },
    arrow: {
        color: '#004a99',
        fontSize: 16,
    },
    arrowDark: {
        color: '#0096b2',
    },
    spotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f4c873',
        paddingVertical: 10,
        gap: 12,
        marginLeft: 20,
        paddingRight: 10,
        backgroundColor: 'transparent',
        borderRadius: 0,
    },
    spotRowDark: {
        borderBottomColor: '#0096b2',
        borderBottomWidth: 1.5,
        borderRadius: 8,
    },
    spotTitle: {
        fontSize: 16,
        color: '#f4a300',
        fontWeight: '600',
        flex: 1,
    },
    spotTitleDark: {
        color: '#0096b2',
    },
    spotDescription: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flexShrink: 1,
        marginBottom: 5,
    },
    textLight: {
        color: '#eee',
    },
    textAccent: {
        color: '#0096b2',
    },
    spotIcon: {
        marginRight: 5,
    },
    image: {
        width: 100,
        height: 70,
        borderRadius: 4,
    },
    waterItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#cce0f5',
        paddingVertical: 10,
        marginLeft: 20,
    },
    waterItemDark: {
        borderBottomColor: '#0096b2',
    },
    waterTitle: {
        fontSize: 16,
        color: '#004a99',
    },
    waterSubtitle: {
        fontSize: 14,
        color: '#004a99',
        fontStyle: 'italic',
    },
    emptyText: {
        marginLeft: 20,
        paddingVertical: 10,
        color: '#888',
        fontStyle: 'italic',
    },
    emptyFishText: {
        marginLeft: 40,
        paddingVertical: 5,
        color: '#888',
        fontStyle: 'italic',
    },

    mySpotContainer: {
        backgroundColor: '#f0faff',
        borderRadius: 8,
        marginVertical: 5,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0f2f7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mySpotContainerDark: {
        backgroundColor: '#000',
        borderColor: '#0096b2',
        borderWidth: 1.5,
    },
    spotHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    spotTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    fishCountText: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
        fontStyle: 'italic',
    },
    detailsButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    detailsButtonDark: {
        backgroundColor: '#0096b2',
    },
    detailsButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    detailsButtonTextLight: {
        color: '#fff',
    },
    detailsButtonTextDark: {
        color: '#232323',
    },
    fishListContainer: {
        marginTop: 10,
        borderTopColor: '#ccecf2',
        borderTopWidth: 1,
        paddingTop: 10,
        marginLeft: 10,
    },
    fishListContainerDark: {
        backgroundColor: '#232323',
        borderTopColor: '#0096b2',
        borderTopWidth: 1.5,
    },
    fishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
    },
    fishItemDark: {
        backgroundColor: '#000',
    },
    fishImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 10,
        resizeMode: 'cover',
    },
    fishImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 10,
        backgroundColor: '#e9f8f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fishDetails: {
        flex: 1,
    },
    fishTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#005f99',
    },
    fishTitleDark: {
        color: '#0096b2',
    },
    fishDate: {
        fontSize: 12,
        color: '#666',
    },
    fishSpecies: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
    },
    paddingBottom: {
        paddingBottom: 30
    },
});