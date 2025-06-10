import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

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