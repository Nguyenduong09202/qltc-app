// storage.js — versioned localStorage wrapper

const KEY = 'qlct.v1.state';
const VERSION = 1;

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== VERSION) {
      // future migration hook
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('[storage] parse error, resetting', e);
    return null;
  }
}

export function saveState(state) {
  try {
    state.version = VERSION;
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[storage] save failed', e);
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

export function subscribe(cb) {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) cb(loadState());
  });
}
