import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserHomeScreen from './src/screens/UserHomeScreen';
import DetectionScreen from './src/screens/DetectionScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import IndexScreen from './src/screens/IndexScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={IndexScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="UserHome" component={UserHomeScreen} options={{ title: 'User Dashboard' }} />
        <Stack.Screen name="Detection" component={DetectionScreen} options={{ title: 'Species Detection' }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Manage Users' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
