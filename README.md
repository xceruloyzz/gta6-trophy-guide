# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/xceruloyzz/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/xceruloyzz/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand
Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden), built for
the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Checklist** of every trophy with its official name, description and grade,
  saved in the browser (localStorage), with **export / import** of progress.
- **Filters** by grade, kind (story, missable, side missions, collectibles,
  activities, exploration, combat, money, completion), earned state, and
  free-text search — plus a **spoiler setting** that hides story trophies
  until they are earned.
- **A guide for every trophy**, written in our own words, each citing its
  sources (PowerPyx, PSNProfiles, Exophase, Sixshore). Methods still being
  pinned down a day after launch are marked “not yet confirmed” instead of
  guessed.
- **Roadmap to the platinum** in six stages, in play order, and a
  **missables page** — one possibly missable trophy (the Chapter 1 meditation
  for Positive Mental Attitude), and everything that looks missable but isn’t.
- **Counters** for counted trophies (250 stunts, 42 shooting range golds, 100
  WAiNK scans…) and **per-trophy notes**.

## Run it

Static files under `app/` — no build step, no network requests:

```sh
node serve.ts   # then open http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its root.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` via the kit’s
`vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Honest notes

Written 20 November 2026, a day after launch, from the official trophy list
and the published guides cited beside each trophy. Official trophy names and
descriptions are shown as PlayStation publishes them. No Rockstar logo or
artwork is used. MIT licensed.
