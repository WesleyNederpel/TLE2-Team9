import React from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';

// Helperfunctie om datums te formatteren
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', options);
};

export default function EventScreen({ route }) {
    // Haal het volledige evenement object op uit de navigatieparameters
    const { event } = route.params;

    // Toon een foutmelding als het evenement niet gevonden is
    if (!event) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Evenement niet gevonden.</Text>
            </View>
        );
    }

    // Functie om de website te openen
    const openWebsite = () => {
        if (event.website) {
            Linking.openURL(event.website).catch(err =>
                console.error("Kon de URL niet openen", err)
            );
        }
    };

    // Functie om een routebeschrijving te openen
    const openDirections = async () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const label = encodeURIComponent(event.naam); // Naam van het evenement, gecodeerd voor URL
        const address = encodeURIComponent(event.locatie); // Volledige adres, gecodeerd voor URL

        let url;
        if (Platform.OS === 'ios') {
            // Probeer Google Maps te openen op iOS
            const googleMapsUrl = `comgooglemaps://?q=${address}&zoom=15&directionsmode=driving`;
            const appleMapsUrl = `maps:0,0?q=${label}@${address}`;

            try {
                const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
                if (canOpenGoogleMaps) {
                    url = googleMapsUrl;
                } else {
                    // Val terug op Apple Maps als Google Maps niet geïnstalleerd is
                    url = appleMapsUrl;
                }
            } catch (error) {
                console.error("Fout bij controleren Google Maps beschikbaarheid op iOS:", error);
                url = appleMapsUrl; // Fallback bij fout
            }
        } else {
            // Android gebruikt direct de Google Maps web-intent URL
            url = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
        }

        Linking.openURL(url).catch(err =>
            console.error("Kon de route niet openen", err)
        );
    };


    // Helper om de plaatsnaam uit de locatie te halen (dezelfde als in CommunityScreen)
    const getCityFromLocation = (locationString) => {
        const parts = locationString.split(', ');
        if (parts.length > 1) {
            const cityPartMatch = parts.find(part => part.match(/\d{4}\s?[A-Z]{2}\s+.+/));
            if (cityPartMatch) {
                const city = cityPartMatch.split(' ').slice(2).join(' ');
                return city;
            }
            const lastPart = parts[parts.length - 1];
            if (!lastPart.match(/\d{4}\s?[A-Z]{2}/)) {
                return lastPart;
            }
        }
        return locationString.split(',').pop().trim();
    };

    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
            {event.afbeelding && (
                <Image
                    source={{ uri: event.afbeelding }}
                    style={styles.eventImage}
                    accessibilityLabel={`Afbeelding van ${event.naam}`}
                />
            )}

            <View style={styles.eventDetailsCard}>
                <Text style={styles.eventName}>{event.naam}</Text>
                <Text style={styles.eventDate}>
                    {formatDate(event.datum)} van {event.begintijd} tot {event.eindtijd}
                </Text>
                <Text style={styles.eventLocation}>Locatie: {event.locatie}</Text>
                <Text style={styles.eventCity}>Plaats: {getCityFromLocation(event.locatie)}</Text>
                <Text style={styles.eventCosts}>Kosten: {event.kosten}</Text>

                <Text style={styles.eventDescriptionTitle}>Beschrijving:</Text>
                <Text style={styles.eventDescription}>{event.beschrijving}</Text>

                {/* Nieuwe sectie voor extra details */}
                <View style={styles.additionalDetailsSection}>
                    {event.organisatie && <Text style={styles.detailText}><Text style={styles.detailLabel}>Organisatie:</Text> {event.organisatie}</Text>}
                    {event.contactpersoon && <Text style={styles.detailText}><Text style={styles.detailLabel}>Contactpersoon:</Text> {event.contactpersoon}</Text>}
                    {event.contactemail && <Text style={styles.detailText}><Text style={styles.detailLabel}>E-mail:</Text> {event.contactemail}</Text>}
                    {event.contacttelefoon && <Text style={styles.detailText}><Text style={styles.detailLabel}>Telefoon:</Text> {event.contacttelefoon}</Text>}
                    {event.discipline && <Text style={styles.detailText}><Text style={styles.detailLabel}>Discipline:</Text> {event.discipline}</Text>}
                    {event.water && <Text style={styles.detailText}><Text style={styles.detailLabel}>Water:</Text> {event.water}</Text>}
                    {event.score_eenheden && <Text style={styles.detailText}><Text style={styles.detailLabel}>Score-eenheden:</Text> {event.score_eenheden}</Text>}
                    {event.gebruikt_app && <Text style={styles.detailText}><Text style={styles.detailLabel}>Gebruikt app:</Text> {event.gebruikt_app}</Text>}
                </View>

                {/* Onderdelen sectie */}
                {event.onderdelen && event.onderdelen.length > 0 && (
                    <View style={styles.onderdelenSection}>
                        <Text style={styles.onderdelenTitle}>Onderdelen:</Text>
                        {event.onderdelen.map((onderdeel, idx) => (
                            <View key={idx} style={styles.onderdeelItem}>
                                <Text style={styles.onderdeelName}>{onderdeel.naam}</Text>
                                {onderdeel.niveau && <Text style={styles.onderdeelDetail}>Niveau: {onderdeel.niveau}</Text>}
                                {onderdeel.geslacht && <Text style={styles.onderdeelDetail}>Geslacht: {onderdeel.geslacht}</Text>}
                                {onderdeel.leeftijdsgroep && <Text style={styles.onderdeelDetail}>Leeftijdsgroep: {onderdeel.leeftijdsgroep}</Text>}
                                {onderdeel.inschrijfgeld_per_basisteamlid && <Text style={styles.onderdeelDetail}>Inschrijfgeld: {onderdeel.inschrijfgeld_per_basisteamlid}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {event.website && (
                    <TouchableOpacity style={styles.websiteButton} onPress={openWebsite}>
                        <Text style={styles.websiteButtonText}>Bezoek Website</Text>
                    </TouchableOpacity>
                )}
                {event.locatie && (
                    <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
                        <Text style={styles.directionsButtonText}>Toon Route</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#f0f2f5', // Lichte grijze achtergrond
    },
    contentContainer: {
        paddingBottom: 20, // Padding aan de onderkant
    },
    eventImage: {
        width: '100%',
        height: 250, // Grotere hoogte voor de hoofdafbeelding
        resizeMode: 'cover',
        marginBottom: 20,
    },
    eventDetailsCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    eventName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1e3a8a', // Donkerblauwe kleur
        marginBottom: 10,
    },
    eventDate: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    eventLocation: {
        fontSize: 15,
        color: '#666',
        marginBottom: 5,
    },
    eventCity: {
        fontSize: 15,
        color: '#666',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    eventCosts: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    eventDescriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginTop: 15,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    eventDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
    },
    // Nieuwe stijlen voor aanvullende details
    additionalDetailsSection: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 5,
    },
    detailLabel: {
        fontWeight: 'bold',
    },
    // Nieuwe stijlen voor onderdelen sectie
    onderdelenSection: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
        marginBottom: 20,
    },
    onderdelenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 10,
    },
    onderdeelItem: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#cce5ff', // Lichte blauwe accentkleur
    },
    onderdeelName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    onderdeelDetail: {
        fontSize: 14,
        color: '#555',
    },
    websiteButton: {
        backgroundColor: '#0096b2', // Blauwgroene kleur
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10, // Voeg marge toe onder de website knop
    },
    websiteButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    directionsButton: {
        backgroundColor: '#1e3a8a', // Donkerblauwe kleur, anders dan de website knop
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 0, // Geen extra marge als het direct onder de vorige knop staat
    },
    directionsButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    }
});
