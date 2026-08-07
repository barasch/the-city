import { describe, expect, it } from "vitest";
import {
  applyAction,
  BOROUGHS,
  GameState,
  inventoryUnits,
  PRODUCTS,
  startGame,
} from "../game/engine";

const clearEncounter = (state: GameState): GameState => {
  let next = state;
  for (let round = 0; round < 50; round++) {
    if (next.phase === "encounter") {
      next = applyAction(next, {
        type: "resolve-encounter",
        choice: "escape",
      });
      continue;
    }
    if (next.phase === "loan-shark") {
      next = applyAction(next, { type: "resolve-loan-shark" });
      continue;
    }
    if (next.phase === "outcome") {
      next = applyAction(next, { type: "continue" });
      continue;
    }
    return next;
  }
  throw new Error("Encounter did not resolve within 50 rounds");
};

const travelAndEscape = (
  state: GameState,
  destination: GameState["current"],
): GameState =>
  clearEncounter(applyAction(state, { type: "travel", destination }));
const distributedRng = (index: number): number =>
  Math.imul(index, 0x9e3779b9) >>> 0;

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
    expect(state.phase).toBe("outcome");
    state = applyAction(state, { type: "continue" });
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
    // Find a deterministic one-officer encounter, then verify that a successful
    // fight consumes one raw gun.
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
      let result: GameState | undefined;
      for (let rng = 1; rng < 1000 && !result; rng++) {
        const candidate = applyAction(
          { ...armed, rng },
          { type: "resolve-encounter", choice: "fight" },
        );
        if (candidate.pendingOutcome?.nextPhase === "market")
          result = candidate;
      }
      expect(result).toBeDefined();
      if (!result) return;
      expect(result.guns).toBe(6);
      expect(result.phase).toBe("outcome");
      expect(result.pendingOutcome?.kind).toBe("police");
      expect(applyAction(result, { type: "continue" }).phase).toBe("market");
    }
  });

  it("runs police chases in acknowledged rounds", () => {
    const initial = startGame("Runner", "brooklyn", 17);
    const chase: GameState = {
      ...initial,
      phase: "encounter",
      guns: 5,
      pendingEncounter: {
        destination: "queens",
        routeRisk: 0.5,
        cargoValue: 0,
        officers: 2,
      },
    };
    let firstRound: GameState | undefined;
    for (let rng = 1; rng < 1000 && !firstRound; rng++) {
      const candidate = applyAction(
        { ...chase, rng },
        { type: "resolve-encounter", choice: "fight" },
      );
      if (candidate.pendingOutcome?.nextPhase === "encounter")
        firstRound = candidate;
    }
    expect(firstRound?.pendingOutcome).toMatchObject({
      kind: "police",
      title: "You got one.",
      nextPhase: "encounter",
    });
    if (!firstRound) return;
    const continued = applyAction(firstRound, { type: "continue" });
    expect(continued.phase).toBe("encounter");
    expect(continued.pendingEncounter?.officers).toBe(1);

    let finalRound: GameState | undefined;
    for (let rng = 1; rng < 1000 && !finalRound; rng++) {
      const candidate = applyAction(
        { ...continued, rng },
        { type: "resolve-encounter", choice: "fight" },
      );
      if (candidate.pendingOutcome?.nextPhase === "market")
        finalRound = candidate;
    }
    expect(finalRound?.pendingOutcome?.title).toBe("You broke through.");
    expect(
      finalRound && applyAction(finalRound, { type: "continue" }).phase,
    ).toBe("market");
  });

  it("shows the classic fatal result before game over in every police branch", () => {
    const initial = startGame("Unlucky", "brooklyn", 18);
    for (const choice of ["escape", "fight"] as const) {
      const chase: GameState = {
        ...initial,
        health: 1,
        guns: choice === "fight" ? 1 : 0,
        phase: "encounter",
        pendingEncounter: {
          destination: "staten",
          routeRisk: 0.82,
          cargoValue: 0,
          officers: 1,
        },
      };
      let fatal: GameState | undefined;
      for (let index = 1; index < 1000 && !fatal; index++) {
        const candidate = applyAction(
          { ...chase, rng: distributedRng(index) },
          { type: "resolve-encounter", choice },
        );
        if (candidate.pendingOutcome?.nextPhase === "gameover")
          fatal = candidate;
      }
      expect(fatal?.phase).toBe("outcome");
      expect(fatal?.pendingOutcome).toMatchObject({
        kind: "police",
        title: "They wasted you!!!",
        nextPhase: "gameover",
      });
      expect(fatal && applyAction(fatal, { type: "continue" }).phase).toBe(
        "gameover",
      );
    }
  });

  it("requires an acknowledged result after loan shark actions", () => {
    const initial = startGame("Borrower", "brooklyn", 29);
    const borrowed = applyAction(initial, { type: "borrow", amount: 750 });
    expect(borrowed.cash).toBe(initial.cash + 750);
    expect(borrowed.debt).toBe(initial.debt + 750);
    expect(borrowed.phase).toBe("outcome");
    expect(borrowed.pendingOutcome).toMatchObject({
      kind: "loan-shark",
      nextPhase: "market",
    });
    expect(
      applyAction(borrowed, {
        type: "buy",
        product: borrowed.market.listed[0],
        quantity: 1,
      }),
    ).toEqual(borrowed);
    const continued = applyAction(borrowed, { type: "continue" });
    expect(continued.phase).toBe("market");
    expect(continued.pendingOutcome).toBeUndefined();
  });

  it("restores debt-enforcer encounters and acknowledges a fatal beating", () => {
    let encounter: GameState | undefined;
    for (let seed = 1; seed < 1000 && !encounter; seed++) {
      const indebted = {
        ...startGame("Debtor", "brooklyn", seed),
        debt: 30000,
      };
      const candidate = applyAction(indebted, {
        type: "travel",
        destination: "staten",
      });
      if (candidate.phase === "loan-shark") encounter = candidate;
    }
    expect(encounter).toBeDefined();
    if (!encounter) return;
    expect(encounter.pendingLoanSharkEncounter).toBeDefined();

    const fatal = applyAction(
      { ...encounter, cash: 1234, health: 1 },
      { type: "resolve-loan-shark" },
    );
    expect(fatal.cash).toBe(0);
    expect(fatal.health).toBe(0);
    expect(fatal.phase).toBe("outcome");
    expect(fatal.pendingOutcome).toMatchObject({
      kind: "loan-shark",
      title: "They wasted you!!!",
      nextPhase: "gameover",
    });
    expect(fatal.pendingOutcome?.message).toContain("$1,234");
    expect(applyAction(fatal, { type: "continue" }).phase).toBe("gameover");
  });

  it("settles automatically on Day 30 with discounted liquidation", () => {
    let state = startGame("Finisher", "manhattan", 42);
    const id = state.market.listed[0];
    state = applyAction(state, { type: "buy", product: id, quantity: 4 });
    for (let i = 0; i < 29; i++) {
      state = applyAction(state, { type: "lay-low" });
      state = clearEncounter(state);
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
        state = clearEncounter(state);

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
