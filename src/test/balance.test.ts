import { describe, expect, it } from "vitest";
import {
  applyAction,
  BOROUGHS,
  GameState,
  GUN_CATALOG,
  heatCeiling,
  inventoryUnits,
  MAX_GUNS,
  nextCoatOffer,
  PRODUCTS,
  startGame,
} from "../game/engine";

function clearFlow(state: GameState): GameState {
  let next = state;
  for (let step = 0; step < 200; step++) {
    if (next.phase === "notice")
      next = applyAction(next, { type: "continue-notice" });
    else if (next.phase === "outcome")
      next = applyAction(next, { type: "continue" });
    else if (next.phase === "loan-shark")
      next = applyAction(next, { type: "resolve-loan-shark" });
    else if (next.phase === "encounter")
      next =
        next.pendingEncounter?.stage === "police-fire"
          ? applyAction(next, { type: "resolve-police-fire" })
          : applyAction(next, {
              type: "resolve-encounter",
              choice: "escape",
            });
    else return next;
  }
  throw new Error("Unresolved flow");
}

function sellListedStock(state: GameState): GameState {
  let next = state;
  for (const product of PRODUCTS) {
    const quantity = next.inventory[product.id].quantity;
    if (quantity > 0 && next.market.listed.includes(product.id))
      next = applyAction(next, {
        type: "sell",
        product: product.id,
        quantity,
      });
  }
  return next;
}

function buyCheapestRelativeListing(state: GameState): GameState {
  if (inventoryUnits(state) > 0) return state;
  const choice = PRODUCTS.filter(
    (product) =>
      state.market.listed.includes(product.id) &&
      state.market.prices[product.id] <= state.cash,
  ).sort(
    (a, b) =>
      state.market.prices[a.id] / a.base - state.market.prices[b.id] / b.base,
  )[0];
  if (!choice) return state;
  const quantity = Math.floor(
    Math.min(
      state.cash / state.market.prices[choice.id],
      state.capacity - inventoryUnits(state),
    ),
  );
  return quantity > 0
    ? applyAction(state, { type: "buy", product: choice.id, quantity })
    : state;
}

function playQueensManhattan(seed: number): GameState {
  let state = clearFlow(startGame("Route", "queens", seed));
  while (state.phase !== "gameover" && state.day <= 30) {
    if (state.current === "manhattan") state = sellListedStock(state);
    if (state.current === "queens") {
      if (state.debt > 0 && state.cash >= state.debt) {
        state = applyAction(state, { type: "repay", amount: state.debt });
        state = clearFlow(state);
      }
      let offer = nextCoatOffer(state.capacity);
      while (offer && state.cash >= offer.price * 3) {
        state = applyAction(state, {
          type: "use-local-service",
          service: "coat-maker",
        });
        offer = nextCoatOffer(state.capacity);
      }
      state = buyCheapestRelativeListing(state);
    }
    if (state.day === 30) {
      state = applyAction(state, { type: "finish-day" });
      break;
    }
    state = clearFlow(
      applyAction(state, {
        type: "travel",
        destination: state.current === "queens" ? "manhattan" : "queens",
      }),
    );
  }
  return state;
}

function clearUnbalancedFlow(state: GameState, fight: boolean): GameState {
  let next = state;
  for (let step = 0; step < 500; step++) {
    if (next.phase === "notice")
      next = applyAction(next, { type: "continue-notice" });
    else if (next.phase === "outcome")
      next = applyAction(next, { type: "continue" });
    else if (next.phase === "loan-shark")
      next = applyAction(next, { type: "resolve-loan-shark" });
    else if (next.phase === "encounter")
      next =
        next.pendingEncounter?.stage === "police-fire"
          ? applyAction(next, { type: "resolve-police-fire" })
          : applyAction(next, {
              type: "resolve-encounter",
              choice: fight && next.guns > 0 ? "fight" : "escape",
            });
    else return next;
  }
  throw new Error("Unbalanced strategy did not resolve");
}

function playUnbalanced(
  seed: number,
  strategy: "armed-premium" | "low-price",
): GameState {
  let state = clearUnbalancedFlow(
    startGame(
      strategy === "armed-premium" ? "Reckless" : "Shuttle",
      "bronx",
      seed,
    ),
    strategy === "armed-premium",
  );
  while (state.phase !== "gameover" && state.day <= 30) {
    if (strategy === "armed-premium" && state.current === "bronx") {
      for (const gun of GUN_CATALOG) {
        if (state.guns >= MAX_GUNS || state.cash < gun.price) break;
        if (!state.weapons.includes(gun.id))
          state = applyAction(state, { type: "buy-gun", gun: gun.id });
      }
    }

    const allowed =
      strategy === "low-price"
        ? PRODUCTS.filter(
            (product) => product.id === "pills" || product.id === "speed",
          )
        : PRODUCTS;
    for (const product of allowed) {
      const quantity = state.inventory[product.id].quantity;
      if (quantity > 0 && state.market.listed.includes(product.id))
        state = applyAction(state, {
          type: "sell",
          product: product.id,
          quantity,
        });
    }
    if (inventoryUnits(state) === 0) {
      const choice = allowed
        .filter(
          (product) =>
            state.market.listed.includes(product.id) &&
            state.market.prices[product.id] <= state.cash,
        )
        .sort((a, b) =>
          strategy === "armed-premium"
            ? b.base - a.base
            : state.market.prices[a.id] / a.base -
              state.market.prices[b.id] / b.base,
        )[0];
      if (choice) {
        const quantity = Math.floor(
          Math.min(
            state.cash / state.market.prices[choice.id],
            state.capacity - inventoryUnits(state),
          ),
        );
        if (quantity > 0)
          state = applyAction(state, {
            type: "buy",
            product: choice.id,
            quantity,
          });
      }
    }

    expect(state.cash).toBeGreaterThanOrEqual(0);
    expect(state.debt).toBeGreaterThanOrEqual(0);
    expect(state.guns).toBeLessThanOrEqual(MAX_GUNS);
    expect(inventoryUnits(state)).toBeLessThanOrEqual(state.capacity);
    expect(state.heat).toBeLessThanOrEqual(heatCeiling(state.identityKills));
    if (state.day === 30) {
      state = applyAction(state, { type: "finish-day" });
      break;
    }
    const index = BOROUGHS.findIndex((borough) => borough.id === state.current);
    const destination = BOROUGHS[(index + 1) % BOROUGHS.length].id;
    state = clearUnbalancedFlow(
      applyAction(state, { type: "travel", destination }),
      strategy === "armed-premium",
    );
  }
  return state;
}

describe("balance smoke tests", () => {
  it("centers long-run market prices on the requested Fibonacci-like scale", () => {
    const targets = [
      100, 200, 1_000, 1_000, 2_000, 3_000, 5_000, 8_000, 13_000, 21_000,
      34_000, 55_000,
    ];
    const totals = PRODUCTS.map(() => 0);
    let observations = 0;
    for (let seed = 1; seed <= 150; seed++) {
      for (const borough of BOROUGHS) {
        let state = clearFlow(startGame("Price sample", borough.id, seed));
        state = { ...state, debt: 0 };
        for (let day = 1; day <= 30; day++) {
          PRODUCTS.forEach((product, index) => {
            totals[index] += state.market.prices[product.id];
          });
          observations += 1;
          if (day < 30)
            state = clearFlow(applyAction(state, { type: "lay-low" }));
        }
      }
    }
    totals.forEach((total, index) => {
      const mean = total / observations;
      expect(mean).toBeGreaterThan(targets[index] * 0.97);
      expect(mean).toBeLessThan(targets[index] * 1.03);
    });
  });

  it("preserves exceptional premium-drug price discontinuities", () => {
    let low = Number.POSITIVE_INFINITY;
    let high = 0;
    for (let seed = 1; seed <= 80; seed++) {
      let state = { ...startGame("Scale", "queens", seed), debt: 0 };
      for (let day = 1; day <= 12; day++) {
        low = Math.min(
          low,
          state.market.prices.coke,
          state.market.prices.heroin,
        );
        high = Math.max(
          high,
          state.market.prices.coke,
          state.market.prices.heroin,
        );
        if (day < 12)
          state = clearFlow(applyAction(state, { type: "lay-low" }));
      }
    }
    expect(low).toBeLessThan(5000);
    expect(high).toBeGreaterThanOrEqual(90_000);
    expect(high * 89).toBeGreaterThanOrEqual(8_000_000);
  });

  it("keeps a simple reliable route viable but risky", () => {
    const results = Array.from({ length: 250 }, (_, index) =>
      playQueensManhattan(index + 1),
    );
    const completed = results.filter((state) => state.day === 30);
    const positive = results.filter((state) => (state.score?.value ?? -1) > 0);
    const values = results
      .map((state) => state.score?.value ?? -1)
      .sort((a, b) => a - b);
    const best = values.at(-1) ?? -1;
    const huge = values.filter((value) => value > 30_000_000).length;
    expect(completed.length).toBeGreaterThan(75);
    expect(positive.length).toBeGreaterThan(30);
    expect(best).toBeGreaterThan(20_000_000);
    expect(huge).toBeGreaterThan(0);
    expect(huge).toBeLessThan(15);
  });

  it("makes each hidden high-value home pairing cheap and glut-prone", () => {
    const homes = {
      manhattan: "acid",
      brooklyn: "molly",
      queens: "coke",
      bronx: "heroin",
      staten: "opioids",
    } as const;
    const glutCounts = Object.fromEntries(
      BOROUGHS.map((borough) => [borough.id, 0]),
    ) as Record<(typeof BOROUGHS)[number]["id"], number>;
    let observedDays = 0;
    for (const borough of BOROUGHS) {
      for (let seed = 1; seed <= 60; seed++) {
        let state = {
          ...startGame("Home sample", borough.id, seed),
          debt: 0,
        };
        for (let day = 2; day <= 30; day++) {
          state = clearFlow(applyAction(state, { type: "lay-low" }));
          observedDays += 1;
          if (
            state.market.condition?.id.startsWith("home-glut-") &&
            state.market.condition.productId === homes[borough.id]
          )
            glutCounts[borough.id] += 1;
        }
      }
    }
    const ratio =
      Object.values(glutCounts).reduce((total, count) => total + count, 0) /
      observedDays;
    expect(ratio).toBeGreaterThan(0.23);
    expect(ratio).toBeLessThan(0.27);
    expect(Object.values(glutCounts).every((count) => count > 350)).toBe(true);

    for (const [home, product] of Object.entries(homes) as [
      keyof typeof homes,
      (typeof homes)[keyof typeof homes],
    ][]) {
      const means = Object.fromEntries(
        BOROUGHS.map((borough) => [borough.id, 0]),
      ) as Record<(typeof BOROUGHS)[number]["id"], number>;
      for (let seed = 1; seed <= 300; seed++)
        for (const borough of BOROUGHS)
          means[borough.id] += startGame(
            "Price sample",
            borough.id,
            seed,
          ).market.prices[product];
      expect(means[home]).toBe(Math.min(...Object.values(means)));
    }
  });

  it("survives deliberately unbalanced premium and low-price strategies", () => {
    const armed = Array.from({ length: 120 }, (_, index) =>
      playUnbalanced(index + 1, "armed-premium"),
    );
    const low = Array.from({ length: 120 }, (_, index) =>
      playUnbalanced(index + 1, "low-price"),
    );
    expect([...armed, ...low].every((state) => state.score)).toBe(true);
    expect(armed.some((state) => state.officersKilled > 0)).toBe(true);
    expect(armed.some((state) => state.day < 30)).toBe(true);
    expect(low.every((state) => state.officersKilled === 0)).toBe(true);
    expect(low.some((state) => state.day === 30)).toBe(true);
  });
});
