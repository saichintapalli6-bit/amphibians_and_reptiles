import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '', loginid: '', password: '', mobile: '', email: '',
    locality: '', address: '', city: '', state: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    for (let key in formData) {
      if (!formData[key]) {
        Alert.alert('Error', `Please fill ${key}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/UserRegisterForm', formData);
      if (response.data.status === 'success') {
        Alert.alert('Success', 'Registration successful! Wait for admin activation.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register Account</Text>
      {Object.keys(formData).map((key) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={formData[key]}
          onChangeText={(val) => updateForm(key, val)}
          secureTextEntry={key === 'password'}
          keyboardType={key === 'mobile' ? 'phone-pad' : key === 'email' ? 'email-address' : 'default'}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
