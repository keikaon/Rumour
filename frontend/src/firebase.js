import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// These values come from the .env file you created earlier
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth tool so App.jsx and Login.jsx can use it
export const auth = getAuth(app);