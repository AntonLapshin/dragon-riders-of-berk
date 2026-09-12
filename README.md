# 🐉 Dragon Riders of Berk

> A Game-of-Life style race across the Barbaric Archipelago — tame up to 5 dragons, then defeat the Alpha!

**🎮 Play it live: https://antonlapshin.github.io/dragon-riders-of-berk/**

![Dragon Riders of Berk gameplay](screenshot.png)

A 2-player hot-seat board game for the browser. No build step, no dependencies — just open `index.html` or play on GitHub Pages. Spin the wheel, race from **Berk Village** to **The Alpha's Lair**, build your dragon flock, and bring down the Glacial Tyrant.

---

## ✨ Features

- 🗺️ 59-tile serpentine board over a painted Barbaric Archipelago map
- 🎡 Animated spinning wheels (move wheel, taming wheel, battle wheel)
- 🥚 7 tamable dragons with unique art, species & power
- ⚔️ Final boss battle vs the Alpha with HP pips, plasma-blast crits & sound effects
- 🔊 Retro WebAudio sound (roars, clashes, fanfares — no audio files needed)
- 📜 In-game How-to-Play, saga log, turn skipping, extra turns, storm teleports

## 🎯 Goal

Race from **Berk Village (tile 0)** to **The Alpha's Lair (tile 58)** along the winding path. Collect up to **5 dragons**, then defeat **The Alpha** in battle to win.

## 🎡 Your Turn — 3 Move Options

1. Press **SPIN THE WHEEL** (values 1–8).
2. Then choose one of three moves:
   - 🎡 **Go the wheel number forward** — free, the normal move.
   - 🐾 **Go 1 forward** — a careful nudge, but it **costs your next turn**.
   - 🐾 **Go 1 backward** — a daring retreat, but it **costs your next turn**.
3. Resolve the space you land on — every event asks you to confirm with **OK**.

## 🗺️ Spaces

| Tile | Effect |
|------|--------|
| 🛖 **Berk Village (start)** | Where every rider begins. |
| 🥚 **Dragon Nest — Taming Spin Challenge** | Spin the Taming Wheel: **CATCH** wins that dragon · **ESCAPES** drifts you back 2 · **NET TRAP** costs a turn · **CATCH+FEAST** also grants another spin. Revisiting an owned nest grants an extra spin. A full flock of 5 can't tame more. |
| 🐟 **Fish Feast** | Devour fish, full of energy — **spin again**! |
| 🪤 **Trapper Net** | Tangled in a net — **lose your next turn**. |
| 🌀 **Storm Vortex** | Ride the wind straight to the **next dragon nest**. |
| ✦ **Safe Skies** | Nothing happens, enjoy the view. |
| 🧊 **Alpha's Lair** | Arrive with **at least 1 dragon** and the battle begins. Arrive with **none** and the icy roar blasts you back **8 spaces**! |

## ⚔️ The Final Battle

Each round: **your spin + flock power + Rider's Courage (+6)** vs **Alpha's spin + 18**.

- Higher total lands a hit; ties do nothing.
- A natural **10** is a ⚡ **Plasma Blast (+6)** — so even a lone dragon has a slim chance!
- First to **3 hits** wins the game.
- Every dragon you collect makes victory far more likely.
- If the Alpha wins, your flock scatters: you **lose a random dragon** and are sent **all the way back to Berk Village**!

## 🐉 Dragon Codex

| Dragon | Species | Power |
|--------|---------|-------|
| Meatlug | Gronckle | ⚡2 |
| Grump | Gronckle | ⚡2 |
| Barf & Belch | Hideous Zippleback | ⚡3 |
| Stormfly | Deadly Nadder | ⚡3 |
| Cloudjumper | Stormcutter | ⚡4 |
| Hookfang | Monstrous Nightmare | ⚡4 |
| Toothless | Night Fury | ⚡5 |

## 🚀 Run locally

```bash
# just open it — no build needed
open index.html
# or serve it
npx serve .
```

## 🌍 Deploy

This repo deploys to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy-pages.yml`, modeled on [html-to-pdf](https://github.com/AntonLapshin/html-to-pdf)). Every push to `main` publishes the site to:

**https://antonlapshin.github.io/dragon-riders-of-berk/**
