import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useEffect } from 'react';
import SideBar from '../components/SideBar';
import 'react-native-reanimated';

const unauthRoutes    = ['/', '/login', '/register', '/admin-login'];
const noSidebarRoutes = ['/user-home', '/admin-home'];

export default function RootLayout() {
  const pathname    = usePathname();
  const { width, height } = useWindowDimensions();
  const isUnauth    = unauthRoutes.includes(pathname);
  const showSidebar = !noSidebarRoutes.includes(pathname);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `html,body,#root{height:100%!important;margin:0;padding:0;overflow:hidden;}*{box-sizing:border-box;}`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const screenStyle = Platform.OS === 'web'
    ? { width, minHeight: height, height }
    : { flex: 1 };

  const innerContent = (
    <View style={[styles.inner, screenStyle]}>
      {showSidebar && <SideBar />}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#6c63ff' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: 'transparent', flex: 1 },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index"           options={{ headerShown: false }} />
          <Stack.Screen name="login"           options={{ headerShown: false }} />
          <Stack.Screen name="register"        options={{ headerShown: false }} />
          <Stack.Screen name="admin-login"     options={{ headerShown: false }} />
          <Stack.Screen name="user-home"       options={{ headerShown: false }} />
          <Stack.Screen name="admin-home"      options={{ headerShown: false }} />
          <Stack.Screen name="detection"       options={{ title: 'Reptile & Amphibian Detection', headerLeft: () => null }} />
          <Stack.Screen name="accuracy"        options={{ title: 'Model Training Results',       headerLeft: () => null }} />
          <Stack.Screen name="user-management" options={{ title: 'Manage Users',                 headerLeft: () => null }} />
        </Stack>
      </View>
    </View>
  );

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={[styles.root, screenStyle]}>
        {innerContent}
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f0f4ff' },
  inner:   { flex: 1, flexDirection: 'column' },
  content: { flex: 1 },
});
