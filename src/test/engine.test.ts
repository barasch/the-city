import { describe, expect, it } from "vitest";
import {
  applyAction,
  BOROUGHS,
  GameState,
  inventoryUnits,
  PRODUCTS,
  startGame,
} from "../game/engine";

const travelAndEscape = (
  state: GameState,
  destination: GameState["current"],
): GameState => {
  let next = applyAction(state, { type: "travel", destination });
  if (next.phase === "encounter")
    next = applyAction(next, { type: "resolve-encounter", choice: "escape" });
  return next;
};

describe("deterministic game engine", () => {
  it("replays the same seeded action sequence exactly", () => {
    const play = () => {
      let state = startGame("Replay", "brooklyn", 123456);
      const id = state.market.listed[0];
      state = applyAction(state, { type: "buy", product: id, quantity: 3 });
      state = travelAndEscape(state, "queens");
      state = travelAndEscape(state, "bronx");
      state = applyAction(state, { type: "lay-low" });
      state = travelAndEscape(state, "manhattan");
      return state;
    };
    expect(play()).toEqual(play());
  });

  it("uses weighted average cost and has no quantity depth cap", () => {
    let state = startGame("Accountant", "brooklyn", 5);
    const id = state.market.listed[0];
    const firstPrice = state.market.prices[id];
    state = applyAction(state, { type: "buy", product: id, quantity: 2 });
    state = {
      ...state,
      market: {
        ...state.market,
        prices: { ...state.market.prices, [id]: firstPrice * 2 },
      },
    };
    state = applyAction(state, { type: "buy", product: id, quantity: 1 });
    expect(state.inventory[id].quantity).toBe(3);
    expect(state.inventory[id].avgCost).toBeCloseTo(
      (firstPrice * 2 + firstPrice * 2) / 3,
    );
    state = applyAction(state, { type: "sell", product: id, quantity: 1 });
    expect(state.inventory[id].quantity).toBe(2);
    expect(state.inventory[id].avgCost).toBeCloseTo(
      (firstPrice * 2 + firstPrice * 2) / 3,
    );
    const beforeUnlistedSale = state;
    state = {
      ...state,
      market: {
        ...state.market,
        listed: state.market.listed.filter((listedId) => listedId !== id),
      },
    };
    state = applyAction(state, { type: "sell", product: id, quantity: 1 });
    expect(state.inventory[id].quantity).toBe(
      beforeUnlistedSale.inventory[id].quantity,
    );
    state = { ...state, market: beforeUnlistedSale.market };
    state = applyAction(state, { type: "borrow", amount: 100000 });
    state = applyAction(state, { type: "buy", product: id, quantity: 70 });
    expect(state.inventory[id].quantity).toBe(72);
    expect(inventoryUnits(state)).toBe(72);
  });

  it("records useful continuity observations and familiarity on revisits", () => {
    let state = startGame("Local", "brooklyn", 77);
    const homeDayOne = state.boroughs.brooklyn.ledger.observations;
    expect(Object.keys(homeDayOne).length).toBeGreaterThan(0);
    state = travelAndEscape(state, "queens");
    state = travelAndEscape(state, "manhattan");
    state = travelAndEscape(state, "brooklyn");
    expect(state.boroughs.brooklyn.familiarity).toBe(2);
    expect(state.boroughs.brooklyn.ledger.lastVisitDay).toBe(4);
    expect(state.boroughs.queens.ledger.lastVisitDay).toBe(2);
    expect(state.boroughs.queens.ledger.observations).not.toEqual(homeDayOne); // prices are observations, not shared magic state
  });

  it("applies daily financing costs without permanently ratcheting enforcement", () => {
    const initial = applyAction(startGame("Financier", "brooklyn", 88), {
      type: "deposit",
      amount: 1000,
    });
    const baseline = initial.boroughs.queens.enforcement;
    const next = travelAndEscape(initial, "queens");
    expect(next.bank).toBe(Math.floor(initial.bank * 1.005));
    expect(next.debt).toBe(Math.ceil(initial.debt * 1.015));
    expect(next.boroughs.queens.enforcement).toBe(baseline);
  });

  it("makes guns obtainable at home and consequential in a police encounter", () => {
    let state = startGame("Armed", "brooklyn", 9);
    expect(state.guns).toBe(0);
    const bought = applyAction(state, { type: "buy-gun" });
    expect(bought.guns).toBe(1);
    expect(bought.cash).toBeLessThan(state.cash);
    // The engine refuses a fight with zero guns even if a malformed encounter is supplied.
    const noGuns = {
      ...bought,
      guns: 0,
      phase: "encounter" as const,
      pendingEncounter: {
        destination: "queens" as const,
        routeRisk: 0.5,
        cargoValue: 0,
      },
    };
    expect(
      applyAction(noGuns, { type: "resolve-encounter", choice: "fight" })
        .log[0],
    ).toContain("no guns");
    // Find a deterministic encounter, then verify that a successful fight consumes one raw gun.
    let encounter: GameState | undefined;
    for (let seed = 1; seed < 1000 && !encounter; seed++) {
      const candidate = applyAction(startGame("Patrol", "brooklyn", seed), {
        type: "travel",
        destination: "staten",
      });
      if (candidate.phase === "encounter") encounter = candidate;
    }
    expect(encounter).toBeDefined();
    if (encounter) {
      const armed = { ...encounter, guns: 7 };
      const result = applyAction(armed, {
        type: "resolve-encounter",
        choice: "fight",
      });
      expect(result.guns).toBe(6);
    }
  });

  it("settles automatically on Day 30 with discounted liquidation", () => {
    let state = startGame("Finisher", "manhattan", 42);
    const id = state.market.listed[0];
    state = applyAction(state, { type: "buy", product: id, quantity: 4 });
    for (let i = 0; i < 29; i++) {
      state = applyAction(state, { type: "lay-low" });
      if (state.phase === "encounter")
        state = applyAction(state, {
          type: "resolve-encounter",
          choice: "escape",
        });
    }
    expect(state.day).toBe(30);
    expect(state.phase).toBe("market");
    state = applyAction(state, { type: "finish-day" });
    expect(state.phase).toBe("gameover");
    expect(state.score?.day).toBe(30);
    expect(inventoryUnits(state)).toBe(0);
    expect(state.log[0]).toContain("liquidated");
  });

  it("uses borough availability profiles instead of listing every product everywhere", () => {
    const averageListings = (home: GameState["home"]) => {
      let state = startGame("Listings", home, 20260807);
      const counts = [state.market.listed.length];
      for (let day = 1; day < 12; day++) {
        state = applyAction(state, { type: "lay-low" });
        counts.push(state.market.listed.length);
      }
      return counts.reduce((total, count) => total + count, 0) / counts.length;
    };
    expect(averageListings("manhattan")).toBeGreaterThan(
      averageListings("staten"),
    );
    expect(averageListings("brooklyn")).toBeLessThan(PRODUCTS.length);
  });

  it("keeps hundreds of complete seeded runs inside core invariants", () => {
    for (let seed = 1; seed <= 250; seed++) {
      let state = startGame(
        "Simulation",
        BOROUGHS[seed % BOROUGHS.length].id,
        seed,
      );
      while (state.phase !== "gameover" && state.day < 30) {
        const options = BOROUGHS.filter(
          (borough) => borough.id !== state.current,
        );
        const destination = options[(seed + state.day) % options.length].id;
        state = applyAction(state, { type: "travel", destination });
        if (state.phase === "encounter")
          state = applyAction(state, {
            type: "resolve-encounter",
            choice: "escape",
          });

        expect(state.day).toBeLessThanOrEqual(30);
        expect(state.cash).toBeGreaterThanOrEqual(0);
        expect(state.bank).toBeGreaterThanOrEqual(0);
        expect(state.debt).toBeGreaterThanOrEqual(0);
        expect(inventoryUnits(state)).toBeLessThanOrEqual(state.capacity);
        expect(
          Number.isFinite(
            state.cash + state.bank + state.debt + state.health + state.heat,
          ),
        ).toBe(true);
      }
      if (state.phase !== "gameover")
        state = applyAction(state, { type: "finish-day" });
      expect(state.phase).toBe("gameover");
      expect(state.score).toBeDefined();
    }

    let passive = startGame("Passive", "brooklyn", 1);
    while (passive.day < 30)
      passive = applyAction(passive, { type: "lay-low" });
    passive = applyAction(passive, { type: "finish-day" });
    expect(passive.score?.value).toBeLessThan(0);
  });
});
