import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [loginid, setLoginid] = useState('');
  const [pswd,    setPswd]    = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!loginid.trim() || !pswd.trim()) { Alert.alert('Error', 'Please enter all fields'); return; }
    setLoading(true);
    try {
      const response = await api.post('/UserLoginCheck/', { loginid: loginid.trim(), pswd: pswd.trim() });
      if (response.data.status === 'success') {
        router.replace({ pathname: '/user-home', params: { name: response.data.name } } as any);
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Cannot connect to server');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { backgroundColor: '#c7d2fe', top: -80, left: -80 }]} />
      <View style={[styles.blob, { backgroundColor: '#fbcfe8', bottom: -60, right: -60, width: 260, height: 260 }]} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.card, isDesktop && styles.cardDesktop, { opacity: fade, transform: [{ translateY: slideY }] }]}>
          <View style={styles.topBar} />
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to your account</Text>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: '#6c63ff' }]}>👤  Login ID</Text>
            <TextInput
              style={[styles.input, focused === 'id' && styles.inputFocus]}
              placeholder="Enter your login ID"
              placeholderTextColor="#9ca3af"
              value={loginid} onChangeText={setLoginid}
              onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: '#ec4899' }]}>🔒  Password</Text>
            <TextInput
              style={[styles.input, focused === 'pw' && styles.inputFocus]}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry value={pswd} onChangeText={setPswd}
              onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
            <TouchableOpacity style={styles.btn} onPress={handleLogin} onPressIn={pressIn} onPressOut={pressOut} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login  →</Text>}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/register' as any)} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Register →</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f4ff', overflow: 'hidden' as any },
  blob:   { position: 'absolute', borderRadius: 999, width: 320, height: 320 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 32,
    width: '100%', maxWidth: 480, overflow: 'hidden' as any,
    shadowColor: '#6c63ff', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 12,
  },
  cardDesktop: { maxWidth: 560, padding: 48 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#6c63ff' },
  logo:  { fontSize: 52, textAlign: 'center', marginBottom: 10, marginTop: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1e1b4b', textAlign: 'center', marginBottom: 4 },
  sub:   { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  label:     { fontSize: 13, fontWeight: '700', marginBottom: 7, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, color: '#111827', padding: 13, fontSize: 15,
  },
  inputFocus: { borderColor: '#6c63ff', borderWidth: 2, backgroundColor: '#f5f3ff' },
  btn: {
    backgroundColor: '#6c63ff', paddingVertical: 15, borderRadius: 50,
    alignItems: 'center', marginTop: 10, marginBottom: 20,
    shadowColor: '#6c63ff', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '800' },
  link:       { alignItems: 'center' },
  linkText:   { color: '#6b7280', fontSize: 14 },
  linkAccent: { color: '#6c63ff', fontWeight: '700' },
});
