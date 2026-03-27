import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', loginid: '', email: '', password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    for (let key in formData) {
      if (!formData[key as keyof typeof formData]) {
        Alert.alert('Error', `Please fill in: ${key === 'loginid' ? 'User ID' : key.charAt(0).toUpperCase() + key.slice(1)}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/UserRegisterForm', formData, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (response.data.status === 'success') {
        Alert.alert(
          '✅ Registered!',
          'Registration successful!\n\nYour account is pending admin approval. Please wait for activation before logging in.',
          [{ text: 'Go to Login', onPress: () => router.replace('/login' as any) }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message;
      if (serverMsg) {
        Alert.alert('Registration Failed', serverMsg);
      } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        Alert.alert('Connection Error', 'Cannot reach the server. Check your Wi-Fi and server IP in api.js');
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) =>
    setFormData({ ...formData, [key]: value });

  const fields = [
    { key: 'name', label: 'Full Name', type: 'default' },
    { key: 'loginid', label: 'User ID (Login ID)', type: 'default' },
    { key: 'email', label: 'Email', type: 'email-address' },
    { key: 'password', label: 'Password', type: 'default', secure: true },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Register Account</Text>
        {fields.map(({ key, label, type, secure }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            value={(formData as any)[key]}
            onChangeText={(val) => updateForm(key, val)}
            secureTextEntry={!!secure}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={type as any}
          />
        ))}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login' as any)} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Already have an account? <Text style={{ color: '#FFA500' }}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 50,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFA500',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#FFF',
    width: '100%',
    fontSize: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 14,
  },
});
