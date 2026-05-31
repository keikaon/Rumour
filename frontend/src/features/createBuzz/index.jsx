import React, { useState } from 'react';
import CreateBuzzModal from './CreateBuzzModal';

export function CreateBuzzFeature({ location, locationReady, onSuccess }) {
  const [visible, setVisible] = useState(false);
  const disabled = !locationReady || !location;

  return (
    <>
      <button
        type="button"
        onClick={() => setVisible(true)}
        disabled={disabled}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-zinc-900/95 border border-green-500/40 rounded-full pl-3 pr-5 py-2.5 shadow-[0_0_20px_rgba(34,197,94,0.25)] disabled:opacity-45 active:scale-95 transition-all"
      >
        <span className="w-9 h-9 rounded-full bg-green-500 text-black font-black text-xl flex items-center justify-center leading-none">
          +
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white">
          Start Signal
        </span>
      </button>

      <CreateBuzzModal
        visible={visible}
        onClose={() => setVisible(false)}
        location={location}
        onSuccess={onSuccess}
      />
    </>
  );
}

export default CreateBuzzFeature;
