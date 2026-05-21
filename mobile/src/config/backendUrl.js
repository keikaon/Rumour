import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the API base URL for the current platform.
 * - iOS Simulator: localhost:5000 (backend direct)
 * - Android emulator: 10.0.2.2:5000
 * - Physical device: set EXPO_PUBLIC_BACKEND_URL to http://<LAN-IP>:5000
 */
export function getBackendUrl() {
  const configured = Constants.expoConfig?.extra?.backendUrl;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'http://localhost:5000';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
}
