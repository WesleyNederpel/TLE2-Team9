import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
// Import your GeoJSON data. Adjust the path if necessary.
import waterGeoJSON from '../assets/rotterdam_water_bodies.json';

const MapScreen = () => {
    // Define an initial region for Rotterdam (approximate center)
    const region = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // Function to convert coordinates from [lng, lat] to {latitude, longitude}
    const convertCoords = (coordsArray) =>
        coordsArray.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));

    // Render Polygon overlays for each water body feature in the GeoJSON
    const renderPolygons = () => {
        if (!waterGeoJSON || !waterGeoJSON.features) {
            return null;
        }

        return waterGeoJSON.features.map((feature, index) => {
            const { type } = feature.geometry;

            // If the feature is a Polygon, use its first linear ring.
            if (type === 'Polygon') {
                const coords = convertCoords(feature.geometry.coordinates[0]);
                return (
                    <Polygon
                        key={index}
                        coordinates={coords}
                        fillColor="rgba(0, 150, 255, 0.3)"
                        strokeColor="rgba(0, 150, 255, 0.8)"
                    />
                );
            }

            // If the feature is a MultiPolygon, iterate over each polygon.
            if (type === 'MultiPolygon') {
                return feature.geometry.coordinates.map((polygonCoords, polyIndex) => {
                    const coords = convertCoords(polygonCoords[0]); // using the first ring for each polygon part
                    return (
                        <Polygon
                            key={`${index}-${polyIndex}`}
                            coordinates={coords}
                            fillColor="rgba(0, 150, 255, 0.3)"
                            strokeColor="rgba(0, 150, 255, 0.8)"
                        />
                    );
                });
            }

            return null;
        });
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={region}>
                {renderPolygons()}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapScreen;