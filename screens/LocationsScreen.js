import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationsScreen({ navigation }) {

    // useEffect(() => {
    //     const clearStorage = async () => {
    //         try {
    //             await AsyncStorage.clear();
    //             console.log('✅ AsyncStorage is cleared.');
    //         } catch (e) {
    //             console.error('❌ Error clearing AsyncStorage:', e);
    //         }
    //     };
    //
    //     clearStorage();
    // }, []);

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
        favorites: true,
        mySpots: false,
        wantToGo: false,
        rotterdam: true,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const keys = ['favorites', 'mySpots', 'wantToGo'];
                const entries = await Promise.all(
                    keys.map(async (key) => {
                        const json = await AsyncStorage.getItem(`@location_${key}`);
                        return [key, json ? JSON.parse(json) : []];
                    })
                );

                setLocationData((prev) => ({
                    ...prev,
                    ...Object.fromEntries(entries),
                }));
            } catch (e) {
                console.error("Error loading locations:", e);
            }
        };

        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    const toggleSection = (key) => {
        setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const getImage = (filename) => {
        // if (!filename) return null;
        switch (filename) {
            case "Kralingseplas.png":
                return require("../images/Kralingseplas.png");
            // add more files here if you use more images
            default:
                return require("../images/Kralingseplas.png");
        }
    };

    const renderSpots = (spots) =>
        spots.map((spot) => (
            <Pressable
                key={spot.id}
                style={styles.spotRow}
                onPress={() => spot.screen && navigation.navigate('WaterInfo')}
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
        <View style={styles.container}>
            <Text style={styles.title}>Locaties</Text>

            {/* Favorites */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('favorites')}>
                <Text style={styles.sectionIcon}>❤️</Text>
                <Text style={styles.sectionTitle}>Favorieten</Text>
                <Text style={styles.arrow}>{visibleSections.favorites ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.favorites && renderSpots(locationData.favorites)}

            {/* My Spots */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('mySpots')}>
                <Text style={styles.sectionIcon}>⭐</Text>
                <Text style={styles.sectionTitle}>Mijn spots</Text>
                <Text style={styles.arrow}>{visibleSections.mySpots ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.mySpots && renderSpots(locationData.mySpots)}

            {/* Want To Go */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('wantToGo')}>
                <Text style={styles.sectionIcon}>🚩</Text>
                <Text style={styles.sectionTitle}>Wil ik heen</Text>
                <Text style={styles.arrow}>{visibleSections.wantToGo ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.wantToGo && (
                locationData.wantToGo.length === 0 ? (
                    <Text style={styles.emptyText}>(Nog geen plekken toegevoegd)</Text>
                ) : (
                    renderSpots(locationData.wantToGo)
                )
            )}

            {/* Rotterdam */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('rotterdam')}>
                <Text style={styles.sectionIcon}>📍</Text>
                <Text style={styles.sectionTitle}>Rotterdam</Text>
                <Text style={styles.arrow}>{visibleSections.rotterdam ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.rotterdam && renderWaterItems(locationData.rotterdam)}
        </View>
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
    },
    spotTitle: {
        fontSize: 16,
        color: '#f4a300',
        fontWeight: '600',
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
        marginLeft: 12,
        color: '#888',
        fontStyle: 'italic',
    },
});
