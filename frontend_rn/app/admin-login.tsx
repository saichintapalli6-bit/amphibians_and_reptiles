import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [loginid, setLoginid] = useState('');
  const [pswd,    setPswd]    = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;
  const btnScale    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(shieldPulse, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
      Animated.timing(shieldPulse, { toValue: 1,   duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!loginid.trim() || !pswd.trim()) { Alert.alert('Error', 'Please enter Admin ID and Password'); return; }
    setLoading(true);
    try {
      const response = await api.post('/AdminLogincheck', { loginid: loginid.trim(), pswd: pswd.trim() });
      if (response.data.status === 'success') {
        router.replace('/admin-home' as any);
      } else {
        Alert.alert('Access Denied', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Try admin / admin');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { backgroundColor: '#fde68a', top: -80, right: -80 }]} />
      <View style={[styles.blob, { backgroundColor: '#fed7aa', bottom: -60, left: -60, width: 260, height: 260 }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.card, isDesktop && styles.cardDesktop, { opacity: fade, transform: [{ translateY: slideY }] }]}>
          <View style={styles.topBar} />

          <Animated.Text style={[styles.logo, { transform: [{ scale: shieldPulse }] }]}>🛡️</Animated.Text>
          <Text style={styles.title}>Admin Portal</Text>
          <View style={styles.restrictBadge}><Text style={styles.restrictText}>🔒 Restricted Access</Text></View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: '#d97706' }]}>🆔  Admin ID</Text>
            <TextInput
              style={[styles.input, focused === 'id' && styles.inputFocus]}
              placeholder="Enter admin ID"
              placeholderTextColor="#9ca3af"
              value={loginid} onChangeText={setLoginid}
              onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: '#dc2626' }]}>🔑  Password</Text>
            <TextInput
              style={[styles.input, focused === 'pw' && styles.inputFocus]}
              placeholder="Enter password"
              placeholderTextColor="#9ca3af"
              secureTextEntry value={pswd} onChangeText={setPswd}
              onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
            <TouchableOpacity style={styles.btn} onPress={handleLogin} onPressIn={pressIn} onPressOut={pressOut} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>🚀  Login to Dashboard</Text>}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.hint}>Default: admin / admin</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffbeb', overflow: 'hidden' as any },
  blob:   { position: 'absolute', borderRadius: 999, width: 320, height: 320 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 32,
    width: '100%', maxWidth: 460, alignItems: 'center', overflow: 'hidden' as any,
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 12,
  },
  cardDesktop: { maxWidth: 540, padding: 52 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#f59e0b' },
  logo:   { fontSize: 64, marginBottom: 14, marginTop: 8 },
  title:  { fontSize: 26, fontWeight: '800', color: '#78350f', marginBottom: 10 },
  restrictBadge: {
    backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 28,
  },
  restrictText: { color: '#92400e', fontSize: 13, fontWeight: '700' },
  fieldWrap: { marginBottom: 16, width: '100%' },
  label:     { fontSize: 13, fontWeight: '700', marginBottom: 7, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, color: '#111827', padding: 13, fontSize: 15, width: '100%',
  },
  inputFocus: { borderColor: '#f59e0b', borderWidth: 2, backgroundColor: '#fffbeb' },
  btn: {
    backgroundColor: '#f59e0b', paddingVertical: 15, borderRadius: 50,
    alignItems: 'center', marginTop: 10, marginBottom: 14, width: '100%',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  hint:    { color: '#9ca3af', fontSize: 12 },
});
