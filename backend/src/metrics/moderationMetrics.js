const MAX_HISTORY = 200;

const state = {
  totalAttempts: 0,
  successes: 0,
  failures: 0,
  totalDurationMs: 0,
  lastAttemptAt: null,
  history: [],
};

function recordAttempt({ success, durationMs = 0, attemptNumber = 1, error = null }) {
  state.totalAttempts += 1;
  state.lastAttemptAt = Date.now();
  if (success) state.successes += 1;
  else state.failures += 1;
  state.totalDurationMs += Number(durationMs || 0);

  const entry = {
    ts: state.lastAttemptAt,
    success: Boolean(success),
    durationMs: Number(durationMs || 0),
    attemptNumber: Number(attemptNumber || 1),
    error: error ? String(error) : null,
  };
  state.history.push(entry);
  if (state.history.length > MAX_HISTORY) state.history.shift();
}

function snapshot() {
  const avgDuration = state.totalAttempts ? Math.round(state.totalDurationMs / state.totalAttempts) : 0;
  return {
    totalAttempts: state.totalAttempts,
    successes: state.successes,
    failures: state.failures,
    totalDurationMs: state.totalDurationMs,
    avgDurationMs: avgDuration,
    lastAttemptAt: state.lastAttemptAt,
    recent: state.history.slice(-20),
  };
}

function reset() {
  state.totalAttempts = 0;
  state.successes = 0;
  state.failures = 0;
  state.totalDurationMs = 0;
  state.lastAttemptAt = null;
  state.history = [];
}

module.exports = { recordAttempt, snapshot, reset };
