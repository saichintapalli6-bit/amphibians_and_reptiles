import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function DetectionScreen() {
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    Alert.alert(
      "Choose Image Source",
      "Would you like to take a new photo or choose one from your gallery?",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission to access camera is required!");
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              setImage(result.assets[0]);
              setResult(null);
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              setImage(result.assets[0]);
              setResult(null);
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
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
    } as any);

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
      <View style={styles.card}>
        <Text style={styles.title}>Amphibians and Reptile Detection</Text>
        
        <Text style={{color: '#333', fontSize: 19, marginBottom: 10, textAlign: 'center'}}>Upload Image:</Text>
        
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <View style={styles.pickerPlaceholder}>
            <View style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>Choose File</Text>
            </View>
            <Text style={styles.pickerText} numberOfLines={1}>
              {image ? image.uri.split('/').pop() : 'No file chosen'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.predictButton} onPress={handlePredict} disabled={loading || !image}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.predictButtonText}>Predict</Text>}
        </TouchableOpacity>

        {result && result.invalid && (
          <>
            <View style={styles.invalidCard}>
              <Text style={{fontSize: 40, marginBottom: 10}}>🚫</Text>
              <Text style={styles.invalidTitle}>Invalid Image</Text>
              <Text style={styles.invalidText}>This is not a Reptile or Amphibian.{'\n'}Please upload a valid reptile or amphibian image.</Text>
            </View>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 20}}>Uploaded Image:</Text>
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
          </>
        )}

        {result && result.animal_name && (
          <>
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>🐾 Animal</Text>
                <Text style={styles.resultValue}>{result.animal_name}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>🏷️ Category</Text>
                <View style={[styles.badge, result.category === 'Reptile' ? styles.badgeReptile : result.category === 'Amphibian' ? styles.badgeAmphibian : styles.badgeUnknown]}>
                  <Text style={styles.badgeText}>
                    {result.category === 'Reptile' ? '🦎 Reptile' : result.category === 'Amphibian' ? '🐸 Amphibian' : 'Unknown'}
                  </Text>
                </View>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>📊 Accuracy</Text>
                <Text style={[styles.resultValue, {color: '#FFD700'}]}>{result.confidence_pct || result.accuracy}</Text>
              </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 20}}>Uploaded Image:</Text>
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F2',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 20,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24, // roughly h1
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    display: 'none', // Django template doesn't have a subtitle
  },
  imagePicker: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 14,
    overflow: 'hidden',
    height: 40, // standard button height
  },
  previewImage: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    height: 300, // Make sure it shows 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  pickerPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pickerButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#eeeeee',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#333',
  },
  pickerText: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    flex: 1,
  },
  predictButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  predictButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  resultTitle: {
    display: 'none',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 18, // 1.15rem
    fontWeight: 'bold',
    color: '#000000',
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  badgeReptile: {
    backgroundColor: '#2e7d32',
  },
  badgeAmphibian: {
    backgroundColor: '#1565c0',
  },
  badgeUnknown: {
    backgroundColor: '#555555',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  invalidCard: {
    marginTop: 20,
    backgroundColor: 'rgba(200, 30, 30, 0.25)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 80, 80, 0.7)',
  },
  invalidTitle: {
    color: '#ff6b6b',
    fontSize: 24, // 1.5rem
    fontWeight: 'bold',
    marginBottom: 8,
  },
  invalidText: {
    color: '#ffcccc',
    textAlign: 'center',
    fontSize: 16,
  },
});
