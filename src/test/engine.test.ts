import { describe, expect, it } from "vitest";
import FIRST_NAMES from "../game/firstNames.json";
import {
  applyAction,
  BANK_DAILY_RATE,
  BOROUGHS,
  boroughServiceNames,
  COAT_CAPACITIES,
  effectiveHeat,
  GameState,
  GUN_CATALOG,
  heatAfterLayingLow,
  inventoryUnits,
  loanSharkEncounterChance,
  LOCAL_SERVICES,
  LOAN_DAILY_RATE,
  MAX_GUNS,
  NOTORIETY_PER_KILL,
  POLICE_GUN_KILL_CHANCE,
  policeEncounterChance,
  policeOfficerRange,
  PRODUCTS,
  REPEAT_LOAN_ADVANCE,
  REPEAT_LOAN_DEBT,
  startGame,
  STORAGE_CAPACITY,
  STORAGE_DAILY_RENT,
  storedUnits,
  storageUnitAt,
  weaponIds,
} from "../game/engine";

const distributedRng = (index: number): number =>
  Math.imul(index, 0x9e3779b9) >>> 0;

const clearFlow = (state: GameState): GameState => {
  let next = state;
  for (let round = 0; round < 200; round++) {
    if (next.phase === "notice") {
      next = applyAction(next, { type: "continue-notice" });
      continue;
    }
    if (next.phase === "outcome") {
      next = applyAction(next, { type: "continue" });
      continue;
    }
    if (next.phase === "loan-shark") {
      next = applyAction(next, { type: "resolve-loan-shark" });
      continue;
    }
    if (next.phase === "encounter") {
      next =
        next.pendingEncounter?.stage === "police-fire"
          ? applyAction(next, { type: "resolve-police-fire" })
          : applyAction(next, {
              type: "resolve-encounter",
              choice: "escape",
            });
      continue;
    }
    return next;
  }
  throw new Error("Flow did not resolve within 200 acknowledged steps");
};

const travel = (state: GameState, destination: GameState["current"]) =>
  clearFlow(applyAction(state, { type: "travel", destination }));

const listedState = (
  name = "Trader",
  home: GameState["home"] = "brooklyn",
  seed = 1,
): GameState => {
  const state = startGame(name, home, seed);
  return {
    ...state,
    cash: 100_000_000,
    capacity: 89,
    market: { ...state.market, listed: PRODUCTS.map((item) => item.id) },
  };
};

const chase = (
  state: GameState,
  officers = 3,
  destination: GameState["current"] = "queens",
): GameState => ({
  ...state,
  phase: "encounter",
  pendingEncounter: {
    destination,
    routeRisk: 0.5,
    cargoValue: 0,
    officers,
    stage: "choice",
  },
});

describe("version-two deterministic engine", () => {
  it("starts a versioned run with the settled opening terms", () => {
    const state = startGame("", "queens", 20260810);
    expect(state.version).toBe(2);
    expect(state.name).toBe("Runner");
    expect(state.cash).toBe(5000);
    expect(state.debt).toBe(10000);
    expect(state.loanRate).toBe(LOAN_DAILY_RATE);
    expect(state.loanGraceUntilDay).toBe(5);
    expect(state.capacity).toBe(10);
    expect(state.heatFloor).toBe(0);
    expect(state.officersKilled).toBe(0);
  });

  it("replays the same seeded sequence exactly", () => {
    const play = () => {
      let state = startGame("Replay", "brooklyn", 123456);
      state = { ...state, debt: 0 };
      const id = state.market.listed[0];
      state = applyAction(state, { type: "buy", product: id, quantity: 3 });
      state = travel(state, "queens");
      state = travel(state, "bronx");
      state = clearFlow(applyAction(state, { type: "lay-low" }));
      return travel(state, "manhattan");
    };
    expect(play()).toEqual(play());
  });

  it("retains weighted average cost and imposes no market-depth cap", () => {
    let state = listedState();
    const id = "green" as const;
    const firstPrice = state.market.prices[id];
    state = applyAction(state, { type: "buy", product: id, quantity: 2 });
    state = {
      ...state,
      market: {
        ...state.market,
        prices: { ...state.market.prices, [id]: firstPrice * 2 },
      },
    };
    state = applyAction(state, { type: "buy", product: id, quantity: 20 });
    expect(state.inventory[id].quantity).toBe(22);
    expect(state.inventory[id].avgCost).toBeCloseTo(
      (2 * firstPrice + 20 * firstPrice * 2) / 22,
    );
  });

  it("creates durable, product-specific interborough spreads", () => {
    const seed = 7788;
    const manhattan = startGame("M", "manhattan", seed).market.prices;
    const queens = startGame("Q", "queens", seed).market.prices;
    const bronx = startGame("B", "bronx", seed).market.prices;
    const staten = startGame("S", "staten", seed).market.prices;
    expect(manhattan.coke).toBeGreaterThan(queens.coke);
    expect(manhattan.molly).toBeGreaterThan(bronx.molly);
    expect(staten.peyote).toBeGreaterThan(bronx.peyote);
    expect(bronx.pills).toBeLessThan(manhattan.pills);
  });

  it("counts only arrivals as visits and develops the first three contacts", () => {
    let state = { ...startGame("Local", "brooklyn", 77), debt: 0 };
    state = travel(state, "queens");
    state = travel(state, "brooklyn");
    state = travel(state, "queens");
    state = travel(state, "brooklyn");
    expect(state.contacts).toHaveLength(1);
    expect(state.contacts[0].borough).toBe("brooklyn");
    const visits = state.boroughs.brooklyn.ledger.visits;
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(state.boroughs.brooklyn.ledger.visits).toBe(visits);

    const reliabilities = state.contactCandidates
      .map((contact) => contact.reliability)
      .sort((a, b) => a - b);
    expect(reliabilities[0]).toBe(0.5);
    expect(reliabilities[2]).toBe(0.95);
    expect(reliabilities[1]).toBeGreaterThanOrEqual(0.5);
    expect(reliabilities[1]).toBeLessThanOrEqual(0.95);
    expect(
      new Set(state.contactCandidates.map((contact) => contact.name)).size,
    ).toBe(3);
    expect(FIRST_NAMES).toHaveLength(1200);
  });

  it("lets a local contact make 1–4 two-day forecasts once per visit", () => {
    let state = { ...startGame("Forecast", "brooklyn", 900), debt: 0 };
    state = travel(state, "queens");
    state = travel(state, "brooklyn");
    state = travel(state, "queens");
    state = travel(state, "brooklyn");
    const consulted = applyAction(state, { type: "consult-contact" });
    expect(consulted.forecasts.length).toBeGreaterThanOrEqual(1);
    expect(consulted.forecasts.length).toBeLessThanOrEqual(4);
    expect(
      consulted.forecasts.every(
        (forecast) => forecast.targetDay === state.day + 2,
      ),
    ).toBe(true);
    const market = applyAction(consulted, { type: "continue" });
    const repeated = applyAction(market, { type: "consult-contact" });
    expect(repeated.forecasts).toHaveLength(consulted.forecasts.length);
    expect(repeated.log[0]).toContain("everything for now");
    state = clearFlow(applyAction(market, { type: "lay-low" }));
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(state.forecasts.every((forecast) => forecast.resolved)).toBe(true);
    for (const forecast of state.forecasts) {
      const actual =
        state.market.prices[forecast.productId] >=
        market.market.prices[forecast.productId]
          ? "up"
          : "down";
      expect(forecast.actualDirection).toBe(actual);
    }
    expect(
      state.fieldNotes.some((note) => note.kind === "contact-result"),
    ).toBe(true);
  });

  it("makes ordinary trade heat cumulative and blocks split-transaction evasion", () => {
    const base = listedState("Heat", "brooklyn", 44);
    const whole = applyAction(base, {
      type: "buy",
      product: "green",
      quantity: 20,
    });
    let split = applyAction(base, {
      type: "buy",
      product: "green",
      quantity: 10,
    });
    split = applyAction(split, {
      type: "buy",
      product: "green",
      quantity: 10,
    });
    expect(split.dailyTrades.grossValue).toBe(whole.dailyTrades.grossValue);
    expect(split.dailyTrades.rawExposureApplied).toBe(
      whole.dailyTrades.rawExposureApplied,
    );
    expect(split.heat).toBe(whole.heat);
  });

  it("applies aggregate premium-drug thresholds and persistent debt pressure", () => {
    const base = listedState("Premium", "brooklyn", 45);
    let split = applyAction(base, {
      type: "buy",
      product: "coke",
      quantity: 5,
    });
    split = applyAction(split, {
      type: "buy",
      product: "coke",
      quantity: 6,
    });
    expect(split.heat).toBeGreaterThanOrEqual(30);
    expect(split.heat).toBeLessThanOrEqual(60);
    expect(split.loanPremiumPressure).toBe(true);

    const huge = applyAction(base, {
      type: "buy",
      product: "heroin",
      quantity: 25,
    });
    expect(huge.heat).toBe(100);
  });

  it("keeps Lay low above the notoriety floor", () => {
    let heat = 90;
    for (let day = 0; day < 20; day++) heat = heatAfterLayingLow(heat, 36);
    expect(heat).toBe(36);
  });

  it("uses displayed heat for most boroughs and doubled effective heat in Manhattan", () => {
    expect(effectiveHeat(1, "manhattan")).toBe(2);
    expect(effectiveHeat(10, "manhattan")).toBe(20);
    expect(effectiveHeat(50, "manhattan")).toBe(100);
    expect(effectiveHeat(50, "queens")).toBe(50);
  });

  it("gates police encounters and patrol size by heat", () => {
    expect(policeEncounterChance(9, 0.52, 100_000_000)).toBeLessThan(0.01);
    expect(policeEncounterChance(90, 0.3, 0)).toBeGreaterThan(
      policeEncounterChance(50, 0.3, 0),
    );
    expect(policeOfficerRange(9)).toEqual({ min: 1, max: 2 });
    expect(policeOfficerRange(15)).toEqual({ min: 1, max: 3 });
    expect(policeOfficerRange(50)).toEqual({ min: 3, max: 7 });
    expect(policeOfficerRange(100)).toEqual({ min: 5, max: 12 });
  });

  it("makes every gun an independent two-thirds kill roll", () => {
    expect(POLICE_GUN_KILL_CHANCE).toBeCloseTo(2 / 3);
    const armed = chase(
      {
        ...startGame("Armed", "bronx", 51),
        guns: MAX_GUNS,
        weapons: GUN_CATALOG.map((gun) => gun.id),
      },
      6,
    );
    let multi: GameState | undefined;
    for (let index = 1; index < 1000 && !multi; index++) {
      const candidate = applyAction(
        { ...armed, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "fight" },
      );
      if (candidate.officersKilled >= 2) multi = candidate;
    }
    expect(multi?.officersKilled).toBeGreaterThanOrEqual(2);
    expect(multi?.guns).toBe(MAX_GUNS);
    expect(multi?.heatFloor).toBe(
      Math.min(90, (multi?.officersKilled ?? 0) * NOTORIETY_PER_KILL),
    );
  });

  it("runs a fight as player result, police warning, police result, then choice", () => {
    const armed = chase(
      {
        ...startGame("Round", "bronx", 52),
        guns: 1,
        weapons: [GUN_CATALOG[0].id],
      },
      3,
    );
    const volley = applyAction(armed, {
      type: "resolve-encounter",
      choice: "fight",
    });
    expect(volley.phase).toBe("outcome");
    const warning = applyAction(volley, { type: "continue" });
    expect(warning.phase).toBe("encounter");
    expect(warning.pendingEncounter?.stage).toBe("police-fire");
    const returnFire = applyAction(warning, { type: "resolve-police-fire" });
    expect(returnFire.phase).toBe("outcome");
    const choice = applyAction(returnFire, { type: "continue" });
    expect(choice.phase).toBe("encounter");
    expect(choice.pendingEncounter?.stage).toBe("choice");
  });

  it("sends a failed Run through police return fire and mentions stock only when carried", () => {
    const empty = chase(startGame("Run", "brooklyn", 53), 2);
    let failedRng = 0;
    let failed: GameState | undefined;
    for (let index = 1; index < 5000 && !failed; index++) {
      const candidate = applyAction(
        { ...empty, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "escape" },
      );
      if (candidate.pendingOutcome?.title === "You couldn't lose them.") {
        failedRng = distributedRng(index);
        failed = candidate;
      }
    }
    expect(failed?.pendingOutcome?.message).not.toContain("stock");
    expect(
      failed &&
        applyAction(failed, { type: "continue" }).pendingEncounter?.stage,
    ).toBe("police-fire");

    const product = "green" as const;
    const stocked = applyAction(
      {
        ...empty,
        rng: failedRng,
        inventory: {
          ...empty.inventory,
          [product]: { quantity: 10, avgCost: 100 },
        },
      },
      { type: "resolve-encounter", choice: "escape" },
    );
    expect(stocked.pendingOutcome?.message).toContain(
      "You dropped some of your stock",
    );
  });

  it("searches low-heat surrenders and arrests only when something is carried", () => {
    const clean = chase(startGame("Clean", "brooklyn", 54), 2);
    const detained = applyAction(clean, {
      type: "resolve-encounter",
      choice: "give-up",
    });
    expect(detained.pendingOutcome?.message).toContain("search your coat");
    const released = applyAction(applyAction(detained, { type: "continue" }), {
      type: "continue",
    });
    expect(released.phase).toBe("market");

    const dirty = chase(
      {
        ...startGame("Dirty", "brooklyn", 55),
        guns: 1,
        weapons: [GUN_CATALOG[0].id],
      },
      2,
    );
    const arrested = applyAction(dirty, {
      type: "resolve-encounter",
      choice: "give-up",
    });
    const arrestResult = applyAction(arrested, { type: "continue" });
    expect(arrestResult.pendingOutcome?.message).toContain("under arrest");
    expect(applyAction(arrestResult, { type: "continue" }).phase).toBe(
      "gameover",
    );
  });

  it("turns high-effective-heat Give up into inaction and return fire", () => {
    const hot = chase(
      { ...startGame("Hot", "manhattan", 56), heat: 20 },
      2,
      "manhattan",
    );
    const result = applyAction(hot, {
      type: "resolve-encounter",
      choice: "give-up",
    });
    expect(result.pendingOutcome?.message).toContain("looking like an idiot");
    expect(
      applyAction(result, { type: "continue" }).pendingEncounter?.stage,
    ).toBe("police-fire");
  });

  it("keeps guns through fights and can drop one while running", () => {
    const armed = chase(
      {
        ...startGame("Carrier", "brooklyn", 57),
        guns: 1,
        weapons: [GUN_CATALOG[0].id],
      },
      3,
    );
    const fought = applyAction(armed, {
      type: "resolve-encounter",
      choice: "fight",
    });
    expect(fought.guns).toBe(1);
    let dropped: GameState | undefined;
    for (let index = 1; index < 10000 && !dropped; index++) {
      const candidate = applyAction(
        { ...armed, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "escape" },
      );
      if (candidate.guns === 0) dropped = candidate;
    }
    expect(dropped).toBeDefined();
    expect(dropped && weaponIds(dropped)).toHaveLength(0);
  });

  it("charges grace-sensitive enforcer probabilities before police", () => {
    const initial = startGame("Debtor", "brooklyn", 58);
    expect(loanSharkEncounterChance(initial, "brooklyn")).toBe(0);
    const exposed = {
      ...initial,
      day: 6,
      loanPremiumPressure: false,
    };
    expect(loanSharkEncounterChance(exposed, "queens")).toBe(0.1);
    expect(loanSharkEncounterChance(exposed, "brooklyn")).toBe(0.25);
    expect(
      loanSharkEncounterChance(
        { ...exposed, loanPremiumPressure: true },
        "queens",
      ),
    ).toBe(0.2);
    expect(
      loanSharkEncounterChance(
        { ...exposed, loanPremiumPressure: true },
        "brooklyn",
      ),
    ).toBe(0.5);
  });

  it("makes a wild enforcer beating take cash, stock, guns, and the coat", () => {
    const base = startGame("Marked", "brooklyn", 59);
    const found: GameState = {
      ...base,
      cash: 1234,
      health: 100,
      guns: 2,
      weapons: [GUN_CATALOG[0].id, GUN_CATALOG[1].id],
      capacity: 55,
      inventory: {
        ...base.inventory,
        coke: { quantity: 4, avgCost: 100 },
      },
      phase: "loan-shark",
      pendingLoanSharkEncounter: { destination: "queens" },
    };
    const result = applyAction(found, { type: "resolve-loan-shark" });
    expect(result.cash).toBe(0);
    expect(result.guns).toBe(0);
    expect(inventoryUnits(result)).toBe(0);
    expect(result.capacity).toBe(10);
    expect(result.health).toBeGreaterThanOrEqual(25);
    expect(result.health).toBeLessThanOrEqual(75);
    expect(result.pendingOutcome?.message).toContain("f***ed you up");
  });

  it("raises only the vig when an indebted player mistakenly asks for more", () => {
    const state = startGame("Mistake", "brooklyn", 60);
    const result = applyAction(state, {
      type: "borrow",
      amount: REPEAT_LOAN_ADVANCE,
    });
    expect(result.cash).toBe(state.cash);
    expect(result.debt).toBe(state.debt);
    expect(result.loanRate).toBeCloseTo(state.loanRate * 1.5);
    expect(result.pendingOutcome?.message).toContain("vig");
  });

  it("closes a paid account and unlocks the larger fixed advance", () => {
    const initial = { ...startGame("Credit", "brooklyn", 61), cash: 20_000 };
    const repaid = applyAction(initial, {
      type: "repay",
      amount: initial.debt,
    });
    expect(repaid.debt).toBe(0);
    expect(repaid.pendingOutcome?.title).toContain("account is closed");
    const market = applyAction(repaid, { type: "continue" });
    const borrowed = applyAction(market, {
      type: "borrow",
      amount: REPEAT_LOAN_ADVANCE,
    });
    expect(borrowed.cash).toBe(market.cash + REPEAT_LOAN_ADVANCE);
    expect(borrowed.debt).toBe(REPEAT_LOAN_DEBT);
    expect(borrowed.loanGraceUntilDay).toBe(market.day + 4);
  });

  it("uses a smaller office beating and credits seized cash only during payment", () => {
    const base = { ...startGame("Office", "brooklyn", 62), cash: 20_000 };
    let detected: GameState | undefined;
    for (let index = 1; index < 1000 && !detected; index++) {
      const candidate = applyAction(
        { ...base, rng: distributedRng(index) },
        { type: "repay", amount: 1000 },
      );
      if (candidate.health < 100) detected = candidate;
    }
    expect(detected).toBeDefined();
    expect(detected?.cash).toBe(0);
    expect(detected?.debt).toBe(0);
    expect(detected?.health).toBeGreaterThanOrEqual(70);
    expect(detected?.health).toBeLessThanOrEqual(90);

    const moreTime = applyAction(base, { type: "loan-more-time" });
    expect(moreTime.cash).toBe(0);
    expect(moreTime.debt).toBe(base.debt);
    expect(base.health - moreTime.health).toBeGreaterThanOrEqual(10);
    expect(base.health - moreTime.health).toBeLessThanOrEqual(30);
  });

  it("maps the settled services and prices the coat progression exactly", () => {
    expect(LOCAL_SERVICES.manhattan.map((service) => service.id)).toEqual([
      "clinic",
      "plastic-surgeon",
    ]);
    expect(LOCAL_SERVICES.brooklyn.map((service) => service.id)).toEqual([
      "plastic-surgeon",
      "storage-unit",
    ]);
    expect(LOCAL_SERVICES.queens.map((service) => service.id)).toEqual([
      "coat-maker",
      "storage-unit",
    ]);
    expect(LOCAL_SERVICES.bronx.map((service) => service.id)).toEqual([
      "arms-dealer",
      "clinic",
    ]);
    expect(LOCAL_SERVICES.staten.map((service) => service.id)).toEqual([
      "fence",
      "storage-unit",
    ]);
    expect(boroughServiceNames("queens", "queens")).toEqual([
      "Bank",
      "Loan shark",
      "Coat factory",
      "Storage",
    ]);

    let state = { ...startGame("Coat", "queens", 63), cash: 20_000 };
    const costs = [1000, 2000, 3000, 5000];
    for (let index = 1; index < COAT_CAPACITIES.length; index++) {
      const before = state.cash;
      state = applyAction(state, {
        type: "use-local-service",
        service: "coat-maker",
      });
      expect(state.capacity).toBe(COAT_CAPACITIES[index]);
      expect(state.cash).toBe(before - costs[index - 1]);
    }
  });

  it("keeps local storage separate, capped, rented, and recoverably late", () => {
    const base = startGame("Storage", "brooklyn", 64);
    let state: GameState = {
      ...base,
      cash: STORAGE_DAILY_RENT,
      inventory: {
        ...base.inventory,
        green: { quantity: 10, avgCost: 100 },
      },
    };
    state = applyAction(state, { type: "rent-storage" });
    expect(state.cash).toBe(0);
    expect(storageUnitAt(state, "brooklyn").active).toBe(true);
    state = applyAction(state, {
      type: "store",
      product: "green",
      quantity: 10,
    });
    expect(storedUnits(state, "brooklyn")).toBe(10);
    expect(storedUnits(state, "queens")).toBe(0);
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(storageUnitAt(state, "brooklyn").lateSinceDay).toBe(2);
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(storageUnitAt(state, "brooklyn").active).toBe(false);
    expect(storedUnits(state, "brooklyn")).toBe(0);

    const overfull = {
      ...base,
      current: "queens" as const,
      cash: 1000,
      inventory: {
        ...base.inventory,
        green: { quantity: STORAGE_CAPACITY + 1, avgCost: 1 },
      },
    };
    const rented = applyAction(overfull, { type: "rent-storage" });
    const refused = applyAction(rented, {
      type: "store",
      product: "green",
      quantity: STORAGE_CAPACITY + 1,
    });
    expect(storedUnits(refused, "queens")).toBe(0);
    expect(refused.log[0]).toContain("full");
  });

  it("makes plastic surgery a three-day $200,000 reset of heat and notoriety", () => {
    const initial: GameState = {
      ...startGame("New Face", "manhattan", 65),
      cash: 300_000,
      debt: 0,
      heat: 91,
      heatFloor: 48,
      notorietyKills: 4,
    };
    const changed = applyAction(initial, {
      type: "use-local-service",
      service: "plastic-surgeon",
    });
    expect(changed.day).toBe(4);
    expect(changed.cash).toBe(100_000);
    expect(changed.heat).toBe(0);
    expect(changed.heatFloor).toBe(0);
    expect(changed.notorietyKills).toBe(0);
  });

  it("accrues the published bank and debt rates each day", () => {
    const initial: GameState = {
      ...startGame("Rates", "brooklyn", 66),
      bank: 10_000,
      debt: 10_000,
    };
    const next = clearFlow(applyAction(initial, { type: "lay-low" }));
    expect(next.bank).toBe(Math.floor(10_000 * (1 + BANK_DAILY_RATE)));
    expect(next.debt).toBe(Math.ceil(10_000 * (1 + LOAN_DAILY_RATE)));
  });

  it("settles Day 30 without liquidating or valuing unsold stock", () => {
    const base = startGame("Finisher", "brooklyn", 67);
    const state: GameState = {
      ...base,
      day: 30,
      cash: 12_000,
      bank: 3000,
      debt: 5000,
      inventory: {
        ...base.inventory,
        coke: { quantity: 10, avgCost: 1 },
      },
      storageUnits: {
        ...base.storageUnits,
        brooklyn: {
          active: true,
          inventory: {
            ...base.storageUnits.brooklyn.inventory,
            heroin: { quantity: 20, avgCost: 1 },
          },
        },
      },
    };
    const settled = applyAction(state, { type: "finish-day" });
    expect(settled.phase).toBe("gameover");
    expect(settled.score?.value).toBe(10_000);
    expect(inventoryUnits(settled)).toBe(10);
    expect(storedUnits(settled)).toBe(20);
    expect(settled.score).toMatchObject({
      home: "brooklyn",
      officersKilled: 0,
    });
  });

  it("keeps field notes globally reverse chronological", () => {
    let state = { ...startGame("Notes", "brooklyn", 68), debt: 0 };
    for (let day = 0; day < 8; day++)
      state = clearFlow(
        applyAction(state, {
          type: "travel",
          destination: state.current === "brooklyn" ? "queens" : "brooklyn",
        }),
      );
    const keys = state.fieldNotes.map(
      (note) => note.day * 1000 + note.sequence,
    );
    expect(keys).toEqual([...keys].sort((a, b) => b - a));
    expect(
      state.fieldNotes.every((note) => !note.message.includes("has flooded")),
    ).toBe(true);
  });

  it("acknowledges the mandatory jelly-baby event", () => {
    let state = { ...startGame("Jelly", "brooklyn", 101), debt: 0 };
    let found = false;
    for (let day = 2; day <= 12 && !found; day++) {
      const destination = state.current === "brooklyn" ? "queens" : "brooklyn";
      const traveled = applyAction(state, { type: "travel", destination });
      found = Boolean(
        traveled.pendingNotices?.some((notice) =>
          notice.message.includes('"Would you like a jelly, baby?"'),
        ),
      );
      state = clearFlow(traveled);
    }
    expect(found).toBe(true);
  });

  it("keeps seeded passive runs inside core invariants", () => {
    for (let seed = 1; seed <= 100; seed++) {
      let state = startGame(
        "Simulation",
        BOROUGHS[seed % BOROUGHS.length].id,
        seed,
      );
      while (state.phase !== "gameover" && state.day < 30) {
        const options = BOROUGHS.filter(
          (borough) => borough.id !== state.current,
        );
        state = clearFlow(
          applyAction(state, {
            type: "travel",
            destination: options[(seed + state.day) % options.length].id,
          }),
        );
        expect(state.cash).toBeGreaterThanOrEqual(0);
        expect(state.bank).toBeGreaterThanOrEqual(0);
        expect(state.debt).toBeGreaterThanOrEqual(0);
        expect(state.heat).toBeGreaterThanOrEqual(state.heatFloor);
        expect(inventoryUnits(state)).toBeLessThanOrEqual(state.capacity);
      }
      if (state.phase !== "gameover")
        state = applyAction(state, { type: "finish-day" });
      expect(state.phase).toBe("gameover");
      expect(state.score).toBeDefined();
    }
  });
});
