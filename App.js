import { StatusBar } from 'expo-status-bar'
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  NavigationContainer,
  TabNavigator,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { UserProvider } from './src/UserContext'
import React, { useEffect, useState, useRef, useContext } from 'react'
import { UserContext } from './src/UserContext'

import Login from './src/screens/LoginScreen'
import Logout from './src/screens/LogoutScreen'
import Dashboard from './src/screens/DashboardScreen'
import Projects from './src/screens/ProjectsScreen'
import Tasks from './src/screens/TasksScreen'
import ProjectTasks from './src/screens/ProjectTasksScreen'

const Tab = createBottomTabNavigator()

const Stack = createNativeStackNavigator()

function MyTabs() {
  const { isAdmin, setIsAdmin } = useContext(UserContext)
  const shouldHideTabBar = isAdmin ? true : false

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline'
          } else if (route.name === 'Projects') {
            iconName = focused
              ? 'file-tray-stacked'
              : 'file-tray-stacked-outline'
          } else if (route.name === 'Tasks') {
            iconName = focused
              ? 'checkmark-done-circle'
              : 'checkmark-done-circle-outline'
          } else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline'
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#0782F9',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
        })}
      />
      {shouldHideTabBar && (
        <Tab.Screen
          name="Projects"
          component={Projects}
          options={{
            unmountOnBlur: true,
          }}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ screen: undefined }),
          })}
        />
      )}

      <Tab.Screen
        name="Tasks"
        component={Tasks}
        options={{ unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
        })}
      />
      <Tab.Screen
        name="Logout"
        component={Logout}
        options={{ unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
        })}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{ headerShown: false }}
            name="Login"
            component={Login}
          />
          <Stack.Screen
            name="BottomNavbar"
            options={{ headerShown: false }}
            component={MyTabs}
          />
          <Stack.Screen
            options={{ headerShown: true }}
            name="ProjectTasks"
            component={ProjectTasks}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
