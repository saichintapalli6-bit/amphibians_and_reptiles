import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function AdminLoginScreen({ navigation }) {
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
      const response = await api.post('/AdminLogincheck', { loginid, pswd });
      if (response.data.status === 'success') {
        navigation.navigate('AdminHome');
      } else {
        Alert.alert('Login Failed', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid Admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Admin ID"
        value={loginid}
        onChangeText={setLoginid}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={pswd}
        onChangeText={setPswd}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Admin Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#D5006D',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#D5006D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
