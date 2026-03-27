import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

const FIELDS = [
  { key: 'name',     label: 'Full Name',      icon: '👤', color: '#6c63ff', keyboard: 'default'       as const, secure: false },
  { key: 'loginid',  label: 'User ID',         icon: '🆔', color: '#10b981', keyboard: 'default'       as const, secure: false },
  { key: 'email',    label: 'Email Address',   icon: '📧', color: '#f59e0b', keyboard: 'email-address' as const, secure: false },
  { key: 'password', label: 'Password',        icon: '🔒', color: '#ec4899', keyboard: 'default'       as const, secure: true  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [form, setForm] = useState({ name: '', loginid: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const fade    = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(50)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const fieldAnims = useRef(FIELDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    FIELDS.forEach((_, i) => setTimeout(() => Animated.spring(fieldAnims[i], { toValue: 1, friction: 7, useNativeDriver: true }).start(), 150 + i * 100));
  }, []);

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    const labels: any = { name: 'Full Name', loginid: 'User ID', email: 'Email', password: 'Password' };
    for (const k in form) {
      if (!form[k as keyof typeof form].trim()) { Alert.alert('Error', `Please fill: ${labels[k]}`); return; }
    }
    setLoading(true);
    try {
      const res = await api.post('/UserRegisterForm', { name: form.name.trim(), loginid: form.loginid.trim(), email: form.email.trim(), password: form.password.trim() }, { headers: { 'Content-Type': 'application/json' } });
      if (res.data.status === 'success') {
        Alert.alert('✅ Registered!', 'Pending admin approval.', [{ text: 'Login', onPress: () => router.replace('/login' as any) }]);
      } else {
        Alert.alert('Error', res.data.message || 'Registration failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Cannot connect to server');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { backgroundColor: '#a7f3d0', top: -80, left: -80 }]} />
      <View style={[styles.blob, { backgroundColor: '#c7d2fe', bottom: -60, right: -60, width: 260, height: 260 }]} />
      <View style={[styles.blob, { backgroundColor: '#fde68a', top: '45%', right: -40, width: 180, height: 180 }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.card, isDesktop && styles.cardDesktop, { opacity: fade, transform: [{ translateY: slideY }] }]}>
          <View style={styles.topBar} />
          <Text style={styles.logo}>📝</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Join to start classifying species</Text>

          {FIELDS.map(({ key, label, icon, color, keyboard, secure }, i) => (
            <Animated.View key={key} style={[styles.fieldWrap, { opacity: fieldAnims[i], transform: [{ translateX: fieldAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}>
              <Text style={[styles.label, { color }]}>{icon}  {label}</Text>
              <TextInput
                style={[styles.input, focused === key && styles.inputFocus, focused === key && { borderColor: color }]}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9ca3af"
                value={(form as any)[key]}
                onChangeText={v => update(key, v)}
                onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                secureTextEntry={secure} autoCapitalize="none" autoCorrect={false} keyboardType={keyboard}
              />
            </Animated.View>
          ))}

          <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
            <TouchableOpacity style={styles.btn} onPress={handleRegister} onPressIn={pressIn} onPressOut={pressOut} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account  →</Text>}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.link}>
            <Text style={styles.linkText}>Already registered? <Text style={styles.linkAccent}>Login →</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0fdf4', overflow: 'hidden' as any },
  blob:   { position: 'absolute', borderRadius: 999, width: 320, height: 320 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 30,
    width: '100%', maxWidth: 480, overflow: 'hidden' as any,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 12,
  },
  cardDesktop: { maxWidth: 580, padding: 48 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#10b981' },
  logo:  { fontSize: 52, textAlign: 'center', marginBottom: 10, marginTop: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#064e3b', textAlign: 'center', marginBottom: 4 },
  sub:   { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  fieldWrap: { marginBottom: 14 },
  label:     { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, color: '#111827', padding: 13, fontSize: 15,
  },
  inputFocus: { borderWidth: 2, backgroundColor: '#fff' },
  btn: {
    backgroundColor: '#10b981', paddingVertical: 15, borderRadius: 50,
    alignItems: 'center', marginTop: 12, marginBottom: 18,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '800' },
  link:       { alignItems: 'center' },
  linkText:   { color: '#6b7280', fontSize: 14 },
  linkAccent: { color: '#10b981', fontWeight: '700' },
});
