import { describe, expect, it } from "vitest";
import {
  applyAction,
  BOROUGHS,
  fenceValue,
  GameState,
  GUN_CATALOG,
  inventoryUnits,
  localServiceError,
  MAX_GUNS,
  PRODUCTS,
  startGame,
  storedUnits,
  weaponIds,
} from "../game/engine";

const clearEncounter = (state: GameState): GameState => {
  let next = state;
  for (let round = 0; round < 50; round++) {
    if (next.phase === "notice") {
      next = applyAction(next, { type: "continue-notice" });
      continue;
    }
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
    let state = {
      ...startGame("Accountant", "brooklyn", 5),
      cash: 100_000_000,
    };
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
    state = { ...state, cash: 100_000_000 };
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
    expect(next.debt).toBe(Math.ceil(initial.debt * 1.06));
    expect(next.boroughs.queens.enforcement).toBe(baseline);

    const highDebt = { ...initial, debt: 26000 };
    const highDebtNext = travelAndEscape(highDebt, "queens");
    expect(highDebtNext.debt).toBe(Math.ceil(highDebt.debt * 1.11));
  });

  it("makes guns obtainable at home and consequential in a police encounter", () => {
    let state = { ...startGame("Armed", "brooklyn", 9), cash: 20000 };
    expect(state.guns).toBe(0);
    const bought = applyAction(state, {
      type: "buy-gun",
      gun: GUN_CATALOG[0].id,
    });
    expect(bought.guns).toBe(1);
    expect(bought.cash).toBe(state.cash - GUN_CATALOG[0].price);
    const boughtAgain = applyAction(bought, {
      type: "buy-gun",
      gun: GUN_CATALOG[1].id,
    });
    expect(boughtAgain.guns).toBe(2);
    expect(boughtAgain.cash).toBe(
      state.cash - GUN_CATALOG[0].price - GUN_CATALOG[1].price,
    );
    let full = boughtAgain;
    for (const gun of GUN_CATALOG.slice(2))
      full = applyAction(full, { type: "buy-gun", gun: gun.id });
    expect(full.guns).toBe(MAX_GUNS);
    expect(weaponIds(full)).toEqual(GUN_CATALOG.map((gun) => gun.id));
    const refused = applyAction(full, { type: "buy-gun" });
    expect(refused.guns).toBe(MAX_GUNS);
    expect(refused.log[0]).toContain(`only ${MAX_GUNS} guns`);
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
    // Find a deterministic one-officer encounter, then verify that fighting
    // does not consume a gun.
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
      const armed = {
        ...encounter,
        guns: MAX_GUNS,
        weapons: GUN_CATALOG.map((gun) => gun.id),
      };
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
      expect(result.guns).toBe(MAX_GUNS);
      expect(result.phase).toBe("outcome");
      expect(result.pendingOutcome?.kind).toBe("police");
      expect(applyAction(result, { type: "continue" }).phase).toBe("market");
    }
  });

  it("gives every borough a distinct strategic local service", () => {
    const brooklyn = startGame("Coat", "brooklyn", 41);
    const largerCoat = applyAction(brooklyn, { type: "use-local-service" });
    expect(largerCoat.capacity).toBe(150);
    expect(largerCoat.cash).toBe(1000);
    expect(localServiceError(largerCoat)).toContain("already the largest");

    const queens: GameState = {
      ...startGame("Patient", "brooklyn", 42),
      current: "queens",
      health: 31,
    };
    const treated = applyAction(queens, { type: "use-local-service" });
    expect(treated.health).toBe(100);
    expect(treated.cash).toBe(3500);
    expect(treated.day).toBe(1);

    const bronx: GameState = {
      ...startGame("Armed", "brooklyn", 43),
      current: "bronx",
    };
    const armed = applyAction(bronx, {
      type: "buy-gun",
      gun: GUN_CATALOG[0].id,
    });
    expect(armed.guns).toBe(1);
    expect(armed.cash).toBe(4500);

    const product = PRODUCTS[0].id;
    const statenBase = startGame("Stored", "brooklyn", 44);
    const staten: GameState = {
      ...statenBase,
      current: "staten",
      inventory: {
        ...statenBase.inventory,
        [product]: { quantity: 4, avgCost: 100 },
      },
    };
    const stored = applyAction(staten, {
      type: "store",
      product,
      quantity: 2,
    });
    expect(stored.inventory[product].quantity).toBe(2);
    expect(storedUnits(stored)).toBe(2);
    expect(stored.day).toBe(1);
    const retrieved = applyAction(stored, {
      type: "retrieve",
      product,
      quantity: 1,
    });
    expect(retrieved.inventory[product].quantity).toBe(3);
    expect(storedUnits(retrieved)).toBe(1);
    const offer = fenceValue(retrieved);
    const fenced = applyAction(retrieved, { type: "use-fence" });
    expect(fenced.cash).toBe(retrieved.cash + offer);
    expect(inventoryUnits(fenced)).toBe(0);
    expect(storedUnits(fenced)).toBe(1);
    expect(localServiceError(fenced, "fence")).toContain("coat is empty");
  });

  it("makes plastic surgery expensive, slow, and capable of clearing heat", () => {
    const initial: GameState = {
      ...startGame("New Face", "manhattan", 45),
      cash: 50000,
      heat: 91,
    };
    const changed = applyAction(initial, { type: "use-local-service" });
    expect(changed.day).toBe(6);
    expect(changed.cash).toBe(25000);
    expect(changed.heat).toBe(0);
    expect(changed.debt).toBeGreaterThan(initial.debt);
    expect(changed.log.some((line) => line.includes("Plastic surgery"))).toBe(
      true,
    );

    const tooLate = { ...initial, day: 27 };
    expect(localServiceError(tooLate)).toContain("not 5 days left");
  });

  it("keeps guns through fights but can lose one while escaping", () => {
    const initial = startGame("Carrier", "brooklyn", 91);
    const chase: GameState = {
      ...initial,
      guns: 1,
      weapons: [GUN_CATALOG[0].id],
      phase: "encounter",
      pendingEncounter: {
        destination: "staten",
        routeRisk: 0.82,
        cargoValue: 0,
        officers: 1,
      },
    };
    let dropped: GameState | undefined;
    for (let index = 1; index < 10000 && !dropped; index++) {
      const candidate = applyAction(
        { ...chase, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "escape" },
      );
      if (
        candidate.pendingOutcome?.title === "You got away." &&
        candidate.guns === 0
      )
        dropped = candidate;
    }
    expect(dropped?.pendingOutcome?.message).toContain(GUN_CATALOG[0].name);
    expect(dropped && weaponIds(dropped)).toHaveLength(0);

    let failedFight: GameState | undefined;
    for (let index = 1; index < 1000 && !failedFight; index++) {
      const candidate = applyAction(
        { ...chase, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "fight" },
      );
      if (candidate.pendingOutcome?.title === "The patrol won the exchange.")
        failedFight = candidate;
    }
    expect(failedFight?.guns).toBe(1);
    expect(failedFight && weaponIds(failedFight)).toEqual([GUN_CATALOG[0].id]);
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
    const initial = {
      ...startGame("Borrower", "brooklyn", 29),
      debt: 4000,
    };
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

  it("preserves the opening loan price and caps later advances at $5,000 debt", () => {
    const initial = startGame("Credit", "brooklyn", 30);
    expect(initial.cash).toBe(5000);
    expect(initial.debt).toBe(10000);

    const refused = applyAction(initial, { type: "borrow", amount: 1 });
    expect(refused.cash).toBe(initial.cash);
    expect(refused.debt).toBe(initial.debt);
    expect(refused.log[0]).toContain("get the debt below $5,000");

    let reduced = applyAction(
      { ...initial, cash: 11000 },
      { type: "repay", amount: 6000 },
    );
    reduced = applyAction(reduced, { type: "continue" });
    expect(reduced.debt).toBe(4000);
    const advanced = applyAction(reduced, { type: "borrow", amount: 1000 });
    expect(advanced.debt).toBe(5000);
    expect(advanced.cash).toBe(reduced.cash + 1000);

    const market = applyAction(advanced, { type: "continue" });
    const overLimit = applyAction(market, { type: "borrow", amount: 1 });
    expect(overLimit.debt).toBe(5000);
    expect(overLimit.log[0]).toContain("loan shark laughs");
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
      {
        ...encounter,
        cash: 1234,
        bank: 2000,
        health: 1,
        inventory: {
          ...encounter.inventory,
          coke: { quantity: 100, avgCost: 1 },
        },
      },
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
    expect(fatal.score?.value).toBe(fatal.bank - fatal.debt);
    expect(applyAction(fatal, { type: "continue" }).phase).toBe("gameover");
  });

  it("settles automatically on Day 30 with discounted liquidation", () => {
    let state = startGame("Finisher", "manhattan", 42);
    const id = state.market.listed[0];
    state = applyAction(state, { type: "buy", product: id, quantity: 4 });
    state = {
      ...state,
      storage: {
        ...(state.storage ?? state.inventory),
        [id]: { quantity: 2, avgCost: state.market.prices[id] },
      },
    };
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
    expect(storedUnits(state)).toBe(0);
    expect(state.log[0]).toContain("liquidated");
  });

  it("uses borough availability profiles instead of listing every product everywhere", () => {
    const averageListings = (home: GameState["home"]) => {
      let state = startGame("Listings", home, 20260807);
      const counts = [state.market.listed.length];
      for (let day = 1; day < 12; day++) {
        state = clearEncounter(applyAction(state, { type: "lay-low" }));
        counts.push(state.market.listed.length);
      }
      return counts.reduce((total, count) => total + count, 0) / counts.length;
    };
    expect(averageListings("manhattan")).toBeGreaterThan(
      averageListings("staten"),
    );
    expect(averageListings("brooklyn")).toBeLessThan(PRODUCTS.length);
  });

  it("acknowledges the mandatory jelly-baby travel event without changing resources", () => {
    let state = startGame("Jelly", "brooklyn", 101);
    let found = false;
    for (let day = 2; day <= 12 && !found; day++) {
      const destination = state.current === "brooklyn" ? "queens" : "brooklyn";
      const before = {
        cash: state.cash,
        bank: state.bank,
        health: state.health,
        guns: state.guns,
        inventory: state.inventory,
      };
      const traveled = applyAction(
        { ...state, health: 100, heat: 0 },
        { type: "travel", destination },
      );
      const jelly = traveled.pendingNotices?.find((notice) =>
        notice.message.includes('"Would you like a jelly, baby?"'),
      );
      if (jelly) {
        found = true;
        expect(jelly).toMatchObject({ kind: "travel", title: "On the subway" });
        expect(traveled.cash).toBe(before.cash);
        expect(traveled.bank).toBeGreaterThanOrEqual(before.bank);
        expect(traveled.guns).toBe(before.guns);
        expect(traveled.inventory).toEqual(before.inventory);
      }
      state = clearEncounter(traveled);
    }
    expect(found).toBe(true);
  });

  it("records actionable travel hints in field notes", () => {
    let hinted: GameState | undefined;
    for (let seed = 1; seed <= 200 && !hinted; seed++) {
      let state = startGame("Tip", "brooklyn", seed);
      for (let day = 2; day <= 8 && !hinted; day++) {
        const destination =
          state.current === "brooklyn" ? "queens" : "brooklyn";
        const traveled = applyAction(state, { type: "travel", destination });
        if (
          traveled.pendingNotices?.some(
            (notice) => notice.title === "A useful whisper",
          )
        )
          hinted = traveled;
        state = clearEncounter(traveled);
        if (state.phase === "gameover") break;
      }
    }
    expect(hinted).toBeDefined();
    const notes = hinted
      ? BOROUGHS.flatMap((borough) => hinted!.boroughs[borough.id].ledger.notes)
      : [];
    expect(notes.some((note) => note.includes("A contact expects"))).toBe(true);
  });

  it("produces discontinuous prices and acknowledged market shocks", () => {
    let lowestRatio = Number.POSITIVE_INFINITY;
    let highestRatio = 0;
    let premiumLow = Number.POSITIVE_INFINITY;
    let premiumHigh = 0;
    let marketNoticeFound = false;
    for (let seed = 1; seed <= 80; seed++) {
      let state = startGame("Volatility", "brooklyn", seed);
      for (let day = 2; day <= 10; day++) {
        state = applyAction(clearEncounter(state), { type: "lay-low" });
        if (state.pendingNotices?.some((notice) => notice.kind === "market"))
          marketNoticeFound = true;
        for (const item of PRODUCTS) {
          const ratio = state.market.prices[item.id] / item.base;
          lowestRatio = Math.min(lowestRatio, ratio);
          highestRatio = Math.max(highestRatio, ratio);
          if (item.id === "coke" || item.id === "heroin") {
            premiumLow = Math.min(premiumLow, state.market.prices[item.id]);
            premiumHigh = Math.max(premiumHigh, state.market.prices[item.id]);
          }
        }
        if (state.market.condition)
          expect(state.market.listed).toContain(
            state.market.condition.productId,
          );
      }
    }
    expect(marketNoticeFound).toBe(true);
    expect(lowestRatio).toBeLessThan(0.25);
    expect(highestRatio).toBeGreaterThan(4);
    expect(premiumLow).toBeLessThan(5000);
    expect(premiumHigh).toBeGreaterThanOrEqual(80000);
    expect(premiumHigh * 150).toBeGreaterThanOrEqual(12_000_000);
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
      passive = clearEncounter(applyAction(passive, { type: "lay-low" }));
    passive = applyAction(passive, { type: "finish-day" });
    expect(passive.score?.value).toBeLessThan(0);
  });
});
