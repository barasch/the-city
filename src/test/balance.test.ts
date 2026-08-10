import { describe, expect, it } from "vitest";
import {
  applyAction,
  GameState,
  inventoryUnits,
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

describe("balance smoke tests", () => {
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
    expect(completed.length).toBeGreaterThan(75);
    expect(positive.length).toBeGreaterThan(30);
    expect(best).toBeGreaterThan(500_000);
  });
});
