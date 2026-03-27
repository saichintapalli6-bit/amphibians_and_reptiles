import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { maxWidth: isWeb ? 500 : '90%' }]}>
        <Text style={styles.title}>Welcome to Classification of Reptiles and Amphibians</Text>
        <Text style={styles.subtitle}>
          Explore our tool to classify Reptiles and Amphibians. Use the login options to get started or create a new account if you're new here.
        </Text>
        
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={() => router.push('/register' as any)}
        >
          <Text style={styles.startButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly lighter overlay to show original colors
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 35,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFA500', // Exact Gold/Orange
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 35,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#007bff', // Exact Blue
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
