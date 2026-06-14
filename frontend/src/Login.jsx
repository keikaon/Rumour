import React, { useState } from 'react';
import { auth } from './firebase'; // This uses the engine we just built
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  // 1. STATE: These remember what the user types and what mode we are in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // false = Login mode, true = Signup mode
  const [authError, setAuthError] = useState('');

  const handleAuth = async () => {
    try {
      setAuthError('');
      if (isSignup) {
        // This is the "Create Account" engine
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // This is the "Login" engine
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return (
    /* min-h-dvh: Keeps content visible above the iPhone keyboard */
    <div className="flex flex-col items-center justify-center min-h-dvh bg-primary-900 text-plain-100 p-6">
      
      <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tighter italic">Rumour</h1>
          <p className="text-secondary-200 mt-2">
            {isSignup ? "Join the community." : "Bridge the gap to your community."}
          </p>
        </header>

        <div className="w-full space-y-4">
          <div className={`overflow-hidden rounded-3xl border border-secondary-500/40 bg-secondary-500/10 transition-all duration-300 ease-out ${authError ? 'max-h-40 py-4 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-2 pointer-events-none'}`} aria-live="polite">
            <div className={`space-y-2 px-4 ${authError ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-secondary-200">Authentication error</p>
              <p className="text-sm leading-snug text-secondary-100">{authError || ' '}</p>
            </div>
          </div>
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-secondary-900 border border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAuthError(''); }} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-secondary-900 border border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(''); }} 
          />
          
          <button 
            onClick={handleAuth}
            className="w-full p-4 bg-primary-500 text-plain-100 font-bold rounded-xl active:scale-95 transition-transform"
          >
            {isSignup ? "Create Account" : "Enter the Buzz"}
          </button>
        </div>

        {/* 2. THE TOGGLE BUTTON: This flips the 'isSignup' switch */}
        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="text-secondary-200 text-sm hover:text-secondary-100"
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