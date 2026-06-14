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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-secondary-900/95 border border-primary-500/40 rounded-full pl-3 pr-5 py-2.5 shadow-[0_0_20px_rgba(83,172,117,0.25)] disabled:opacity-45 active:scale-95 transition-all"
      >
        <span className="w-9 h-9 rounded-full bg-primary-500 text-secondary-900 font-black text-2xl grid place-items-center leading-none text-center">
          +
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-plain-100">
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
