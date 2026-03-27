import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function DetectionScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    try {
      const resp = await api.post('/prediction/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      if (resp.data.status === 'success') {
        setResult(resp.data);
      } else if (resp.data.is_invalid) {
        setResult({ invalid: true });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Amphibians and Reptile Detection</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.pickerText}>Tap to Select Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.predictButton} onPress={handlePredict} disabled={loading || !image}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.predictButtonText}>Predict</Text>}
      </TouchableOpacity>

      {result && result.invalid && (
        <View style={styles.invalidCard}>
          <Text style={styles.invalidTitle}>🚫 Invalid Image</Text>
          <Text style={styles.invalidText}>This is not a recognized Reptile or Amphibian.</Text>
        </View>
      )}

      {result && result.animal_name && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Detection Result</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>🐾 Species:</Text>
            <Text style={styles.resultValue}>{result.animal_name}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>🏷️ Category:</Text>
            <Text style={styles.resultValue}>{result.category}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>📊 Confidence:</Text>
            <Text style={[styles.resultValue, {color: '#FFD700'}]}>{result.confidence_pct}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    width: '100%',
    height: 300,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pickerText: {
    color: '#666',
    fontSize: 16,
  },
  predictButton: {
    backgroundColor: '#000',
    padding: 15,
    width: '50%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  predictButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2e7d32',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  invalidCard: {
    backgroundColor: '#FFEBEE',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  invalidTitle: {
    color: '#C62828',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invalidText: {
    color: '#C62828',
    textAlign: 'center',
  },
});
