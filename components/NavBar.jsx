import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from '@expo/vector-icons';
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CameraScreen from "../screens/CameraScreen";
import LocationsScreen from "../screens/LocationsScreen";

const Tab = createBottomTabNavigator()

const getIconName = (routeName, focused) => {
    const icons = {
        Profiel: focused ? 'profiel' : 'profiel-outline',
        Camera: focused ? 'camera' : 'camera-outline' ,
        Map: focused ? 'map' : 'map-outline',
        Locaties: focused ? 'locaties' : 'locaties-outline'
    }

    return icons[routeName];
}

export default function NavBar({navigation}) {
    return (
        <Tab.Navigator>

        </Tab.Navigator>
    )
}