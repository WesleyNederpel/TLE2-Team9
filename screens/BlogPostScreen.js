import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import blogpostsData from '../data/blogposts.json';

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

    // Toon een foutmelding als de blogpost niet gevonden is
    if (!blog) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Blogpost niet gevonden.</Text>
            </View>
        );
    }

    return (
        // Gebruik ScrollView om de content scrollbaar te maken
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
            {/* Hoofdsectie van de blogpost */}
            <View style={styles.blogPostHeader}>
                <Text style={styles.blogTitle}>{blog.title}</Text>
                <Text style={styles.blogMeta}>
                    Door <Text style={styles.blogAuthor}>{blog.author}</Text> op {formatDate(blog.date)}
                </Text>
            </View>

            {/* Inhoud van de blogpost */}
            <Text style={styles.blogContent}>{blog.content}</Text>

            {/* Reacties sectie */}
            {blog.comments && blog.comments.length > 0 && (
                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>Reacties</Text>
                    {blog.comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                            <Text style={styles.commentMeta}>
                                <Text style={styles.commentAuthor}>{comment.author}</Text> op {formatDate(comment.date)}
                            </Text>
                            <Text style={styles.commentContent}>{comment.content}</Text>
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
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
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
    },
    blogTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#004a99',
        marginBottom: 10,
    },
    blogMeta: {
        fontSize: 14,
        color: '#666',
    },
    blogAuthor: {
        fontWeight: 'bold',
        color: '#333',
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
    commentMeta: {
        fontSize: 13,
        color: '#777',
        marginBottom: 5,
    },
    commentAuthor: {
        fontWeight: 'bold',
        color: '#0096b2',
    },
    commentContent: {
        fontSize: 15,
        color: '#333',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    }
});
