import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileScreen() {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profiel</Text>
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
});
