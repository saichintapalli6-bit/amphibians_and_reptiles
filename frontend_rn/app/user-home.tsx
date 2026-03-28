import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform, useWindowDimensions, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const menuItems = [
  { icon: '🔬', label: 'Start Analysis',      sub: 'Upload image & detect species',     route: '/detection', color: '#34d399', glow: '#10b981' },
  { icon: '📊', label: 'View Model Results',  sub: 'Check training accuracy & metrics',  route: '/accuracy',  color: '#60a5fa', glow: '#3b82f6' },
  { icon: '🚪', label: 'Logout',              sub: 'Sign out of your account',           route: '/',          color: '#f87171', glow: '#e94560', replace: true },
];

export default function UserHomeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const fade  = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(40)).current;
  const itemAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    menuItems.forEach((_, i) => {
      setTimeout(() => {
        Animated.spring(itemAnims[i], { toValue: 1, friction: 7, useNativeDriver: true }).start();
      }, 150 + i * 120);
    });
  }, []);

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>
          {/* Welcome header */}
          <View style={styles.welcome}>
            <Image source={require('../assets/images/app_logo.png')} style={styles.dashboardLogo} />
            <Text style={styles.welcomeTitle}>
              Welcome{name ? `, ${name}` : ''}!
            </Text>
            <Text style={styles.welcomeSub}>
              Reptile & Amphibian Classification System
            </Text>
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            {[['🦎', 'Species', 'Database'], ['🤖', 'AI', 'Powered'], ['⚡', 'Fast', 'Results']].map(([icon, v, l]) => (
              <View key={l} style={styles.statCard}>
                <Text style={styles.statEmoji}>{icon}</Text>
                <Text style={styles.statValue}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Menu cards */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {menuItems.map((item, i) => (
            <Animated.View
              key={item.label}
              style={{
                opacity: itemAnims[i],
                transform: [{ translateX: itemAnims[i].interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
              }}
            >
              <TouchableOpacity
                style={[styles.menuCard, { borderLeftColor: item.color }]}
                onPress={() => {
                  if (item.replace) router.replace(item.route as any);
                  else router.push(item.route as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.menuIconBox, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
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
  blob1: { width: 350, height: 350, backgroundColor: 'rgba(52,211,153,0.10)', top: -80, right: -80 },
  blob2: { width: 280, height: 280, backgroundColor: 'rgba(96,165,250,0.10)', bottom: -60, left: -60 },
  scroll: { flexGrow: 1, padding: 20, maxWidth: 700, width: '100%', alignSelf: 'center' as any },

  welcome: { alignItems: 'center', paddingVertical: 32 },
  dashboardLogo: { width: 90, height: 90, borderRadius: 20, marginBottom: 16 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  welcomeSub:   { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statEmoji: { fontSize: 26, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#e94560', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' as any },

  menuCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 4,
  },
  menuIconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuIcon:    { fontSize: 26 },
  menuTextBox: { flex: 1 },
  menuLabel:   { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  menuSub:     { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  menuArrow:   { fontSize: 26, color: 'rgba(255,255,255,0.25)' },
});
