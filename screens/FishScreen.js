import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    Pressable
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLocationSetting } from '../LocationSettingContext';

const FishScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { fish } = route.params;
    const { darkMode } = useLocationSetting();

    return (
        <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
            <View style={[styles.header, darkMode && styles.headerDark]}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.title}>{fish.naam}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {fish.afbeelding_url ? (
                    <Image
                        source={{ uri: fish.afbeelding_url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={[styles.placeholderImage, darkMode && styles.placeholderImageDark]}>
                        <Text style={[styles.placeholderText, darkMode && styles.textLight]}>Geen afbeelding beschikbaar</Text>
                    </View>
                )}

                <View style={[styles.card, darkMode && styles.cardDark]}>
                    <Info label="Leefomgeving" value={fish.leefomgeving} darkMode={darkMode} />
                    <Info label="Aas" value={fish.aas} darkMode={darkMode} />
                    <Info label="Hengeltype" value={fish.hengeltype} darkMode={darkMode} />
                    <Info label="Lengte (cm)" value={`${fish.lengte_cm.min} - ${fish.lengte_cm.max}`} darkMode={darkMode} />
                    <Info label="Gewicht (kg)" value={`${fish.gewicht_kg.min} - ${fish.gewicht_kg.max}`} darkMode={darkMode} />
                    <Info label="Moeilijkheidsgraad" value={fish.moeilijkheidsgraad} darkMode={darkMode} />
                    <Info label="Beste seizoen" value={fish.seizoen} darkMode={darkMode} />
                    {fish.duurzaam_vangen && (
                        <Info
                            label="Duurzaam te vangen"
                            value={fish.duurzaam_vangen}
                            multiline={true}
                            darkMode={darkMode}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Info = ({ label, value, multiline, darkMode }) => (
    <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[styles.label, darkMode && styles.labelDark]}>{label}:</Text>
        <Text style={[
            styles.value,
            multiline && styles.multilineValue,
            darkMode && styles.valueDark
        ]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#e0f2fe',
    },
    safeAreaDark: {
        backgroundColor: '#181818',
    },
    header: {
        left: 0,
        right: 0,
        zIndex: 10,
        height: 100,
        backgroundColor: '#0096b2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerDark: {
        backgroundColor: '#00505e',
    },
    scrollContent: {
        paddingTop: 80,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 10,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        paddingTop: 40,
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        marginBottom: 25,
    },
    placeholderImage: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        backgroundColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    placeholderImageDark: {
        backgroundColor: '#232323',
    },
    placeholderText: {
        color: '#475569',
        fontStyle: 'italic',
    },
    textLight: {
        color: '#fff',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#232323',
    },
    section: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 10,
    },
    sectionDark: {
        borderBottomColor: '#333',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    labelDark: {
        color: '#0096b2',
    },
    value: {
        fontSize: 16,
        color: '#1e293b',
        marginTop: 4,
        lineHeight: 24,
    },
    valueDark: {
        color: '#fff',
    },
    multilineValue: {
        textAlign: 'left',
    },
});

export default FishScreen;
