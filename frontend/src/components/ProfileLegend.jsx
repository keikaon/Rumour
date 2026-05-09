import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ProfileLegend = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setProfile(user));
    return unsubscribe;
  }, []);

  const userDisplay = useMemo(() => {
    const name = profile?.displayName || profile?.email?.split('@')[0] || 'Field Agent';
    const email = profile?.email || 'demo@rumour.app';
    const isVerified = profile?.emailVerified;
    const createdAt = profile?.metadata?.creationTime ? new Date(profile.metadata.creationTime).toLocaleDateString() : 'Unknown';
    const lastSignIn = profile?.metadata?.lastSignInTime ? new Date(profile.metadata.lastSignInTime).toLocaleString() : 'Unknown';
    const provider = profile?.providerData?.[0]?.providerId?.replace('password', 'email') || 'email';
    const rumoursStarted = profile?.rumoursStarted ?? 0;
    const attendeesCount = profile?.attendeesCount ?? 0;

    return {
      name,
      email,
      isVerified,
      createdAt,
      lastSignIn,
      provider,
      rumoursStarted,
      attendeesCount,
    };
  }, [profile]);

  return (
    <>
      {/* BACKGROUND BLUR OVERLAY */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-xl z-[120] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* THE SLIDE-OUT PANEL */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-[340px] bg-zinc-950/98 border-r border-zinc-800 z-[130] overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] profile-legend-panel ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-green-400 via-cyan-300 to-blue-500" />
        <div className="relative min-h-full pt-6 pb-10">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800 p-6 flex justify-between items-center z-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">FIELD PROTOCOL</p>
            <h2 className="text-white font-black text-3xl uppercase tracking-[0.18em] leading-tight">Field Guide</h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">Rumour Protocol v3.0</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-[0_0_25px_rgba(0,0,0,0.25)]">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-10">

          {/* USER PROFILE SUMMARY */}
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/85 p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-black text-white">{userDisplay.name.slice(0,2).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Field Agent</p>
                  <h3 className="text-xl font-black uppercase tracking-[0.1em] text-white truncate max-w-full">{userDisplay.name}</h3>
                  <p className="text-[9px] leading-tight uppercase tracking-[0.25em] text-zinc-500 mt-1 break-words">{userDisplay.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 min-h-[98px] flex flex-col justify-center items-center text-center gap-2">
                <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">Joined</p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white leading-tight">{userDisplay.createdAt}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 min-h-[98px] flex flex-col justify-center items-center text-center gap-2">
                <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">Last Active</p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white leading-tight">{userDisplay.lastSignIn}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 min-h-[98px] flex flex-col justify-center items-center text-center gap-2">
                <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">Provider</p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white leading-tight">{userDisplay.provider}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 min-h-[98px] flex flex-col justify-center items-center text-center gap-3 min-w-0 overflow-hidden">
                <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">Status</p>
                <span className={`inline-flex max-w-[120px] items-center gap-1 rounded-full border border-zinc-700 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap text-ellipsis overflow-hidden ${userDisplay.isVerified ? 'bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]' : 'bg-zinc-900/80 text-zinc-400 shadow-[0_0_18px_rgba(255,255,255,0.12)]'}`}>
                  <span className={`w-2 h-2 rounded-full ${userDisplay.isVerified ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' : 'bg-zinc-600 shadow-[0_0_10px_rgba(255,255,255,0.12)]'}`} />
                  {userDisplay.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/85 p-4 shadow-[0_0_35px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-3 text-white mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Verification Progress</p>
                  <h3 className="text-sm font-black uppercase tracking-[0.15em]">Rumour Impact</h3>
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">{userDisplay.isVerified ? 'Verified' : 'Work in Progress'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">Rumours Started</p>
                  <p className="mt-3 text-2xl font-black uppercase tracking-[0.1em] text-white">{userDisplay.rumoursStarted}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-500">People Reached</p>
                  <p className="mt-3 text-2xl font-black uppercase tracking-[0.1em] text-white">{userDisplay.attendeesCount}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 1. THE PROXIMITY GATE */}
          <section>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">1. The Proximity Gate</h3>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">Signals are encrypted based on your physical distance. You must walk to decrypt the data.</p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center animate-pulse"><span className="text-zinc-600 text-xs">?</span></div>
                <div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Ghost Mode <span className="text-zinc-600 font-mono">(&gt; 5km)</span></h4>
                  <p className="text-zinc-500 text-[10px] mt-1">Invisible. Protects city-wide privacy.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]"><div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"/></div>
                <div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">The Pulse <span className="text-zinc-600 font-mono">(3km - 5km)</span></h4>
                  <p className="text-zinc-500 text-[10px] mt-1">Massive glowing auras. Reveals event category only.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center"><span className="text-xs opacity-50">📡</span></div>
                <div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Faint Signal <span className="text-zinc-600 font-mono">(1km - 3km)</span></h4>
                  <p className="text-zinc-500 text-[10px] mt-1">Reveals the general neighborhood/zone.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center text-green-500"><span className="text-xs">🪝</span></div>
                <div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">The Hook <span className="text-zinc-600 font-mono">(200m - 1km)</span></h4>
                  <p className="text-zinc-500 text-[10px] mt-1">Intercepts a cryptic text teaser from the host.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-white flex items-center justify-center text-black"><span className="text-xs">🎯</span></div>
                <div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">The Target <span className="text-zinc-600 font-mono">(&lt; 200m)</span></h4>
                  <p className="text-zinc-500 text-[10px] mt-1">Full decryption. Exact location and check-in access.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SIGNAL FREQUENCIES (COLORS) */}
          <section>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">2. Signal Frequencies</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-gradient-to-tr from-green-500 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Party</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Art</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Giveaway</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Music</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Food</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Gaming</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Fitness</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-500 shadow-[0_0_10px_rgba(113,113,122,0.5)]"/><span className="text-[10px] font-black text-white uppercase tracking-widest">Meetup</span></div>
            </div>
          </section>

          {/* 3. FIELD TOOLS */}
          <section>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">3. Field Tools</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><span className="animate-pulse">📡</span> Signal Scanner</h4>
                <p className="text-zinc-400 text-[10px] leading-relaxed">Initiate a Sonar Sweep to intercept all active frequencies in the city grid. Generates an Intel Report prioritizing the closest connections.</p>
              </div>

              <div>
                <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><span>🤫</span> Secret Doors</h4>
                <p className="text-zinc-400 text-[10px] leading-relaxed">Highly classified events. Even at &lt; 200m, details remain locked until the correct passphrase is entered at the gate.</p>
              </div>

              <div>
                <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><span className="animate-pulse text-red-500">●</span> Ephemeral Clocks</h4>
                <p className="text-zinc-400 text-[10px] leading-relaxed">All data self-destructs. Watch the live countdown timers. Timers turn red when an event has less than 1 hour remaining.</p>
              </div>
            </div>
          </section>

          {/* 4. TRUST & SECURITY */}
          <section className="mb-10">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">4. Trust & Security</h3>
            
            <div className="flex items-start gap-4 bg-zinc-900/80 border border-zinc-700 p-4 rounded-[2rem] shadow-[0_0_45px_rgba(0,0,0,0.25)]">
              <span className="text-xl mt-1 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">★</span>
              <div>
                <span className="text-[10px] text-amber-300 font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mb-2">
                  Verified Source
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Hosts bearing this badge have successfully completed 5+ confirmed Rumours with over 30 verified participants. They are highly reliable.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        /* Custom Scrollbar for ProfileLegend */
        .profile-legend-panel::-webkit-scrollbar {
          width: 6px;
        }
        .profile-legend-panel::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .profile-legend-panel::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
          border: 1px solid #1f2937;
        }
        .profile-legend-panel::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        .profile-legend-panel {
          scrollbar-width: thin;
          scrollbar-color: #374151 #1f2937;
        }
      `}} />
    </>
  );
};

export default ProfileLegend;