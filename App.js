import React from 'react';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import NavBar from './components/NavBar'; // Zorg dat dit pad correct is
import SettingsScreen from "./screens/SettingsScreen";
import FishScreen from './screens/FishScreen';
import MapScreen from './screens/MapScreen';
import WaterInfo from "./screens/waterinfo";
import GalleryScreen from "./screens/GalleryScreen";
import CameraScreen from "./screens/CameraScreen";
import SpotDetailScreen from "./screens/SpotDetailScreen";
import FishCatchDetailScreen from "./screens/FishCatchDetailScreen"; // NIEUW
import CommunityScreen from './screens/CommunityScreen';
import BlogPostScreen from './screens/BlogPostScreen';
import blogpostsData from './data/blogposts.json';
import EventScreen from './screens/EventScreen';
import EditFishCatchScreen from "./screens/EditFishCatchScreen";

const Stack = createNativeStackNavigator();

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={NavBar} />
                <Stack.Screen name="Map" component={MapScreen} />
                <Stack.Screen name="FishScreen" component={FishScreen} />
                <Stack.Screen
                    name="WaterInfo"
                    component={WaterInfo}
                    options={({ route }) => ({
                        title: route.params && route.params.waterName ? route.params.waterName : 'Water Info',
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#0096b2',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    })}
                />

                <Stack.Screen name="Galerij" component={GalleryScreen}/>
                <Stack.Screen name="Camera" component={CameraScreen}/>
                <Stack.Screen
                    name="SpotDetail"
                    component={SpotDetailScreen}
                    options={({ route }) => {
                        const title = route.params?.spot?.title;
                        return {
                            title: title ? `${capitalizeFirstLetter(title)} Details` : 'Spot Detail',
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: '#0096b2',
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        };
                    }}
                />
                <Stack.Screen
                    name="FishCatchDetail"
                    component={FishCatchDetailScreen}
                    options={({ route }) => {
                        const species = route.params?.fishCatch?.species;
                        return {
                            title: species ? `${capitalizeFirstLetter(species)} Details` : 'Gevangen Vis Details',
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: '#0096b2',
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        };
                    }}
                />
                <Stack.Screen name="EditFishCatch" component={EditFishCatchScreen}
                              options={({ route }) => {
                                  const species = route.params?.fishCatch?.species;
                                  return {
                                      title: species ? `Edit ${capitalizeFirstLetter(species)}` : 'Gevangen Vis Details',
                                      headerShown: true,
                                      headerStyle: {
                                          backgroundColor: '#0096b2',
                                      },
                                      headerTintColor: '#fff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      },
                                  };
                              }}
                />

                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        presentation: 'modal',
                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                        animation: 'slide_from_bottom',
                        animationDuration: 200,
                        contentStyle: {
                            backgroundColor: 'transparent',
                        },
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="Community" component={CommunityScreen}/>

                <Stack.Screen
                    name="BlogPostScreen"
                    component={BlogPostScreen}
                    options={({ route }) => {
                        const { blogId } = route.params;
                        const blog = blogpostsData.find(b => b.id === blogId);
                        const dynamicTitle = blog && blog.type ? capitalizeFirstLetter(blog.type) : 'Blogpost';
                        return {
                            title: dynamicTitle,
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: '#0096b2',
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        };
                    }}
                />
                <Stack.Screen
                    name="EventScreen"
                    component={EventScreen}
                    options={{
                        title: 'Evenement Details',
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#0096b2',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}