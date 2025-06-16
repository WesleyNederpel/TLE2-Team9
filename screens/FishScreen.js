import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const FishScreen = () => {
    const route = useRoute();
    const { fish } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{fish.naam}</Text>
            {fish.afbeelding_url ? (
                <Image source={{ uri: fish.afbeelding_url }} style={styles.image} />
            ) : (
                <View style={styles.placeholderImage}><Text style={styles.placeholderText}>Geen afbeelding</Text></View>
            )}

            <View style={styles.section}>
                <Text style={styles.label}>Leefomgeving:</Text>
                <Text style={styles.value}>{fish.leefomgeving}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Aas:</Text>
                <Text style={styles.value}>{fish.aas}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Hengeltype:</Text>
                <Text style={styles.value}>{fish.hengeltype}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Lengte (cm):</Text>
                <Text style={styles.value}>{fish.lengte_cm.min} - {fish.lengte_cm.max}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Gewicht (kg):</Text>
                <Text style={styles.value}>{fish.gewicht_kg.min} - {fish.gewicht_kg.max}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Moeilijkheidsgraad:</Text>
                <Text style={styles.value}>{fish.moeilijkheidsgraad}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Beste seizoen:</Text>
                <Text style={styles.value}>{fish.seizoen}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f0f4f8'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1e3a8a',
        textAlign: 'center'
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    placeholderText: {
        color: '#475569'
    },
    section: {
        marginBottom: 12
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155'
    },
    value: {
        fontSize: 16,
        color: '#1e293b'
    }
});

export default FishScreen;