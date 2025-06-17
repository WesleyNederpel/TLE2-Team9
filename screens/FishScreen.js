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
import Ionicons from 'react-native-vector-icons/Ionicons'; // Voor pijltje

const FishScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { fish } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Terugknop */}
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1e40af" />
                </Pressable>

                <Text style={styles.title}>{fish.naam}</Text>

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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Info = ({ label, value }) => (
    <View style={styles.section}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 10,
        flexGrow: 1,
    },
    backButton: {
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 20,
        textAlign: 'center',
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
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    value: {
        fontSize: 16,
        color: '#0f172a',
        marginTop: 4,
    },
});

export default FishScreen;
