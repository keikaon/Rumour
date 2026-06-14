import React, { useEffect, useState } from "react";
import { BUZZ_TYPES, DURATION_OPTIONS, MAX_LENGTHS } from "./createBuzzTypes";
import useCreateBuzz from "./useCreateBuzz";

const inputClass =
  "w-full p-4 bg-secondary-900 border border-secondary-800 rounded-xl text-plain-100 placeholder-plain-300 focus:ring-2 focus:ring-primary-500 outline-none";

const CreateBuzzModal = ({ visible, onClose, location, onSuccess }) => {
  const [lockedLocation, setLockedLocation] = useState(null);

  useEffect(() => {
    if (visible) setLockedLocation(location || null);
    else setLockedLocation(null);
  }, [visible, location]);

  const { form, updateField, resetForm, submit, submitting, error } =
    useCreateBuzz({
      location: lockedLocation || location,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-secondary-900/70 backdrop-blur-xl pointer-events-auto"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-secondary-900/95 border border-secondary-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl pointer-events-auto mx-0 sm:mx-4 mb-0 sm:mb-4">
        <div className="h-1 w-12 bg-gradient-to-r from-primary-400 via-secondary-500 to-tertiary-500 rounded-full mx-auto mt-4" />

        <div className="p-6 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Start Signal
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-plain-300 mt-1">
                Broadcast from your coordinates
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-secondary-900 border border-secondary-800 text-plain-300 hover:text-white flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-plain-300 mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {BUZZ_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("type", type)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      form.type === type
                        ? "border-primary-500 bg-primary-500/10 text-plain-100"
                        : "border-secondary-800 bg-secondary-900 text-plain-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-plain-300 mb-2 block">
                Title *
              </label>
              <input
                className={inputClass}
                placeholder="Signal title"
                value={form.title}
                maxLength={MAX_LENGTHS.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-plain-300 mb-2 block">
                Teaser
              </label>
              <input
                className={inputClass}
                placeholder="Cryptic hook for distant scanners"
                value={form.teaser}
                maxLength={MAX_LENGTHS.teaser}
                onChange={(e) => updateField("teaser", e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-plain-300 mb-2 block">
                Description
              </label>
              <textarea
                className={`${inputClass} min-h-[88px] resize-none`}
                placeholder="Full intel at Tier 5 range"
                value={form.description}
                maxLength={MAX_LENGTHS.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            {/* Zone name removed — signals locked to GPS coordinates */}

            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-plain-300">
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
                onChange={(e) =>
                  updateField(
                    "durationHours",
                    DURATION_OPTIONS[Number(e.target.value)],
                  )
                }
                className="rumour-slider"
                style={{
                  background: `linear-gradient(90deg, rgba(83,172,117,0.95) ${
                    (DURATION_OPTIONS.indexOf(form.durationHours) /
                      (DURATION_OPTIONS.length - 1)) *
                    100
                  }%, rgba(71,1,7,0.18) ${
                    (DURATION_OPTIONS.indexOf(form.durationHours) /
                      (DURATION_OPTIONS.length - 1)) *
                    100
                  }%)`,
                }}
              />
              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.3em]">
                {DURATION_OPTIONS.map((hours) => (
                  <span
                    key={hours}
                    className={`text-center rounded-full py-1 ${
                      form.durationHours === hours
                        ? "bg-plain-100/10 text-plain-100 font-black"
                        : "text-plain-300"
                    }`}
                  >
                    {hours}h
                  </span>
                ))}
              </div>
              <p className="text-xs text-plain-300 mt-3">
                Expires in {form.durationHours} hour
                {form.durationHours > 1 ? "s" : ""}. Locked to your GPS
                position.
              </p>
            </div>

            <label className="flex items-center justify-between py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary-300">
                Secret door
              </span>
              <input
                type="checkbox"
                checked={form.isSecret}
                onChange={(e) => updateField("isSecret", e.target.checked)}
                className="w-5 h-5 accent-red-500"
              />
            </label>

            {form.isSecret ? (
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-plain-300 mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Case-sensitive passphrase"
                  value={form.password}
                  maxLength={MAX_LENGTHS.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-secondary-700/60 bg-secondary-700/10 px-4 py-3">
                <p className="text-sm text-secondary-100">{error}</p>
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-4 rounded-xl border border-secondary-700 text-plain-300 text-[10px] font-black uppercase tracking-widest hover:bg-secondary-900"
                disabled={submitting}
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 bg-plain-100 text-secondary-900 font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {submitting ? "Transmitting…" : "Transmit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBuzzModal;
