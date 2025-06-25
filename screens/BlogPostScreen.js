import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import blogpostsData from '../data/blogposts.json';
import { useLocationSetting } from '../LocationSettingContext';

// Helperfunctie om datums te formatteren
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', options);
};

export default function BlogPostScreen({ route }) {
    // Haal de blogId op uit de navigatieparameters
    const { blogId } = route.params;

    // Zoek de juiste blogpost op basis van de ID
    const blog = blogpostsData.find(b => b.id === blogId);
    const { darkMode } = useLocationSetting();

    // Toon een foutmelding als de blogpost niet gevonden is
    if (!blog) {
        return (
            <View style={[styles.container, darkMode && styles.containerDark]}>
                <Text style={[styles.errorText, darkMode && styles.errorTextDark]}>Blogpost niet gevonden.</Text>
            </View>
        );
    }

    return (
        // Gebruik ScrollView om de content scrollbaar te maken
        <ScrollView
            style={[styles.scrollViewContainer, darkMode && styles.scrollViewContainerDark]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Hoofdsectie van de blogpost */}
            <View style={[styles.blogPostHeader, darkMode && styles.blogPostHeaderDark]}>
                <Text style={[styles.blogTitle, darkMode && styles.blogTitleDark]}>{blog.title}</Text>
                <Text style={[styles.blogMeta, darkMode && styles.blogMetaDark]}>
                    Door <Text style={[styles.blogAuthor, darkMode && styles.blogAuthorDark]}>{blog.author}</Text> op {formatDate(blog.date)}
                </Text>
            </View>

            {/* Inhoud van de blogpost */}
            <View style={styles.blogContentWrapper}>
                <Text style={[styles.blogContent, darkMode && styles.blogContentDark]}>{blog.content}</Text>
            </View>

            {/* Reacties sectie */}
            {blog.comments && blog.comments.length > 0 && (
                <View style={styles.commentsSection}>
                    <Text style={[styles.commentsTitle, darkMode && styles.commentsTitleDark]}>Reacties</Text>
                    {blog.comments.map((comment, index) => (
                        <View key={index} style={[styles.commentItem, darkMode && styles.commentItemDark]}>
                            <Text style={[styles.commentMeta, darkMode && styles.commentMetaDark]}>
                                <Text style={[styles.commentAuthor, darkMode && styles.commentAuthorDark]}>{comment.author}</Text> op {formatDate(comment.date)}
                            </Text>
                            <Text style={[styles.commentContent, darkMode && styles.commentContentDark]}>{comment.content}</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollViewContainerDark: {
        backgroundColor: '#181818',
    },
    contentContainer: {
        padding: 20,
        alignItems: 'center',
    },
    blogPostHeader: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    blogPostHeaderDark: {
        backgroundColor: '#232323',
    },
    blogContentWrapper: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    blogTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 10,
    },
    blogTitleDark: {
        color: '#7fd6e7',
    },
    blogMeta: {
        fontSize: 14,
        color: '#666',
    },
    blogMetaDark: {
        color: '#aaa',
    },
    blogAuthor: {
        fontWeight: 'bold',
        color: '#333',
    },
    blogAuthorDark: {
        color: '#eee',
    },
    blogContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    blogContentDark: {
        color: '#eee',
        backgroundColor: '#232323',
    },
    commentsSection: {
        marginTop: 10,
    },
    commentsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#004a99',
        paddingBottom: 10,
    },
    commentsTitleDark: {
        color: '#7fd6e7',
        borderBottomColor: '#7fd6e7',
    },
    commentItem: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    commentItemDark: {
        backgroundColor: '#232323',
    },
    commentMeta: {
        fontSize: 13,
        color: '#777',
        marginBottom: 5,
    },
    commentMetaDark: {
        color: '#aaa',
    },
    commentAuthor: {
        fontWeight: 'bold',
        color: '#0096b2',
    },
    commentAuthorDark: {
        color: '#7fd6e7',
    },
    commentContent: {
        fontSize: 15,
        color: '#333',
    },
    commentContentDark: {
        color: '#eee',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
    errorTextDark: {
        color: '#ffb3b3',
    }
});
