// Rendering: checklist cards, the trophy detail pane, the roadmap, the missables
// page and the sources list. Every string from the data file is placed with
// textContent, never as HTML, so a trophy name can never break the page.
import { isEarned, counterOf, noteOf } from './store.js';

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side missions',
  collectibles: 'Collectibles',
  activities: 'Activities',
  exploration: 'Exploration',
  combat: 'Combat & robberies',
  money: 'Money & property',
  completion: 'Completion',
};

export const STAGES = [
  {
    stage: 1,
    title: 'Story first',
    hours: 'about 60–80 hours',
    blurb:
      'Play Chapters 1–5 in order. The 12 story trophies pop automatically as you finish the opening mission, the four chapters, the six named missions and the finale — none can be missed. Along the way: do the Chapter 1 meditation at Jason’s house (see Missables), take optional missions as they appear, scan every new vehicle with WAiNK and study new animals through the binoculars. There are no mission medals and no mission replay, so keep a save at the start and end of each chapter.',
  },
  {
    stage: 2,
    title: 'Side strands & partners',
    hours: 'about 10–15 hours',
    blurb:
      'Finish the five contact strands — Andy, Kenton, Billy, Randy and Tyrone — and the 8 stranger strands for Strangers & Freaks. Beat Cal at fishing and hunt Bret’s unique animal. Strands stay open after the story, and quest givers who go quiet (Kenton, for one) come back, so nothing here is missable.',
  },
  {
    stage: 3,
    title: 'Activities & skills',
    hours: 'about 15–20 hours',
    blurb:
      'Gold all 42 Shooting Range challenges, win the 14 Top Fun drone races, win 20 different races, finish an arcade game, and meditate at the 18 spots. Trying each of the 9 activity types once earns Master of None on the way. Start chipping at the 250 stunts now — the 100% checklist wants 300.',
  },
  {
    stage: 4,
    title: 'Robberies, wanted & combat',
    hours: 'about 10–15 hours',
    blurb:
      'Bank vaults (5 for the trophy, all 8 for 100%), armored trucks, the jewelry store, one illegal operation per gang, and the wanted-level escapes with your partner — Hot Together and Retail Therapy both need your partner along. Steal the jet at VCIA and a Rhino tank, and land 5 takedowns in one Combat Focus.',
  },
  {
    stage: 5,
    title: 'Collectibles & exploration',
    hours: 'about 20–30 hours',
    blurb:
      'Finish 3 card sets, WAiNK-scan 100 locations, discover 100 vehicles and clear the fog from all 52 areas of Leonida. Buy all 8 garages and register 10 vehicles with Scooter Bros. Sweep the odd ones — the cocktail on Ocean Beach, the showroom smash, the Payday Loans lead and the UFO thread — as their methods are confirmed.',
  },
  {
    stage: 6,
    title: 'Money & the platinum run',
    hours: 'about 30–40 hours, then the 100% checklist',
    blurb:
      'Launder $250,000 in Marked Bills, spend $100,000 across shops, finish 50 challenges and let the 500 profile actions build. Then open the 100% checklist (Progress, Stats, 100% Completion) and close out what is left: 70 of 80 challenges, 15 of 18 meditations, 300 stunts, all 8 vaults, all 39 gang operations. A Long Road pops — and the platinum with it.',
  },
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function medalDot(grade) {
  return el('span', 'medal ' + grade);
}

function badge(text, cls) {
  return el('span', 'badge ' + (cls || ''), text);
}

export function gradeCountsLine(trophies, state) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const earned = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (isEarned(state, t.id)) earned[t.grade] += 1;
  }
  return `Platinum ${earned.platinum}/${totals.platinum} · Gold ${earned.gold}/${totals.gold} · Silver ${earned.silver}/${totals.silver} · Bronze ${earned.bronze}/${totals.bronze}`;
}

export function updateProgress(trophies, state) {
  const earned = state.earned.length;
  document.getElementById('earnedCount').textContent = String(earned);
  const fill = document.getElementById('progressFill');
  fill.style.width = (earned / trophies.length) * 100 + '%';
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  document.getElementById('gradeCounts').textContent = gradeCountsLine(trophies, state);
  document.getElementById('platinumLine').textContent =
    earned === trophies.length
      ? 'Platinum earned — you are a Leonida Legend.'
      : earned >= 40
        ? 'Almost there — the 100% checklist is the last stretch.'
        : 'Next up: finish the story, then the side strands.';
}

function spoilerHidden(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !isEarned(state, trophy.id);
}

function trophyCard(trophy, state, selectedId, callbacks) {
  const card = el('article', 'trophy-card' + (isEarned(state, trophy.id) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : ''));
  const head = el('div', 'trophy-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(state, trophy.id);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    callbacks.onToggle(trophy.id);
  });
  head.append(box, medalDot(trophy.grade));
  const titles = el('div', 'trophy-titles');
  if (spoilerHidden(trophy, state)) {
    titles.append(el('h3', '', 'Hidden story trophy'));
    titles.append(el('p', 'trophy-desc spoilered', 'Spoiler-safe is on — earn this trophy to reveal its name and description.'));
  } else {
    const h = el('h3', '', trophy.name);
    h.append(el('span', 'grade-tag', trophy.grade));
    titles.append(h, el('p', 'trophy-desc', trophy.description));
  }
  const badges = el('div', 'badges');
  badges.append(badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind'));
  if (trophy.hidden) badges.append(badge('Hidden on PSN', 'hidden-badge'));
  if (trophy.missable === 'possible') badges.append(badge('Possibly missable', 'missable'));
  titles.append(badges);
  head.append(titles);
  card.append(head);

  if (!spoilerHidden(trophy, state)) {
    const excerpt = el('p', 'guide-excerpt', trophy.guide);
    const more = el('span', 'more', '  Full guide →');
    excerpt.append(more);
    card.append(excerpt);
  }
  if (trophy.count) {
    card.append(counterRow(trophy, state, callbacks));
  }
  card.addEventListener('click', (event) => {
    if (event.target.closest('input,button,textarea,a')) return;
    callbacks.onSelect(trophy.id);
  });
  return card;
}

function counterRow(trophy, state, callbacks) {
  const target = trophy.count.target;
  const value = counterOf(state, trophy.id);
  const row = el('div', 'counter');
  const minus = el('button', '', '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', 'Decrease ' + trophy.count.label);
  minus.addEventListener('click', () => callbacks.onCounter(trophy.id, value - 1));
  const plus = el('button', '', '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', 'Increase ' + trophy.count.label);
  plus.addEventListener('click', () => callbacks.onCounter(trophy.id, value + 1));
  const num = el('span', 'count-num', `${value.toLocaleString()} / ${target.toLocaleString()} ${trophy.count.label}`);
  const bar = el('span', 'mini-bar');
  const fill = el('span');
  fill.style.width = Math.min(100, (value / target) * 100) + '%';
  bar.append(fill);
  row.append(minus, num, plus, bar);
  return row;
}

export function renderTrophyList(container, trophies, state, selectedId, callbacks) {
  container.replaceChildren();
  if (trophies.length === 0) {
    container.append(el('p', 'detail-empty', 'No trophies match these filters. Clear the search or widen a filter.'));
    return;
  }
  for (const t of trophies) {
    container.append(trophyCard(t, state, selectedId, callbacks));
  }
}

function sourceLinks(sources, sourcesMap) {
  const list = el('ul', 'source-list');
  for (const key of sources) {
    const info = sourcesMap[key];
    const li = document.createElement('li');
    if (info) {
      const a = document.createElement('a');
      a.href = info.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = info.name;
      li.append(a);
    } else {
      li.textContent = key;
    }
    list.append(li);
  }
  return list;
}

export function renderDetail(panel, trophy, state, sourcesMap, callbacks) {
  panel.replaceChildren();
  if (!trophy) {
    const empty = el('div', 'detail-card detail-empty');
    empty.append(el('h2', '', 'Pick a trophy'));
    empty.append(el('p', '', 'Select any trophy on the left to read its full guide, its sources, and your notes for it.'));
    panel.append(empty);
    return;
  }
  const card = el('div', 'detail-card');
  const head = el('div', 'trophy-head');
  head.append(medalDot(trophy.grade));
  const titles = el('div', 'trophy-titles');
  if (spoilerHidden(trophy, state)) {
    titles.append(el('h2', '', 'Hidden story trophy'));
    titles.append(el('p', 'official', 'Spoiler-safe is on — earn this trophy to reveal its name and description.'));
  } else {
    titles.append(el('h2', '', trophy.name));
    titles.append(el('p', 'official', trophy.description));
    const badges = el('div', 'badges');
    badges.append(badge(trophy.grade, 'kind'));
    badges.append(badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind'));
    if (trophy.hidden) badges.append(badge('Hidden on PSN', 'hidden-badge'));
    if (trophy.missable === 'possible') badges.append(badge('Possibly missable', 'missable'));
    titles.append(badges);
  }
  head.append(titles);
  card.append(head);

  if (trophy.missable === 'possible' && !spoilerHidden(trophy, state)) {
    const warn = el('div', 'missable-warn');
    const strong = el('strong', '', 'Possibly missable — do it in Chapter 1. ');
    warn.append(strong);
    warn.append(document.createTextNode('The one missable risk in the game is in this trophy’s guide below. Every other trophy can be earned after the story.'));
    card.append(warn);
  }
  if (!spoilerHidden(trophy, state)) {
    card.append(el('h4', '', 'Guide'));
    card.append(el('p', 'guide-full', trophy.guide));
    if (trophy.count) {
      card.append(el('h4', '', 'Your progress'));
      card.append(counterRow(trophy, state, callbacks));
    }
    card.append(el('h4', '', 'Sources — where each fact comes from'));
    card.append(sourceLinks(trophy.sources, sourcesMap));
    card.append(el('h4', '', 'Your notes'));
    const note = document.createElement('textarea');
    note.className = 'note-box';
    note.placeholder = 'Your own notes for this trophy… (saved in this browser)';
    note.value = noteOf(state, trophy.id);
    note.setAttribute('aria-label', 'Notes for ' + trophy.name);
    note.addEventListener('change', () => callbacks.onNote(trophy.id, note.value));
    card.append(note);
    const actions = el('div', 'detail-actions');
    const toggle = el('button', '', isEarned(state, trophy.id) ? '✓ Earned — mark not earned' : 'Mark as earned');
    toggle.type = 'button';
    toggle.addEventListener('click', () => callbacks.onToggle(trophy.id));
    actions.append(toggle);
    card.append(actions);
  }
  panel.append(card);
}

export function renderRoadmap(container, trophies, state, onSelect) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => isEarned(state, t.id)).length;
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', String(stage.stage)));
    head.append(el('h2', '', stage.title));
    head.append(el('span', 'stage-hours', `${stage.hours} · ${done}/${members.length} earned`));
    section.append(head, el('p', '', stage.blurb));
    const chips = el('div', 'stage-trophies');
    for (const t of members) {
      const chip = el('button', 'chip' + (isEarned(state, t.id) ? ' done' : ''), '');
      chip.type = 'button';
      chip.append(el('span', 'dot ' + t.grade));
      chip.append(document.createTextNode(t.name));
      chip.addEventListener('click', () => onSelect(t.id));
      chips.append(chip);
    }
    section.append(chips);
    container.append(section);
  }
}

export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  const risky = trophies.find((t) => t.missable === 'possible');
  const alert = el('section', 'miss-card alert');
  alert.append(el('h2', '', 'The one to watch: ' + (risky ? risky.name : 'Positive Mental Attitude')));
  alert.append(
    el(
      'p',
      '',
      'Meditate at every spot across Leonida (18 spots). PowerPyx flags a single meditation in Chapter 1: one morning at Jason’s house, Lucia says she is going to meditate and walks out to the balcony. Follow her, accept the optional quest and do the meditation. It is gone after Chapter 1, and it is unclear whether the trophy needs it — PowerPyx had done it when the trophy unlocked. It takes a minute and removes the risk. The 100% checklist only needs 15 of the 18 spots.',
    ),
  );
  if (risky) {
    const open = el('button', '', 'Open the full guide →');
    open.type = 'button';
    open.addEventListener('click', () => onSelect(risky.id));
    alert.append(open);
  }
  container.append(alert);

  const safe = el('section', 'miss-card');
  safe.append(el('h2', '', 'Looks missable, but isn’t'));
  const list = document.createElement('ul');
  const items = [
    'All 12 story trophies unlock automatically and cannot be missed — there is no mission replay, but the missions themselves always pop their trophy.',
    'Kenton goes quiet after Chapter 1 and returns later; his treasure-diving strand is not missable.',
    'Some quest givers leave for a while and all trophy quest givers come back and stay after the story.',
    'The Kingpin Bowling robbery (Let’s Go Bowling) comes back later if you miss a valuable.',
    'Optional missions disappear over time, but there are far more than the 100 the 100% checklist needs.',
    'Quests with an hourglass icon can fail on a timer — none is tied to a trophy.',
    'The relationship between Jason and Lucia does not matter for trophies.',
    'Fences can leave for good, but none of them has a trophy quest.',
  ];
  for (const item of items) list.append(el('li', '', item));
  safe.append(list);
  safe.append(el('p', '', 'Sources: PowerPyx GTA 6 Trophy Guide & Roadmap; Sixshore trophy roundup. Push Square lists no known missables at all.'));
  container.append(safe);

  const save = el('section', 'miss-card');
  save.append(el('h2', '', 'Save advice'));
  save.append(
    el(
      'p',
      '',
      'The game has 15 manual save slots and 1 autosave. Because missions cannot be replayed, PowerPyx suggests keeping a save at the start and end of each chapter, then rotating the rest during free roam. Cheats disable trophies and stop the game saving, so keep them off your platinum file.',
    ),
  );
  container.append(save);
}

export function renderSources(listEl, sourcesMap) {
  listEl.replaceChildren();
  for (const info of Object.values(sourcesMap)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = info.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = info.name;
    li.append(a);
    listEl.append(li);
  }
}

export function renderNextUp(container, trophies, state, onSelect) {
  container.replaceChildren();
  const remaining = trophies
    .filter((t) => !isEarned(state, t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id);
  if (remaining.length === 0) {
    container.append(el('p', 'next-up-done', 'All 55 earned — platinum secured.'));
    return;
  }
  const head = el('div', 'next-up-head');
  head.append(el('h2', '', 'Next up — the road from here'));
  head.append(el('span', 'next-up-hint', 'In roadmap order — tap one to open its guide.'));
  container.append(head);
  const row = el('div', 'next-up-chips');
  for (const trophy of remaining.slice(0, 4)) {
    const stageInfo = STAGES.find((s) => s.stage === trophy.stage);
    const stageTitle = stageInfo ? stageInfo.title : 'Stage ' + trophy.stage;
    const chip = el('button', 'next-chip');
    chip.type = 'button';
    chip.append(el('span', 'dot ' + trophy.grade));
    const body = el('span', 'next-chip-body');
    const displayName = spoilerHidden(trophy, state) ? 'Hidden story trophy' : trophy.name;
    body.append(el('span', 'next-chip-name', displayName));
    let metaText = 'Stage ' + trophy.stage + ' · ' + stageTitle;
    if (trophy.count) {
      const current = counterOf(state, trophy.id);
      metaText += ' · ' + current.toLocaleString() + ' / ' + trophy.count.target.toLocaleString() + ' ' + trophy.count.label;
    }
    body.append(el('span', 'next-chip-meta', metaText));
    chip.append(body);
    chip.addEventListener('click', () => onSelect(trophy.id));
    row.append(chip);
  }
  container.append(row);
}
