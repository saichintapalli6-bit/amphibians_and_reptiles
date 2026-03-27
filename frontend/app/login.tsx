import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [loginid, setLoginid] = useState('');
  const [pswd, setPswd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginid || !pswd) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/UserLoginCheck/', { loginid, pswd });
      if (response.data.status === 'success') {
        router.push({ pathname: '/user-home', params: { name: response.data.name } } as any);
      } else {
        // Show the exact message from server (e.g. "Your Account Not at activated")
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      // Axios throws for 4xx/5xx – extract server message if available
      const serverMsg = error?.response?.data?.message;
      if (serverMsg) {
        Alert.alert('Login Failed', serverMsg);
      } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        Alert.alert(
          'Connection Error',
          'Cannot reach the server.\n\nMake sure:\n1. Django is running (python manage.py runserver 0.0.0.0:8000)\n2. Your phone and PC are on the same Wi-Fi\n3. The IP in api.js is correct'
        );
      } else {
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>User Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Login ID"
          value={loginid}
          onChangeText={setLoginid}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={pswd}
          onChangeText={setPswd}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register' as any)} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Don't have an account? <Text style={{ color: '#FFA500' }}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
