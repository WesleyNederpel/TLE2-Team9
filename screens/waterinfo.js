import React from "react";
import {Pressable, StyleSheet, Text, View, Image, ScrollView,} from "react-native";

export default function WaterInfo({route}) {
    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.headerImageContainer}>
                    <Image
                        source={require("../images/Kralingseplas.png")}
                        style={styles.headerImage}
                    />
                </View>
                <Text style={styles.h1}>Kralingseplas</Text>
                <View style={styles.underline}/>
                <Text style={styles.p}>De Kralingse Plas is een populair recreatiegebied in Rotterdam, gelegen in de
                    wijk
                    Kralingen. Het meer is omgeven door een prachtig park en biedt volop mogelijkheden voor ontspanning,
                    zoals wandelen, fietsen, picknicken, zeilen en zwemmen.</Text>

                <View style={styles.fishPassImageContainer}>
                    <Image
                        source={require("../images/fishpass.png")}
                        style={styles.fishImage}
                    />
                </View>

                <Text style={styles.h1}>Vispas nodig!</Text>
                <View style={styles.underline}/>
                <Text style={styles.p}>Voor deze locatie heb je nog niet een geldige vispas, haal de pas hier voordat je
                    gaat vissen!</Text>

                <Pressable>
                    <Text>Mijn reizen</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 10,
    },
    h1: {
        color: '#E5A83F',
        fontSize: 24,
        fontWeight: 'bold',
    },
    p: {
        fontSize: 12,
        fontWeight: 'regular'
    },
    headerImageContainer: {
        width: '100%',
        height: '250',
    },
    fishPassImageContainer: {
        width: '100%',
        height: '100',
        marginTop: 20,
        marginBottom: 10,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    fishImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 10,
    },
    underline: {
        height: 2,
        backgroundColor: '#E5A83F',
        width: '100%',
        marginBottom: 2,
    },

});