const path = require('path');

// Load order: shared env first, then mobile/.env wins (override) for EXPO_PUBLIC_*
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const env = (expoKey, viteKey) =>
  process.env[expoKey] || (viteKey ? process.env[viteKey] : '') || '';

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const firebase = {
  apiKey: env('EXPO_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'),
  authDomain: env('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('EXPO_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID'),
};

module.exports = {
  expo: {
    name: 'Rumour',
    slug: 'rumour-mobile',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'rumour',
    platforms: ['ios', 'android', 'web'],
    userInterfaceStyle: 'dark',
    backgroundColor: '#09090b',
    updates: {
      fallbackToCacheTimeout: 0,
    },
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#09090b',
    },
    assetBundlePatterns: ['**/*'],
    extra: {
      backendUrl,
      firebase,
    },
    ios: {
      supportsTablet: true,
      backgroundColor: '#09090b',
      bundleIdentifier: 'com.rumour.mobile',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Rumour uses your location to find hyper-local signals and events near you.',
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            localhost: {
              NSExceptionAllowsInsecureHTTPLoads: true,
            },
          },
        },
      },
    },
    android: {
      package: 'com.rumour.mobile',
      backgroundColor: '#09090b',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Rumour uses your location to find hyper-local signals and events near you.',
        },
      ],
    ],
  },
};
