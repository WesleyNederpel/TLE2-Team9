import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import vissen from '../assets/fish_data_of_the_netherlands.json'; // pas pad aan als nodig

export default function ProfileScreen() {
    const navigation = useNavigation();

    const handlePress = () => {
        const karper = vissen.find(v => v.naam === 'Karper');
        if (karper) {
            navigation.navigate('FishScreen', { fish: karper });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <TouchableOpacity style={styles.button} onPress={handlePress}>
                <Text style={styles.buttonText}>Bekijk Karper</Text>
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
        borderRadius: 8
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    }
});
