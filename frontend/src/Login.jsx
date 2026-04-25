import React, { useState } from 'react';
import { auth } from './firebase'; // This uses the engine we just built
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  // 1. STATE: These remember what the user types and what mode we are in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // false = Login mode, true = Signup mode

  const handleAuth = async () => {
    try {
      if (isSignup) {
        // This is the "Create Account" engine
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created! Welcome to the Buzz.");
      } else {
        // This is the "Login" engine
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Auth Error: " + error.message);
    }
  };

  return (
    /* min-h-dvh: Keeps content visible above the iPhone keyboard */
    <div className="flex flex-col items-center justify-center min-h-dvh bg-zinc-900 text-white p-6">
      
      <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tighter italic">Rumour</h1>
          <p className="text-zinc-400 mt-2">
            {isSignup ? "Join the community." : "Bridge the gap to your community."}
          </p>
        </header>

        <div className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-white outline-none"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-white outline-none"
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button 
            onClick={handleAuth}
            className="w-full p-4 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform"
          >
            {isSignup ? "Create Account" : "Enter the Buzz"}
          </button>
        </div>

        {/* 2. THE TOGGLE BUTTON: This flips the 'isSignup' switch */}
        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="text-zinc-500 text-sm hover:text-zinc-300"
        >
          {isSignup 
            ? "Already have an account? Log in" 
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
};

export default Login;