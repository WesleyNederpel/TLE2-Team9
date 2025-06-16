import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationsScreen({ navigation }) {
    const [locatieData, setLocatieData] = useState({
        favorieten: [],
        mijnSpots: [],
        wilIkHeen: [],
        rotterdam: Array.from({ length: 7 }, (_, i) => ({
            id: 100 + i,
            naam: 'Gemeentewater Rotterdam',
            vereniging: 'HSV Groot Rotterdam',
        })),
    });

    const [visibleSections, setVisibleSections] = useState({
        favorieten: true,
        mijnSpots: false,
        wilIkHeen: false,
        rotterdam: true,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const keys = ['favorieten', 'mijnSpots', 'wilIkHeen'];
                const entries = await Promise.all(
                    keys.map(async (key) => {
                        const json = await AsyncStorage.getItem(`@locatie_${key}`);
                        return [key, json ? JSON.parse(json) : []];
                    })
                );

                setLocatieData((prev) => ({
                    ...prev,
                    ...Object.fromEntries(entries),
                }));
            } catch (e) {
                console.error("Fout bij laden van locaties:", e);
            }
        };

        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    const toggleSection = (key) => {
        setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const renderSpots = (spots) =>
        spots.map((spot) => (
            <Pressable
                key={spot.id}
                style={styles.spotRow}
                onPress={() => spot.screen && navigation.navigate(spot.screen)}
            >
                <Text style={styles.spotTitle}>{spot.naam}</Text>
                {spot.afbeeldingen?.length > 0 && (
                    <Image source={spot.afbeeldingen[0]} style={styles.image} />
                )}
            </Pressable>
        ));

    const renderWaterItems = (items) =>
        items.map((item) => (
            <View key={item.id} style={styles.waterItem}>
                <Text style={styles.waterTitle}>{item.naam}</Text>
                <Text style={styles.waterSubtitle}>{item.vereniging}</Text>
            </View>
        ));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Locaties</Text>

            {/* Favorieten */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('favorieten')}>
                <Text style={styles.sectionIcon}>❤️</Text>
                <Text style={styles.sectionTitle}>Favorieten</Text>
                <Text style={styles.arrow}>{visibleSections.favorieten ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.favorieten && renderSpots(locatieData.favorieten)}

            {/* Mijn spots */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('mijnSpots')}>
                <Text style={styles.sectionIcon}>⭐</Text>
                <Text style={styles.sectionTitle}>Mijn spots</Text>
                <Text style={styles.arrow}>{visibleSections.mijnSpots ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.mijnSpots && renderSpots(locatieData.mijnSpots)}

            {/* Wil ik heen */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('wilIkHeen')}>
                <Text style={styles.sectionIcon}>🚩</Text>
                <Text style={styles.sectionTitle}>Wil ik heen</Text>
                <Text style={styles.arrow}>{visibleSections.wilIkHeen ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.wilIkHeen && (
                locatieData.wilIkHeen.length === 0 ? (
                    <Text style={styles.emptyText}>(Nog geen plekken toegevoegd)</Text>
                ) : (
                    renderSpots(locatieData.wilIkHeen)
                )
            )}

            {/* Rotterdam */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('rotterdam')}>
                <Text style={styles.sectionIcon}>📍</Text>
                <Text style={styles.sectionTitle}>Rotterdam</Text>
                <Text style={styles.arrow}>{visibleSections.rotterdam ? '▲' : '▼'}</Text>
            </Pressable>
            {visibleSections.rotterdam && renderWaterItems(locatieData.rotterdam)}
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
