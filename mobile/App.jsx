import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import colors from './src/theme/colors';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#f8fafc',
    background: colors.background,
    card: colors.background,
    text: '#ffffff',
    border: colors.border,
    notification: '#22c55e',
  },
};

const SAFE_AREA_EDGES = ['top', 'left', 'right'];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaProvider style={styles.provider}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {loading ? (
        <SafeAreaView style={styles.loadingContainer} edges={SAFE_AREA_EDGES}>
          <ActivityIndicator size="large" color="#ffffff" />
        </SafeAreaView>
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <SafeAreaView style={styles.root} edges={SAFE_AREA_EDGES}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              {user ? (
                <Stack.Screen name="Home">
                  {props => <HomeScreen {...props} user={user} onSignOut={handleSignOut} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ keyboardHandlingEnabled: false }}
                />
              )}
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
