import { Pressable, StyleSheet, Text, View } from 'react-native';


export default function LocationsScreen({ navigation }) {
    return (
        <View>
            <Text>Locations</Text>
            <Pressable onPress={() => navigation.navigate('WaterInfo')} style={styles.button}>
                <Text style={{ color: 'white' }}>WaterInfo</Text>
            </Pressable>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        marginTop: 20,
        borderRadius: 8,
    }
});