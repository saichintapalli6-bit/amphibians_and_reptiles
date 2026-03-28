import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, ScrollView, Platform, Animated, useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

function webAlert(title: string, msg: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else {
    const { Alert } = require('react-native');
    Alert.alert(title, msg);
  }
}

export default function DetectionScreen() {
  const [image,   setImage]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<any>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // Web: use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setImage({ uri, file, name: file.name });
          setResult(null);
          resultAnim.setValue(0);
        }
      };
      input.click();
    } else {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, quality: 1,
      });
      if (!res.canceled) {
        setImage(res.assets[0]);
        setResult(null);
        resultAnim.setValue(0);
      }
    }
  };

  const handlePredict = async () => {
    if (!image) { webAlert('Error', 'Please select an image first'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web' && image.file) {
        formData.append('image', image.file);
      } else {
        formData.append('image', { uri: image.uri, name: 'upload.jpg', type: 'image/jpeg' } as any);
      }
      const resp = await api.post('/prediction/', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
      });
      if (resp.data.status === 'success') {
        setResult(resp.data);
      } else if (resp.data.is_invalid) {
        setResult({ invalid: true });
      } else if (resp.data.result) {
        setResult({ notTrained: true, msg: resp.data.result });
      }
      Animated.spring(resultAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    } catch (err: any) {
      const status = err?.response?.status;
      const data   = err?.response?.data;
      const serverMsg = typeof data === 'string'
        ? data.substring(0, 300)
        : (data?.message || data?.detail || '');
      if (status === 500) {
        webAlert('Server Error (500)', 'Backend crashed!\n\nPlease check Django terminal for error details.\n\n' + serverMsg);
      } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
        webAlert('Connection Error', 'Cannot reach backend.\n\n• Is Django running? (localhost:8000)\n• Check CORS settings');
      } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        webAlert('Timeout Error', 'The prediction took too long. The Render server might be asleep or processing. Try again in a minute!');
      } else {
        const fallBackMsg = err.message || 'Prediction failed. Check Django terminal.';
        webAlert('Error', serverMsg || fallBackMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, isDesktop && styles.cardDesktop]}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>🔬 Species Detection</Text>
          <Text style={styles.sub}>Upload an image to identify reptile or amphibian species</Text>

          {/* Upload area */}
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImg} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Tap to choose image</Text>
                <Text style={styles.uploadSub}>JPG, PNG supported</Text>
              </View>
            )}
          </TouchableOpacity>

          {image && (
            <Text style={styles.fileName} numberOfLines={1}>📎 {image.name || image.uri?.split('/').pop()}</Text>
          )}

          <TouchableOpacity
            style={[styles.predictBtn, (!image || loading) && styles.predictBtnDisabled]}
            onPress={handlePredict}
            disabled={loading || !image}
            activeOpacity={0.85}
          >
            {loading
              ? <><ActivityIndicator color="#fff" size="small" /><Text style={styles.predictBtnText}>  Analyzing...</Text></>
              : <Text style={styles.predictBtnText}>🚀  Predict Species</Text>}
          </TouchableOpacity>

          {/* Result */}
          {result && (
            <Animated.View style={[styles.resultBox, { opacity: resultAnim, transform: [{ scale: resultAnim }] }]}>
              {result.invalid ? (
                <View style={styles.invalidBox}>
                  <Text style={styles.invalidEmoji}>🚫</Text>
                  <Text style={styles.invalidTitle}>Not a Reptile or Amphibian</Text>
                  <Text style={styles.invalidSub}>Please upload a valid reptile or amphibian image.</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.resultHeader}>✅ Detection Result</Text>
                  {[
                    { label: '🐾 Animal',   value: result.animal_name,                     color: '#fff' },
                    { label: '📊 Accuracy', value: result.confidence_pct || result.accuracy, color: '#fbbf24' },
                  ].map(({ label, value, color }) => (
                    <View key={label} style={styles.resultRow}>
                      <Text style={styles.resultLabel}>{label}</Text>
                      <Text style={[styles.resultValue, { color }]}>{value}</Text>
                    </View>
                  ))}
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>🏷️ Category</Text>
                    <View style={[
                      styles.catBadge,
                      result.category === 'Reptile' ? styles.catReptile : styles.catAmphibian,
                    ]}>
                      <Text style={styles.catText}>
                        {result.category === 'Reptile' ? '🦎 Reptile' : '🐸 Amphibian'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' as any : undefined,
    backgroundColor: '#0f0f23',
    overflow: 'hidden' as any,
  },
  blob:  { position: 'absolute', borderRadius: 999 },
  blob1: { width: 350, height: 350, backgroundColor: 'rgba(52,211,153,0.10)', top: -80,  right: -80 },
  blob2: { width: 280, height: 280, backgroundColor: 'rgba(96,165,250,0.10)', bottom: -60, left: -60 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(52,211,153,0.3)',
    borderRadius: 24, padding: 28,
    width: '100%', maxWidth: 600,
    overflow: 'hidden' as any,
  },
  cardDesktop: { padding: 40 },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#34d399' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6, marginTop: 8 },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 24 },

  uploadBox: {
    borderWidth: 2, borderColor: 'rgba(52,211,153,0.35)',
    borderStyle: 'dashed' as any, borderRadius: 18,
    overflow: 'hidden' as any, height: 220,
    marginBottom: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(52,211,153,0.05)',
  },
  uploadPlaceholder: { alignItems: 'center' },
  uploadIcon: { fontSize: 48, marginBottom: 10 },
  uploadText: { fontSize: 16, fontWeight: '700', color: '#34d399', marginBottom: 4 },
  uploadSub:  { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  previewImg: { width: '100%', height: '100%' },
  fileName:   { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginBottom: 16 },

  predictBtn: {
    backgroundColor: '#34d399', borderRadius: 50,
    paddingVertical: 15, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#34d399', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  predictBtnDisabled: { backgroundColor: 'rgba(52,211,153,0.3)', shadowOpacity: 0 },
  predictBtnText: { color: '#0f0f23', fontSize: 16, fontWeight: '800' },

  resultBox: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  resultHeader: { fontSize: 16, fontWeight: '800', color: '#34d399', marginBottom: 14, textAlign: 'center' },
  resultRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  resultLabel:  { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  resultValue:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  catBadge:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  catReptile:   { backgroundColor: 'rgba(52,211,153,0.2)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.4)' },
  catAmphibian: { backgroundColor: 'rgba(96,165,250,0.2)', borderWidth: 1, borderColor: 'rgba(96,165,250,0.4)' },
  catText:      { color: '#fff', fontWeight: '700', fontSize: 13 },

  invalidBox:   { alignItems: 'center', padding: 10 },
  invalidEmoji: { fontSize: 48, marginBottom: 10 },
  invalidTitle: { fontSize: 20, fontWeight: '800', color: '#f87171', marginBottom: 8 },
  invalidSub:   { color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 14 },
});
