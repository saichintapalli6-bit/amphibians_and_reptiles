import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const unauthenticatedRoutes = ['/', '/login', '/register', '/admin-login'];
  const isUnauthenticated = unauthenticatedRoutes.includes(pathname);

  const navItems = isUnauthenticated ? [
    { label: 'Home', path: '/' },
    { label: 'User Login', path: '/login' },
    { label: 'Admin Login', path: '/admin-login' },
    { label: 'Create Account', path: '/register' },
  ] : [
    { label: 'Home', path: '/user-home' },
    { label: 'Analysis', path: '/detection' },
    { label: 'Logout', path: '/' },
  ];

  return (
    <View style={[
      styles.sidebar, 
      isUnauthenticated ? styles.sidebarUnauth : styles.sidebarAuth
    ]}>
      {isUnauthenticated ? (
        <Text style={styles.titleUnauth}>Reptiles & Amphibians</Text>
      ) : (
        <Text style={styles.titleAuth}>Dashboard</Text>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navContainer}
        style={{ flex: 1, marginLeft: 10 }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.label === 'Logout' && false);
          return (
            <TouchableOpacity 
              key={item.label} 
              style={[
                styles.navButton, 
                isActive && styles.activeNavButton,
                isUnauthenticated ? styles.navButtonUnauth : styles.navButtonAuth,
                isActive && !isUnauthenticated && styles.activeNavButtonAuth
              ]} 
              onPress={() => {
                if(item.label === 'Logout') {
                  router.replace(item.path as any);
                } else {
                  router.push(item.path as any);
                }
              }}
            >
              <Text style={[
                styles.navButtonText,
                !isUnauthenticated && { color: isActive ? '#000' : '#000' }
              ]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  sidebarUnauth: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sidebarAuth: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    elevation: 8,
  },
  titleUnauth: {
    color: '#FFA500', // Gold/Orange Title
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleAuth: {
    display: 'none',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  navButtonUnauth: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  navButtonAuth: {
    backgroundColor: '#34495e',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  activeNavButton: {
    backgroundColor: '#0056b3',
  },
  activeNavButtonAuth: {
    backgroundColor: '#e0e0e0',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
