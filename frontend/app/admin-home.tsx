import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminHomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manage Application</Text>
          <Text style={styles.description}>Welcome to the Administrative Dashboard. You can manage users and monitor system activity from here.</Text>
          
          <View style={styles.menu}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/user-management' as any)}>
              <Text style={styles.buttonText}>Manage Registered Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => router.replace('/')}>
              <Text style={styles.buttonText}>Logout</Text>
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 35,
    borderRadius: 15,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D5006D',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
    marginBottom: 35,
  },
  menu: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#D5006D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#333',
  },
});
