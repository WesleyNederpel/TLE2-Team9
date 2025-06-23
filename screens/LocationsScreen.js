import { useEffect, useState, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function LocationsScreen({ navigation }) {

    const [locationData, setLocationData] = useState({
        favorites: [],
        mySpots: [],
        wantToGo: [],
        rotterdam: Array.from({ length: 7 }, (_, i) => ({
            id: 100 + i,
            name: 'Gemeentewater Rotterdam',
            association: 'HSV Groot Rotterdam',
        })),
    });

    const [visibleSections, setVisibleSections] = useState({
        favorites: false,
        mySpots: false,
        wantToGo: false,
        rotterdam: false,
    });

    const [expandedFishLists, setExpandedFishLists] = useState({});

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

    const getImage = (filename) => {
        switch (filename) {
            case "Kralingseplas.png":
                return require("../images/Kralingseplas.png");
            case "Wijnhaven.png":
                return require("../images/Wijnhaven.png");
            default:
                return require("../images/Kralingseplas.png");
        }
    };

    // NIEUW: Helper functie voor dynamische vistekst
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
            <View key={spot.id} style={styles.mySpotContainer}>
                {/* De header voor de spotnaam en details knop */}
                <View style={styles.spotHeaderRow}>
                    <Ionicons name="location-outline" size={18} color="#005f99" style={styles.spotIcon} />
                    <View style={styles.spotTextContainer}>
                        <Text style={styles.spotTitle}>{spot.title}</Text>
                        {/* AANGEPAST: Gebruik dynamische tekst */}
                        <Text style={styles.fishCountText}>
                            {getFishCountText(spot.fishCatches?.length || 0)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => navigation.navigate('SpotDetail', { spot: spot })}
                    >
                        <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                </View>

                {/* FIX: Zorg dat spot.description altijd in een Text component zit en alleen rendert als het bestaat */}
                {spot.description ? <Text style={styles.spotDescription}>{spot.description}</Text> : null}

                <Pressable
                    style={styles.toggleFishListButton}
                    onPress={() => toggleFishList(spot.id)}
                >
                    {/* AANGEPAST: Gebruik dynamische tekst voor het aantal vissen in de toggle knop */}
                    <Text style={styles.toggleFishListText}>
                        Vissen ({getFishCountText(spot.fishCatches?.length || 0)}) {expandedFishLists[spot.id] ? '▲' : '▼'}
                    </Text>
                </Pressable>


                {expandedFishLists[spot.id] && spot.fishCatches && spot.fishCatches.length > 0 ? (
                    <View style={styles.fishListContainer}>
                        {spot.fishCatches.map((fish) => (
                            <View key={fish.id} style={styles.fishCatchItem}>
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
                                    <Text style={styles.fishTitle}>{fish.title}</Text>
                                    <Text style={styles.fishDate}>
                                        {new Date(fish.timestamp).toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.fishSpecies}>{fish.species}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : expandedFishLists[spot.id] ? (
                    <Text style={styles.emptyFishText}>(Nog geen vissen gevangen op deze spot)</Text>
                ) : null}
            </View>
        ));

    const renderStandardSpots = (spots) =>
        spots.map((spot) => (
            <Pressable
                key={spot.id}
                style={styles.spotRow}
                onPress={() => spot.screen && navigation.navigate('WaterInfo', { waterName: spot.name })}
            >
                <Text style={styles.spotTitle}>{spot.name}</Text>
                {spot.images?.length > 0 && (
                    <Image source={getImage(spot.images?.[0])} style={styles.image} />
                )}
            </Pressable>
        ));

    const renderWaterItems = (items) =>
        items.map((item) => (
            <View key={item.id} style={styles.waterItem}>
                <Text style={styles.waterTitle}>{item.name}</Text>
                <Text style={styles.waterSubtitle}>{item.association}</Text>
            </View>
        ));

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Locaties</Text>

            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('favorites')}>
                <Text style={styles.sectionIcon}>❤️</Text>
                <Text style={styles.sectionTitle}>Favorieten</Text>
                <Text style={styles.arrow}>{visibleSections.favorites ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.favorites && (
                locationData.favorites.length === 0 ? (
                    <Text style={styles.emptyText}>(Nog geen favorieten toegevoegd)</Text>
                ) : (
                    renderStandardSpots(locationData.favorites)
                )
            )}

            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('mySpots')}>
                <Text style={styles.sectionIcon}>⭐</Text>
                <Text style={styles.sectionTitle}>Mijn spots</Text>
                <Text style={styles.arrow}>{visibleSections.mySpots ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.mySpots && (
                locationData.mySpots.length === 0 ? (
                    <Text style={styles.emptyText}>(Nog geen spots toegevoegd)</Text>
                ) : (
                    renderMySpots(locationData.mySpots)
                )
            )}

            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('wantToGo')}>
                <Text style={styles.sectionIcon}>🚩</Text>
                <Text style={styles.sectionTitle}>Wil ik heen</Text>
                <Text style={styles.arrow}>{visibleSections.wantToGo ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.wantToGo && (
                locationData.wantToGo.length === 0 ? (
                    <Text style={styles.emptyText}>(Nog geen plekken toegevoegd)</Text>
                ) : (
                    renderStandardSpots(locationData.wantToGo)
                )
            )}

            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('rotterdam')}>
                <Text style={styles.sectionIcon}>📍</Text>
                <Text style={styles.sectionTitle}>Gemeentewater Rotterdam</Text>
                <Text style={styles.arrow}>{visibleSections.rotterdam ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.rotterdam && renderWaterItems(locationData.rotterdam)}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
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
    arrow: {
        color: '#004a99',
        fontSize: 16,
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
    },
    spotTitle: {
        fontSize: 16,
        color: '#f4a300',
        fontWeight: '600',
        flex: 1,
    },
    spotDescription: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flexShrink: 1,
        marginBottom: 5,
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
    detailsButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleFishListButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopColor: '#e0f2f7',
        borderTopWidth: 1,
        marginTop: 5,
        marginBottom: -5,
    },
    toggleFishListText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#005f99',
    },
    fishListContainer: {
        marginTop: 10,
        borderTopColor: '#ccecf2',
        borderTopWidth: 1,
        paddingTop: 10,
        marginLeft: 10,
    },
    fishCatchItem: {
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
    fishDate: {
        fontSize: 12,
        color: '#666',
    },
    fishSpecies: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
    },
});