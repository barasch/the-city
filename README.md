# The City

**The City** is the working title of a browser-first successor to the supplied Python game.

The current build is a complete local vertical slice: choose a home borough, trade twelve products over thirty days, revisit evolving borough markets, use the bank and loan shark at home, manage debt, heat, health, capacity, and a raw gun count, survive multi-round police chases and debt-enforcer encounters, and finish with discounted Day 30 liquidation. Runs save automatically in the browser and completed scores remain on that device.

## Run locally

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run build
npm run preview
```

## Project shape

- `src/game/engine.ts` contains the serializable deterministic rules engine and seeded random source.
- `src/game/storage.ts` owns browser save and personal-score persistence.
- `src/App.tsx` renders the functional React interface.
- `src/test/` covers replay, accounting, unlimited market depth, borough continuity, financing, multi-round and fatal encounters, guns, Day 30 settlement, availability, multi-seed invariants, save/resume, and personal-score retention.

The engine is deliberately independent of React so a later leaderboard service can replay submitted actions under the same versioned rules instead of trusting a score calculated by the browser.

## Deploy to GitHub Pages

The included workflow tests, builds, and deploys the `dist` directory whenever `main` is pushed. In the repository's **Settings → Pages**, choose **GitHub Actions** as the publishing source. The Vite build uses relative asset paths, so it works under a project repository path without knowing the final repository name in advance.

## Current boundaries

- Product names, tuning, and event volume remain provisional.
- Deferred travel-event requirements are recorded in `DESIGN-NOTES.md`.
- The responsive layout is a functional baseline; phone portrait, phone landscape, tablet, and desktop still need hands-on browser review.
- The anonymous public leaderboard is not in this static build. It will require a small service that issues run seeds, replays action logs, calculates accepted scores, and applies submission limits. No accounts are planned.
- Location artwork is intentionally deferred.

## License

MIT
