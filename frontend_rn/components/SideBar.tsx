import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, useWindowDimensions, Modal, Pressable,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const unauthRoutes = ['/', '/login', '/register', '/admin-login'];
const adminRoutes  = ['/admin-home', '/user-management'];

const unauthNav = [
  { label: '🏠 Home',       path: '/',            color: '#6c63ff', bg: '#ede9fe' },
  { label: '🔐 User Login', path: '/login',       color: '#3b82f6', bg: '#dbeafe' },
  { label: '🛡️ Admin',      path: '/admin-login', color: '#d97706', bg: '#fef3c7' },
  { label: '📝 Register',   path: '/register',    color: '#10b981', bg: '#d1fae5' },
];
const adminNav = [
  { label: '🏠 Dashboard',    path: '/admin-home',      color: '#d97706', bg: '#fef3c7' },
  { label: '👥 Manage Users', path: '/user-management', color: '#3b82f6', bg: '#dbeafe' },
  { label: '🚪 Logout',       path: '/',                color: '#dc2626', bg: '#fee2e2', replace: true },
];
const userNav = [
  { label: '🏠 Home',   path: '/user-home', color: '#6c63ff', bg: '#ede9fe' },
  { label: '🔬 Detect', path: '/detection', color: '#10b981', bg: '#d1fae5' },
  { label: '🚪 Logout', path: '/',          color: '#dc2626', bg: '#fee2e2', replace: true },
];

export default function SideBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 700;

  const isUnauth = unauthRoutes.includes(pathname);
  const isAdmin  = adminRoutes.includes(pathname);
  const navItems = isUnauth ? unauthNav : isAdmin ? adminNav : userNav;
  const brandColor = isAdmin ? '#d97706' : '#6c63ff';

  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(240)).current; // Start hidden on the right
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0,   friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 240, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const navigate = (item: any) => {
    closeMenu();
    setTimeout(() => {
      if (item.replace) router.replace(item.path as any);
      else router.push(item.path as any);
    }, 220);
  };

  /* ── Desktop: classic horizontal bar ─────────────────────────────── */
  if (isDesktop) {
    return (
      <View style={styles.desktopBar}>
        <Text style={styles.brand}>🦎 <Text style={[styles.brandAccent, { color: brandColor }]}>Reptile AI</Text></Text>
        <View style={styles.desktopLinks}>
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.desktopBtn, active && { backgroundColor: item.bg, borderColor: item.color }]}
                onPress={() => navigate(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.desktopBtnText, { color: active ? item.color : '#6b7280' }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  /* ── Mobile: topbar + slide-in drawer ───────────────────────────── */
  return (
    <>
      {/* Top mini-bar */}
      <View style={styles.mobileBar}>
        <View style={styles.mobileRightHeader}>
          <Text style={styles.mobileBrand}>🦎 <Text style={[styles.brandAccent, { color: brandColor }]}>Reptile AI</Text></Text>
          <TouchableOpacity onPress={openMenu} style={styles.hamburger} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.hamLine} />
            <View style={[styles.hamLine, { width: 18 }]} />
            <View style={styles.hamLine} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer overlay */}
      {menuOpen && (
        <Modal transparent animationType="none" onRequestClose={closeMenu}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>

          {/* Drawer panel */}
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>🦎 Menu</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Nav items – vertical list */}
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.drawerItem,
                    active && { backgroundColor: item.bg, borderRightColor: item.color, borderRightWidth: 4 },
                  ]}
                  onPress={() => navigate(item)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.drawerItemText, { color: active ? item.color : '#374151' }]}>
                    {item.label}
                  </Text>
                  <Text style={{ color: active ? item.color : '#d1d5db', fontSize: 18 }}>›</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  /* Desktop */
  desktopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4, zIndex: 100,
  },
  brand:       { fontSize: 16, fontWeight: '800', color: '#111827', marginRight: 20, flexShrink: 0 },
  brandAccent: { },
  desktopLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' as any },
  desktopBtn: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
  },
  desktopBtnText: { fontSize: 13, fontWeight: '700' },

  /* Mobile topbar */
  mobileBar: {
    width: '100%',
    paddingVertical: 12, paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    elevation: 4, zIndex: 100,
    alignItems: 'flex-end',
  },
  mobileRightHeader: {
    alignItems: 'flex-end',
    gap: 4,
  },
  mobileBrand: { fontSize: 16, fontWeight: '800', color: '#111827' },
  hamburger:   { padding: 4, gap: 5, justifyContent: 'center', alignItems: 'flex-end' },
  hamLine:     { height: 2.5, width: 24, backgroundColor: '#374151', borderRadius: 2 },

  /* Drawer */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 200,
  },
  drawer: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 240, backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 300,
    shadowColor: '#000', shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 8,
  },
  drawerTitle:   { fontSize: 18, fontWeight: '800', color: '#111827' },
  closeBtn:      { padding: 4 },
  closeBtnText:  { fontSize: 18, color: '#9ca3af', fontWeight: '700' },
  drawerItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderRightWidth: 4, borderRightColor: 'transparent',
    borderBottomWidth: 1, borderBottomColor: '#f9fafb',
  },
  drawerItemText: { fontSize: 15, fontWeight: '700' },
});
