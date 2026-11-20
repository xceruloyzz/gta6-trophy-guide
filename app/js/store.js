// Progress store: what the player has earned, their counters and notes, saved in
// localStorage. Nothing leaves the browser; export/import move the same JSON.
export const STORAGE_KEY = 'leonida-platinum-v1';
export const APP_TAG = 'leonida-platinum';

export function createEmptyState() {
  return { earned: [], counters: {}, notes: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createEmptyState();
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return createEmptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private mode): progress still works in memory.
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
}

export function setCounter(state, id, value, target) {
  const n = Math.max(0, Math.min(target, Math.floor(Number(value) || 0)));
  if (n === 0) delete state.counters[id];
  else state.counters[id] = n;
  return n;
}

export function counterOf(state, id) {
  return state.counters[id] || 0;
}

export function setNote(state, id, text) {
  const clean = String(text).slice(0, 500);
  if (clean.trim() === '') delete state.notes[id];
  else state.notes[id] = clean;
}

export function noteOf(state, id) {
  return state.notes[id] || '';
}

export function exportProgress(state) {
  const payload = {
    app: APP_TAG,
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    counters: state.counters,
    notes: state.notes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export async function importProgressFile(file, totalIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const validIds = new Set(totalIds);
  const next = createEmptyState();
  if (Array.isArray(parsed.earned)) {
    next.earned = parsed.earned.filter((n) => validIds.has(n));
  } else if (Array.isArray(parsed)) {
    next.earned = parsed.filter((n) => validIds.has(n));
  }
  if (parsed && typeof parsed === 'object' && parsed.counters) {
    for (const [k, v] of Object.entries(parsed.counters)) {
      const id = Number(k);
      if (validIds.has(id) && Number.isFinite(v) && v > 0) next.counters[id] = Math.floor(v);
    }
  }
  if (parsed && typeof parsed === 'object' && parsed.notes) {
    for (const [k, v] of Object.entries(parsed.notes)) {
      const id = Number(k);
      if (validIds.has(id) && typeof v === 'string') next.notes[id] = v.slice(0, 500);
    }
  }
  return next;
}

// Demo progress used only for the maker's screenshots (?shot=...): 13 earned,
// a few counters part-way. Never written to localStorage.
export function demoState() {
  return {
    earned: [2, 3, 8, 15, 16, 17, 20, 21, 28, 33, 35, 42, 52],
    counters: { 15: 120, 31: 47, 35: 63, 42: 30, 32: 22, 52: 96400, 53: 41200 },
    notes: { 28: 'Did the Chapter 1 balcony meditation with Lucia.' },
    spoiler: false,
  };
}
