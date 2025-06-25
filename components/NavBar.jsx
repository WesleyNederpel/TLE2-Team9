import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Image } from 'react-native';
import MapScreen from "../screens/MapScreen";
import CameraScreen from "../screens/CameraScreen";
import GalleryScreen from "../screens/GalleryScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LocationsScreen from '../screens/LocationsScreen';
// import WaterInfo from "../screens/waterinfo";
import CommunityScreen from '../screens/CommunityScreen';
import React from 'react';
import { useLocationSetting } from '../LocationSettingContext';

const LocationsStack = createNativeStackNavigator();

function LocationsStackScreen() {
    return (
        <LocationsStack.Navigator>
            <LocationsStack.Screen name="Locations" component={LocationsScreen} options={{ headerShown: false }} />
            {/* <LocationsStack.Screen name="WaterInfo" component={WaterInfo} options={{ headerShown: false }} /> */}
        </LocationsStack.Navigator>
    );
}

const MapStack = createNativeStackNavigator();

function MapStackScreen() {
    return (
        <MapStack.Navigator>
            <MapStack.Screen name="MapMain" component={MapScreen} options={{ headerShown: false }} />
            {/* <MapStack.Screen name="WaterInfo" component={WaterInfo} options={{ headerShown: false }} /> */}
        </MapStack.Navigator>
    );
}



const Tab = createBottomTabNavigator()

const getIconName = (routeName, focused) => {
    const icons = {
        Community: focused ? 'people' : 'people-outline',
        Camera: focused ? 'camera' : 'camera-outline',
        Map: focused ? 'map' : 'map-outline',
        Locaties: focused ? 'location' : 'location-outline',
        Galerij: focused ? 'images' : 'images-outline'
    }

    return icons[routeName];
}

export default function NavBar({ navigation, darkMode: darkModeProp }) {
    const context = useLocationSetting ? useLocationSetting() : {};
    const darkMode = typeof darkModeProp === 'boolean' ? darkModeProp : context.darkMode;

    return (
        <Tab.Navigator
            initialRouteName="Map"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    const iconName = getIconName(route.name, focused);
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
                tabBarLabelStyle: styles.tabLabel,
                tabBarStyle: [
                    styles.tabBar,
                    { backgroundColor: darkMode ? '#00505e' : '#0096b2' }
                ],
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#fff',
                headerTitle: '',
                headerStyle: [
                    styles.header,
                    { backgroundColor: darkMode ? '#00505e' : '#0096b2' }
                ],
                headerTintColor: '#fff',
                headerLeft: () => (
                    <Image
                        source={require('../assets/Go_white.png')}
                        style={styles.headerLogo}
                    />
                ),
                headerRight: () => (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Settings');
                        }}
                        style={({ pressed }) => [
                            {
                                marginRight: 15,
                                marginBottom: 10,
                                opacity: pressed ? 0.7 : 1
                            }
                        ]}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={28}
                            color={"#fff"}
                        />
                    </Pressable>
                )
            })}
        >
            <Tab.Screen name="Camera" component={CameraScreen} />
            <Tab.Screen name="Galerij" component={GalleryScreen} />
            <Tab.Screen name="Map" component={MapStackScreen} />
            <Tab.Screen name="Locaties" component={LocationsStackScreen} />
            <Tab.Screen name="Community" component={CommunityScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#00505e',
        borderTopWidth: 0,
        height: 100,
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 12,
        paddingBottom: 5,
    },
    header: {
        backgroundColor: '#00505e',
        elevation: 0, // Remove shadow on Android
        shadowOpacity: 0, // Remove shadow on iOS
        borderBottomWidth: 0,
    },
    headerLogo: {
        height: 55,
        width: 55,
        resizeMode: 'contain',
        marginLeft: 15,
        marginBottom: 10,
    },
});