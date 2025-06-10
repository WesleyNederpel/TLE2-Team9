// HomeScreen.jsx
import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* De MapView vult nu de beschikbare ruimte binnen de container */}
            <MapView
                initialRegion={{
                    latitude: 51.9173619,
                    longitude: 4.4839952,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                style={styles.map} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:80,
        paddingBottom:50,
         // Voeg hier de gewenste padding toe
        backgroundColor: 'lightblue', // Optioneel: om de padding te visualiseren
    },
    map: {
        flex: 1, // Zorgt ervoor dat de MapView de beschikbare ruimte vult
        // Let op: StyleSheet.absoluteFill hier niet gebruiken als je padding op de container hebt
    },
});