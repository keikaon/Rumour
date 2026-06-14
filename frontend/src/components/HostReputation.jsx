import React from 'react';

const HostReputation = ({ stats }) => {
  // THE LOGIC: Checks if they hit your required milestones
  const isVerifiedHost = stats.rumoursStarted >= 5 && stats.totalParticipation > 30;

  return (
    <div className="bg-secondary-900/50 rounded-xl p-4 border border-secondary-800/50">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-bold text-plain-300 uppercase tracking-[0.2em]">Host Reputation</p>
        
        {/* If they pass the test, show the badge! */}
        {isVerifiedHost && (
          <span className="text-[8px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(83,172,117,0.2)]">
            ★ Verified
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* PROGRESS BAR 1: Rumours Started */}
        <div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-plain-300 mb-1.5">
            <span>Rumours Started</span>
            <span className={stats.rumoursStarted >= 5 ? "text-amber-400" : "text-white"}>
              {stats.rumoursStarted} / 5
            </span>
          </div>
          <div className="w-full bg-secondary-900 rounded-full h-1.5 overflow-hidden border border-secondary-800">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
              style={{ width: `${Math.min((stats.rumoursStarted / 5) * 100, 100)}%` }} 
            />
          </div>
        </div>
        
        {/* PROGRESS BAR 2: Total Participation */}
        <div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-plain-300 mb-1.5">
            <span>Total Participation</span>
            <span className={stats.totalParticipation > 30 ? "text-amber-400" : "text-white"}>
              {stats.totalParticipation} / 30
            </span>
          </div>
          <div className="w-full bg-secondary-900 rounded-full h-1.5 overflow-hidden border border-secondary-800">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
              style={{ width: `${Math.min((stats.totalParticipation / 30) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostReputation;