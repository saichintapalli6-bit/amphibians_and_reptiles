import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const menuItems = [
  { icon: '👥', label: 'Manage Registered Users', route: '/user-management', color: '#e94560' },
  { icon: '🚪', label: 'Logout',                  route: '/',               color: '#555' },
];

export default function AdminHomeScreen() {
  const router  = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️  Admin Dashboard</Text>
        <Text style={styles.headerSub}>Reptile & Amphibian Classification System</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { emoji: '🦎', label: 'AI Model', value: 'Active' },
              { emoji: '📊', label: 'System',   value: 'Online' },
              { emoji: '🔐', label: 'Admin',    value: 'Logged In' },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Menu */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuCard, { borderLeftColor: item.color }]}
              onPress={() => {
                if (item.label === 'Logout') router.replace(item.route as any);
                else router.push(item.route as any);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: {
    backgroundColor: '#1a1a3e',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233,69,96,0.3)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  body: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#e94560', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 12, letterSpacing: 0.5 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 4,
  },
  menuIcon:  { fontSize: 26, marginRight: 16 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  menuArrow: { fontSize: 24, color: 'rgba(255,255,255,0.3)' },
});
