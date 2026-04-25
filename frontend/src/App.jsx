import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Connects to your Firebase engine
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login'; 

// FIXED IMPORT: Telling the app to look inside the "components" folder
import MapContainer from './components/MapContainer'; 

import './App.css';

function App() {
  // State to track if a human is logged in or not
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function listens for login or logout events
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop showing the loading screen once we know the status
    });

    // Cleanup the listener when the app closes
    return () => unsubscribe();
  }, []);

  // 1. LOADING STATE
  // Prevents a "flicker" of the login page while checking the user's status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <p className="animate-pulse tracking-widest uppercase text-xs">Verifying Identity...</p>
      </div>
    );
  }

  // 2. THE GATEKEEPER LOGIC
  return (
    <div className="App">
      {user ? (
        /* If a user is found, show the Map */
        <MapContainer />
      ) : (
        /* If no user is found, show the Login Page */
        <Login />
      )}
    </div>
  );
}

export default App;