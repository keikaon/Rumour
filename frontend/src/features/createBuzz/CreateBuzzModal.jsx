import React from 'react';
import { BUZZ_TYPES, DURATION_OPTIONS, MAX_LENGTHS } from './createBuzzTypes';
import useCreateBuzz from './useCreateBuzz';

const inputClass =
  'w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white outline-none';

const CreateBuzzModal = ({ visible, onClose, location, onSuccess }) => {
  const { form, updateField, resetForm, submit, submitting, error } = useCreateBuzz({
    location,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  if (!visible) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await submit();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xl pointer-events-auto"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto mx-0 sm:mx-4 mb-0 sm:mb-4">
        <div className="h-1 w-12 bg-gradient-to-r from-green-400 via-cyan-300 to-blue-500 rounded-full mx-auto mt-4" />

        <div className="p-6 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Start Signal
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">
                Broadcast from your coordinates
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {BUZZ_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('type', type)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      form.type === type
                        ? 'border-green-500 bg-green-500/10 text-white'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Title *
              </label>
              <input
                className={inputClass}
                placeholder="Signal title"
                value={form.title}
                maxLength={MAX_LENGTHS.title}
                onChange={e => updateField('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Teaser
              </label>
              <input
                className={inputClass}
                placeholder="Cryptic hook for distant scanners"
                value={form.teaser}
                maxLength={MAX_LENGTHS.teaser}
                onChange={e => updateField('teaser', e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Description
              </label>
              <textarea
                className={`${inputClass} min-h-[88px] resize-none`}
                placeholder="Full intel at Tier 5 range"
                value={form.description}
                maxLength={MAX_LENGTHS.description}
                onChange={e => updateField('description', e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Zone name
              </label>
              <input
                className={inputClass}
                placeholder="Neighborhood or district"
                value={form.zone}
                maxLength={MAX_LENGTHS.zone}
                onChange={e => updateField('zone', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Signal duration
                </p>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {form.durationHours}h active
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={DURATION_OPTIONS.length - 1}
                step="1"
                value={DURATION_OPTIONS.indexOf(form.durationHours)}
                onChange={e => updateField('durationHours', DURATION_OPTIONS[Number(e.target.value)])}
                className="rumour-slider"
                style={{
                  background: `linear-gradient(90deg, rgba(34,197,94,0.95) ${
                    (DURATION_OPTIONS.indexOf(form.durationHours) /
                      (DURATION_OPTIONS.length - 1)) *
                    100
                  }%, rgba(71,85,105,0.18) ${
                    (DURATION_OPTIONS.indexOf(form.durationHours) /
                      (DURATION_OPTIONS.length - 1)) *
                    100
                  }%)`,
                }}
              />
              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.3em]">
                {DURATION_OPTIONS.map(hours => (
                  <span
                    key={hours}
                    className={`text-center rounded-full py-1 ${
                      form.durationHours === hours
                        ? 'bg-white/10 text-white font-black'
                        : 'text-zinc-500'
                    }`}
                  >
                    {hours}h
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                Expires in {form.durationHours} hour{form.durationHours > 1 ? 's' : ''}. Locked to
                your GPS position.
              </p>
            </div>

            <label className="flex items-center justify-between py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                Secret door
              </span>
              <input
                type="checkbox"
                checked={form.isSecret}
                onChange={e => updateField('isSecret', e.target.checked)}
                className="w-5 h-5 accent-red-500"
              />
            </label>

            {form.isSecret ? (
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Case-sensitive passphrase"
                  value={form.password}
                  maxLength={MAX_LENGTHS.password}
                  onChange={e => updateField('password', e.target.value)}
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-100">{error}</p>
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-4 rounded-xl border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900"
                disabled={submitting}
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {submitting ? 'Transmitting…' : 'Transmit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBuzzModal;
