import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Validate required environment variables
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(", ")}. ` +
      `Please check your .env file and ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ` +
      `and VITE_FIREBASE_PROJECT_ID are set.`,
  );
}

const firebaseConfig = requiredEnvVars;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth tool so App.jsx and Login.jsx can use it
export const auth = getAuth(app);
