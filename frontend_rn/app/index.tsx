import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const scale  = useRef(new Animated.Value(0.88)).current;
  const pulse  = useRef(new Animated.Value(1)).current;
  const float  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 1200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -12, duration: 2000, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0,   duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.screen}>
      {/* Colourful blobs */}
      <View style={[styles.blob, { backgroundColor: '#c7d2fe', width: 380, height: 380, top: -100, left: -80 }]} />
      <View style={[styles.blob, { backgroundColor: '#fbcfe8', width: 300, height: 300, bottom: -60, right: -60 }]} />
      <View style={[styles.blob, { backgroundColor: '#a7f3d0', width: 220, height: 220, top: '40%', right: -40 }]} />

      <Animated.View style={[
        styles.card,
        isDesktop && styles.cardDesktop,
        { opacity: fade, transform: [{ translateY: slideY }, { scale }] }
      ]}>
        <View style={styles.topBar} />

        <Animated.View style={{ transform: [{ translateY: float }] }}>
          <Image source={require('../assets/images/app_logo.png')} style={styles.homeLogo} />
        </Animated.View>
        <Text style={styles.title}>Reptile & Amphibian{'\n'}Classification</Text>
        <Text style={styles.sub}>AI-powered species identification using deep learning</Text>

        <View style={styles.badges}>
          {[['🤖', 'AI Powered', '#e0e7ff'], ['⚡', 'Fast', '#fef3c7'], ['🎯', 'Accurate', '#d1fae5']].map(([i, l, bg]) => (
            <View key={l} style={[styles.badge, { backgroundColor: bg }]}>
              <Text style={styles.badgeText}>{i} {l}</Text>
            </View>
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: pulse }], width: '100%' }}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/register' as any)} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>🚀  Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/login' as any)} activeOpacity={0.85}>
          <Text style={styles.btnSecondaryText}>🔐  Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center', padding: 20, overflow: 'hidden' as any },
  blob:   { position: 'absolute', borderRadius: 999 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28, padding: 32,
    width: '100%', maxWidth: 480,
    alignItems: 'center',
    shadowColor: '#6c63ff', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 12,
    overflow: 'hidden' as any,
  },
  cardDesktop: { maxWidth: 720, padding: 56 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#6c63ff' },
  homeLogo: { width: 100, height: 100, borderRadius: 24, marginBottom: 18, marginTop: 8 },
  title:  { fontSize: 30, fontWeight: '800', color: '#1e1b4b', textAlign: 'center', lineHeight: 42, marginBottom: 12 },
  sub:    { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  badges: { flexDirection: 'row', gap: 10, marginBottom: 28, flexWrap: 'wrap' as any, justifyContent: 'center' },
  badge:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  btnPrimary: {
    backgroundColor: '#6c63ff', paddingVertical: 16, borderRadius: 50,
    alignItems: 'center', width: '100%', marginBottom: 14,
    shadowColor: '#6c63ff', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  btnPrimaryText:  { color: '#fff', fontSize: 18, fontWeight: '800' },
  btnSecondary: {
    borderWidth: 2, borderColor: '#6c63ff',
    backgroundColor: '#f5f3ff',
    paddingVertical: 14, borderRadius: 50, alignItems: 'center', width: '100%',
  },
  btnSecondaryText: { color: '#6c63ff', fontSize: 16, fontWeight: '700' },
});
