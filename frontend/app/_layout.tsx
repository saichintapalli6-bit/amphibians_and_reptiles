import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ImageBackground } from 'react-native';
import SideBar from '../components/SideBar';
import ScatteredDotsBackground from '../components/ScatteredDotsBackground';
import 'react-native-reanimated';

// Routes that show the background image (unauthenticated pages)
const unauthRoutes = ['/', '/login', '/register', '/admin-login'];

// Routes that DON'T show the top navigation bar
// (they have their own full-page layout)
const noSidebarRoutes = ['/user-home', '/admin-home'];

export default function RootLayout() {
  const pathname = usePathname();
  const isUnauthenticated = unauthRoutes.includes(pathname);
  const showSidebar = !noSidebarRoutes.includes(pathname);

  const innerContent = (
    <View style={styles.innerContainer}>
      {showSidebar && <SideBar />}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#D5006D' },
            headerTintColor: '#FFF',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index"           options={{ headerShown: false }} />
          <Stack.Screen name="login"           options={{ headerShown: false }} />
          <Stack.Screen name="register"        options={{ headerShown: false }} />
          <Stack.Screen name="admin-login"     options={{ headerShown: false }} />
          <Stack.Screen name="user-home"       options={{ headerShown: false }} />
          <Stack.Screen name="admin-home"      options={{ headerShown: false }} />
          <Stack.Screen name="detection"       options={{ title: 'Amphibians & Reptile Detection', headerLeft: () => null }} />
          <Stack.Screen name="accuracy"        options={{ title: 'Model Training Results', headerLeft: () => null }} />
          <Stack.Screen name="user-management" options={{ title: 'Manage Users', headerLeft: () => null }} />
        </Stack>
      </View>
    </View>
  );

  return (
    <ThemeProvider value={DefaultTheme}>
      {isUnauthenticated ? (
        <ImageBackground
          source={require('../assets/images/image.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          {innerContent}
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          <ScatteredDotsBackground />
          {innerContent}
        </View>
      )}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
});
