// Boot: load the trophy list, restore progress, wire the filters, tabs, detail
// pane, roadmap and missables views, and the export/import controls.
// ?shot=checklist|guide|roadmap|missables seeds demo progress in memory only, so
// the maker's screenshots show a lived-in guide without touching saved progress.
import {
  loadState,
  saveState,
  demoState,
  toggleEarned,
  setCounter,
  setNote,
  counterOf,
  exportProgress,
  importProgressFile,
} from './store.js';
import {
  updateProgress,
  renderTrophyList,
  renderDetail,
  renderRoadmap,
  renderMissables,
  renderSources,
  renderNextUp,
} from './views.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const shotMode = shot === 'checklist' || shot === 'guide' || shot === 'roadmap' || shot === 'missables';

const state = shotMode ? demoState() : loadState();
let selectedId = null;
let currentView = 'checklist';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourcesMap = doc.sources || {};
const byId = new Map(trophies.map((t) => [t.id, t]));

function persist() {
  if (!shotMode) saveState(state);
}

function filteredTrophies() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const grade = document.getElementById('gradeFilter').value;
  const kind = document.getElementById('kindFilter').value;
  const status = document.getElementById('statusFilter').value;
  return trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind === 'missable') {
      if (t.missable !== 'possible') return false;
    } else if (kind !== 'all' && t.kind !== kind) {
      return false;
    }
    if (status === 'earned' && !state.earned.includes(t.id)) return false;
    if (status === 'remaining' && state.earned.includes(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderAll() {
  updateProgress(trophies, state);
  renderNextUp(document.getElementById('nextUp'), trophies, state, selectTrophy);
  const shown = filteredTrophies();
  const earnedShown = shown.filter((t) => state.earned.includes(t.id)).length;
  document.getElementById('listMeta').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies (${earnedShown} earned in this view) · 28 hidden on PSN · 0 online trophies`;
  renderTrophyList(document.getElementById('trophyList'), shown, state, selectedId, callbacks);
  renderDetail(document.getElementById('detailPanel'), selectedId ? byId.get(selectedId) : null, state, sourcesMap, callbacks);
  renderRoadmap(document.getElementById('roadmapStages'), trophies, state, selectTrophy);
  renderMissables(document.getElementById('missablesList'), trophies, selectTrophy);
}

const callbacks = {
  onToggle(id) {
    toggleEarned(state, id);
    persist();
    renderAll();
  },
  onCounter(id, value) {
    const trophy = byId.get(id);
    if (!trophy || !trophy.count) return;
    setCounter(state, id, value, trophy.count.target);
    persist();
    renderAll();
  },
  onNote(id, text) {
    setNote(state, id, text);
    persist();
  },
  onSelect(id) {
    selectTrophy(id);
  },
};

function selectTrophy(id) {
  selectedId = id;
  showView('checklist');
  renderAll();
  const panel = document.getElementById('detailPanel');
  if (panel && window.innerWidth <= 900) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showView(view) {
  currentView = view;
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('hidden', section.id !== 'view-' + view);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  if (location.hash !== '#/' + view) history.replaceState(null, '', '#/' + view);
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    showView(tab.dataset.view);
    renderAll();
  });
}

document.getElementById('search').addEventListener('input', renderAll);
document.getElementById('gradeFilter').addEventListener('change', renderAll);
document.getElementById('kindFilter').addEventListener('change', renderAll);
document.getElementById('statusFilter').addEventListener('change', renderAll);
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  state.spoiler = event.target.checked;
  persist();
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    const next = await importProgressFile(file, trophies.map((t) => t.id));
    state.earned = next.earned;
    state.counters = next.counters;
    state.notes = next.notes;
    persist();
    renderAll();
  } catch {
    alert('That file could not be imported as trophy progress.');
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies, counters and notes in this browser?')) return;
  state.earned = [];
  state.counters = {};
  state.notes = {};
  selectedId = null;
  persist();
  renderAll();
});

// Restore the spoiler setting and the last view.
document.getElementById('spoilerToggle').checked = state.spoiler === true;
const hashView = (location.hash || '').replace('#/', '');
if (['checklist', 'roadmap', 'missables', 'about'].includes(hashView)) currentView = hashView;
window.addEventListener('hashchange', () => {
  const view = location.hash.replace('#/', '');
  if (['checklist', 'roadmap', 'missables', 'about'].includes(view)) showView(view);
});

// Screenshot modes: deterministic views for the entry's screenshots.
if (shot === 'checklist') {
  selectedId = 28;
} else if (shot === 'guide') {
  selectedId = 14;
} else if (shot === 'roadmap') {
  currentView = 'roadmap';
} else if (shot === 'missables') {
  currentView = 'missables';
}
if (shotMode) {
  // Counters shown in the guide shot, so the detail pane shows progress too.
  if (shot === 'guide') state.counters = { ...state.counters, 15: 120 };
}

renderSources(document.getElementById('sourceList'), sourcesMap);
showView(currentView);
renderAll();
// Signal to the screenshot driver that the first render is done.
window.__shotReady = true;
