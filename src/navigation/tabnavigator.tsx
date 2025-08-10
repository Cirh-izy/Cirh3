import React from 'react'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Platform } from 'react-native'
import MenuScreen from '../screens/menu'
import GrupoScreen from '../screens/grupo'
import ManejoScreen from '../screens/follow'
import KanbanView from '../components/kanban/kanban_view'
import HomeScreen from '../screens/home'

export type RootStackParamList = {
    MainTabs: undefined
    Settings: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 85 : 65,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    paddingTop: 5,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    backgroundColor: '#fff',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5,
                },
                tabBarActiveTintColor: '#007aff',
                tabBarInactiveTintColor: '#999',
            }}
        >
            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="menu" color={color} size={24} />
                    ),
                    tabBarLabel: 'Menú',
                }}
            />
            {/* <Tab.Screen
                name="home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="menu" color={color} size={24} />
                    ),
                    tabBarLabel: 'Menú',
                }}
            /> */}
            <Tab.Screen
                name="Grupo"
                component={GrupoScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="group" color={color} size={24} />
                    ),
                    tabBarLabel: 'Grupo',
                }}
            />
            <Tab.Screen
                name="Manejo"
                component={ManejoScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="assignment" color={color} size={24} />
                    ),
                    tabBarLabel: 'Manejo',
                }}
            />
        </Tab.Navigator>
    )
}

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}