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

const FishScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { fish } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>

            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.title}>{fish.naam}</Text>
            </View>

            {/* SCROLLBARE INHOUD */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {fish.afbeelding_url ? (
                    <Image
                        source={{ uri: fish.afbeelding_url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>Geen afbeelding beschikbaar</Text>
                    </View>
                )}

                <View style={styles.card}>
                    <Info label="Leefomgeving" value={fish.leefomgeving} />
                    <Info label="Aas" value={fish.aas} />
                    <Info label="Hengeltype" value={fish.hengeltype} />
                    <Info label="Lengte (cm)" value={`${fish.lengte_cm.min} - ${fish.lengte_cm.max}`} />
                    <Info label="Gewicht (kg)" value={`${fish.gewicht_kg.min} - ${fish.gewicht_kg.max}`} />
                    <Info label="Moeilijkheidsgraad" value={fish.moeilijkheidsgraad} />
                    <Info label="Beste seizoen" value={fish.seizoen} />
                    {fish.duurzaam_vangen && (
                        <Info
                            label="Duurzaam te vangen"
                            value={fish.duurzaam_vangen}
                            multiline={true}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Info = ({ label, value, multiline }) => (
    <View style={styles.section}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={[styles.value, multiline && styles.multilineValue]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#e0f2fe',
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
    placeholderText: {
        color: '#475569',
        fontStyle: 'italic',
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
    section: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    value: {
        fontSize: 16,
        color: '#1e293b',
        marginTop: 4,
        lineHeight: 24,
    },
    multilineValue: {
        textAlign: 'justify',
    },
});

export default FishScreen;
