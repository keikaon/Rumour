import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

const firebaseExtra = Constants.expoConfig?.extra?.firebase;

const firebaseConfig = {
  apiKey: firebaseExtra?.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: firebaseExtra?.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseExtra?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket:
    firebaseExtra?.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId:
    firebaseExtra?.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseExtra?.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingRequired = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingRequired.length > 0) {
  console.warn(
    `[Rumour] Firebase config missing required keys (${missingRequired.join(', ')}). ` +
      'Set EXPO_PUBLIC_FIREBASE_* in mobile/.env or VITE_FIREBASE_* in frontend/.env, then restart Expo.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
