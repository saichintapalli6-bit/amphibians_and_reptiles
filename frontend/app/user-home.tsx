import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function UserHomeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Header is now handled by the RootLayout Stack for a clean look */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to Classification of Amphibians and Reptiles</Text>
          <Text style={styles.description}>
            This tool helps classify amphibians and reptiles based on their characteristics.
          </Text>
          
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/detection' as any)}>
              <Text style={styles.menuButtonText}>Start Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/accuracy' as any)}>
              <Text style={styles.menuButtonText}>View Model Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, styles.logoutButton]} onPress={() => router.replace('/')}>
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 35,
    borderRadius: 15,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 35,
    color: '#555',
  },
  menu: {
    width: '100%',
    rowGap: 12,
  },
  menuButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#333',
    marginTop: 10,
  },
});
