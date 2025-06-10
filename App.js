// App.js
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import HomeScreen from './components/HomeScreen'; // Adjust the path based on where you save HomeScreen.jsx

export default function App() {
    return (
        <View style={styles.container}>
            <HomeScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // You might want to add padding or a safe area view depending on your app design
    },
});