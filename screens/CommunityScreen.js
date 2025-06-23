import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import blogpostsData from '../data/blogposts.json';
import eventsData from '../data/events.json';

// Helperfunctie om datums te formatteren
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', options);
};

// Helperfunctie om de plaatsnaam uit de locatie te halen
const getCityFromLocation = (locationString) => {
    // Voorbeeld: "Strandweg 12, 1234 AB Vissersdorp"
    const parts = locationString.split(', ');
    if (parts.length > 1) {
        // Zoek het deel dat de postcode en plaatsnaam bevat
        const cityPartMatch = parts.find(part => part.match(/\d{4}\s?[A-Z]{2}\s+.+/));
        if (cityPartMatch) {
            // Splitst op spatie en neem alles na de postcode en letters (e.g., "Vissersdorp")
            const city = cityPartMatch.split(' ').slice(2).join(' ');
            return city;
        }
        // Fallback als geen postcode/plaats patroon gevonden is, probeer het laatste deel
        const lastPart = parts[parts.length - 1];
        if (!lastPart.match(/\d{4}\s?[A-Z]{2}/)) { // Als het laatste deel geen postcode is
            return lastPart;
        }
    }
    return locationString.split(',').pop().trim(); // Retourneer de laatste gecomma-scheide waarde als laatste redmiddel
};


export default function CommunityScreen() {
    const navigation = useNavigation();
    // State om bij te houden hoeveel blogs zichtbaar zijn
    // Begint met 5 blogs zichtbaar, aangezien de knop '5 nieuwe blogs' toont
    const [visibleBlogCount, setVisibleBlogCount] = useState(5);
    const blogsPerPage = 5; // Aantal blogs om per keer toe te voegen

    // Bepaal welke blogs getoond moeten worden
    const blogsToDisplay = blogpostsData.slice(0, visibleBlogCount);

    // Navigeert naar het BlogPostScreen en geeft de blog ID mee
    const handleBlogPress = (blogId) => {
        navigation.navigate('BlogPostScreen', { blogId: blogId });
    };

    // Navigeert naar het EventScreen en geeft het volledige evenement object mee
    const handleEventPress = (event) => {
        navigation.navigate('EventScreen', { event: event });
    };

    // Functie om meer blogs te laden
    const loadMoreBlogs = () => {
        setVisibleBlogCount(prevCount => prevCount + blogsPerPage);
    };

    return (
        // Gebruik ScrollView zodat de content scrollbaar is als er veel items zijn
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
            {/* Evenementen Sectie */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Evenementen</Text>
                {eventsData.map((event, index) => (
                    <TouchableOpacity
                        key={index} // Gebruik een unieke sleutel, bij voorkeur een 'id' van het evenement als die er was
                        style={styles.eventListItemButton} // Nieuwe stijl voor evenementen
                        onPress={() => handleEventPress(event)}
                    >
                        <View style={styles.eventTextContainer}>
                            <Text style={styles.eventTitle}>{event.naam}</Text>
                            <Text style={styles.eventSubtitle}>{formatDate(event.datum)} om {event.begintijd}</Text>
                            <Text style={styles.eventLocation}>{getCityFromLocation(event.locatie)}</Text>
                        </View>
                        {event.afbeelding && (
                            <Image
                                source={{ uri: event.afbeelding }}
                                style={styles.eventSmallImage} // Nieuwe stijl voor kleine afbeelding
                                accessibilityLabel={`Afbeelding van ${event.naam}`}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Blogs & Posts Sectie */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Blogs & Posts</Text>
                {blogsToDisplay.map((blog) => ( // Gebruik blogsToDisplay
                    <TouchableOpacity
                        key={blog.id} // Gebruik de unieke blog ID als sleutel
                        style={styles.listItemButton} // Gebruikt de originele stijl voor blogs
                        onPress={() => handleBlogPress(blog.id)}
                    >
                        <Text style={styles.listItemTitle}>{blog.title}</Text>
                        {/* Datum formatteren voor blogs */}
                        <Text style={styles.listItemSubtitle}>{blog.author} - {formatDate(blog.date)}</Text>
                        {blog.pinned && (
                            <View style={styles.pinIconContainer}>
                                <Ionicons name="bookmark" size={24} color="#f5a623" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
                {/* Toon de "Meer tonen" knop alleen als er nog meer blogs zijn om te laden */}
                {visibleBlogCount < blogpostsData.length && (
                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={loadMoreBlogs} // Roep de nieuwe loadMoreBlogs functie aan
                    >
                        <Text style={styles.showMoreButtonText}>Meer tonen</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    contentContainer: {
        padding: 20,
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 30,
    },
    section: {
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        textAlign: 'left',
        width: '100%',
    },
    listItemButton: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
        width: '100%',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#0096b2',
    },
    listItemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    listItemSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    eventListItemButton: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginVertical: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        justifyContent: 'space-between',
    },
    eventSmallImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        resizeMode: 'cover',
        marginLeft: 15,
    },
    eventTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 5,
    },
    eventSubtitle: {
        fontSize: 13,
        color: '#555',
        marginBottom: 5,
    },
    eventLocation: {
        fontSize: 13,
        fontStyle: 'italic',
        color: '#777',
    },
    showMoreButton: {
        backgroundColor: '#004a99',
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
        width: '100%',
        alignItems: 'center',
    },
    showMoreButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pinIconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
});
