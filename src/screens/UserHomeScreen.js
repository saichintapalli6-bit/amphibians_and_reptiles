import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function UserHomeScreen({ navigation, route }) {
  const { user } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          This tool helps classify amphibians and reptiles based on their characteristics.
        </Text>
        
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Detection')}>
            <Text style={styles.menuButtonText}>Start Analysis (Detection)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, styles.logoutButton]} onPress={() => navigation.replace('Index')}>
            <Text style={styles.menuButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    backgroundColor: '#000',
    padding: 40,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    marginVertical: 30,
    color: '#444',
  },
  menu: {
    width: '100%',
    gap: 15,
  },
  menuButton: {
    backgroundColor: '#000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
});
