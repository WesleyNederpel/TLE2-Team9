import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import vissen from '../assets/fish_data_of_the_netherlands.json'; // pas pad aan indien nodig

export default function ProfileScreen() {
    const navigation = useNavigation();

    const handlePress = (visNaam) => {
        const vis = vissen.find(v => v.naam.toLowerCase() === visNaam.toLowerCase());
        if (vis) {
            navigation.navigate('FishScreen', { fish: vis });
        } else {
            console.warn(`Vis "${visNaam}" niet gevonden`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profiel</Text>

            <TouchableOpacity style={styles.button} onPress={() => handlePress('Karper')}>
                <Text style={styles.buttonText}>Bekijk Karper</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handlePress('Snoek')}>
                <Text style={styles.buttonText}>Bekijk Snoek</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handlePress('Meerval')}>
                <Text style={styles.buttonText}>Bekijk Meerval</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handlePress('Baars')}>
                <Text style={styles.buttonText}>Bekijk Baars</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handlePress('Zalm')}>
                <Text style={styles.buttonText}>Bekijk Zalm</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        marginBottom: 20
    },
    button: {
        backgroundColor: '#1e3a8a',
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
        width: '80%',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    }
});
