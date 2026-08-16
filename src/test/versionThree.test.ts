import { describe, expect, it } from "vitest";
import {
  applyAction,
  BoroughId,
  fenceMultiplier,
  fenceValue,
  GameState,
  GUN_CATALOG,
  gunKillChance,
  heatCeiling,
  inventoryUnits,
  MAX_GUNS,
  MAX_STORAGE_UNITS,
  POLICE_OFFICER_HIT_CHANCE,
  policeOfficerRange,
  PRODUCTS,
  startGame,
  STORAGE_CAPACITY,
  STORAGE_DAILY_RENT,
  rentedStorageUnits,
  storedUnits,
  storageBuyMultiplier,
  storageSaleMultiplier,
  storageUnitAt,
  weaponIds,
} from "../game/engine";

const PRODUCT_IDS = PRODUCTS.map((product) => product.id);
const distributedRng = (index: number): number =>
  Math.imul(index, 0x9e3779b9) >>> 0;

function clearFlow(state: GameState): GameState {
  let next = state;
  for (let step = 0; step < 300; step++) {
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
  throw new Error("Flow did not resolve");
}

function richState(current: BoroughId = "brooklyn", seed = 1): GameState {
  const base = clearFlow(startGame("Rules", current, seed));
  return {
    ...base,
    current,
    home: current,
    cash: 1_000_000_000,
    debt: 0,
    capacity: 10_000,
    market: { ...base.market, borough: current, listed: PRODUCT_IDS },
  };
}

function withCarriedStock(state: GameState, quantity = 8): GameState {
  return {
    ...state,
    inventory: {
      ...state.inventory,
      coke: { quantity, avgCost: 12_000 },
    },
  };
}

function streetCollection(state: GameState): GameState {
  return applyAction(
    {
      ...state,
      phase: "loan-shark",
      pendingLoanSharkEncounter: { destination: state.current },
    },
    { type: "resolve-loan-shark" },
  );
}

function detectedPartial(state: GameState, amount: number): GameState {
  for (let index = 1; index < 10_000; index++) {
    const candidate = applyAction(
      { ...state, rng: distributedRng(index) },
      { type: "repay", amount },
    );
    if (candidate.pendingOutcome?.title === "He sees the cash.")
      return candidate;
  }
  throw new Error("Could not find a deterministic detection roll");
}

function twoKillVolley(state: GameState): GameState {
  const encounter: GameState = {
    ...state,
    guns: 2,
    weapons: GUN_CATALOG.slice(-2).map((gun) => gun.id),
    phase: "encounter",
    pendingEncounter: {
      destination: state.current,
      routeRisk: 0.5,
      cargoValue: 0,
      officers: 2,
      stage: "choice",
      effectiveHeat: state.heat,
    },
  };
  for (let index = 1; index < 10_000; index++) {
    const candidate = applyAction(
      { ...encounter, rng: distributedRng(index) },
      { type: "resolve-encounter", choice: "fight" },
    );
    if (candidate.officersKilled - state.officersKilled === 2)
      return clearFlow(candidate);
  }
  throw new Error("Could not find a deterministic two-kill volley");
}

describe("version-three economy and enforcement rules", () => {
  it("makes Day 6 safe and starts collection pressure on Day 7", () => {
    const state = startGame("Grace", "brooklyn", 2);
    expect(state.loanGraceUntilDay).toBe(6);
    expect(
      applyAction({ ...state, day: 6, debt: 0 }, { type: "lay-low" }).day,
    ).toBe(7);
  });

  it("credits insufficient street cash, strips coat stock, and leaves guns", () => {
    const base = withCarriedStock({
      ...startGame("Short", "brooklyn", 3),
      cash: 4_000,
      debt: 10_000,
      capacity: 55,
      guns: 2,
      weapons: GUN_CATALOG.slice(0, 2).map((gun) => gun.id),
    });
    const result = streetCollection(base);
    expect(result.cash).toBe(0);
    expect(result.debt).toBe(6_000);
    expect(result.capacity).toBe(10);
    expect(inventoryUnits(result)).toBe(0);
    expect(result.guns).toBe(2);
    expect(weaponIds(result)).toEqual(base.weapons);
  });

  it("takes 90% of cash above the debt and leaves coat stock when debt clears", () => {
    const base = withCarriedStock({
      ...startGame("Covered", "brooklyn", 4),
      cash: 20_005,
      debt: 10_000,
      capacity: 55,
      guns: 1,
      weapons: [GUN_CATALOG[0].id],
    });
    const result = streetCollection(base);
    expect(result.cash).toBe(1_000);
    expect(result.debt).toBe(0);
    expect(result.capacity).toBe(55);
    expect(inventoryUnits(result)).toBe(8);
    expect(result.guns).toBe(1);
  });

  it("uses the same collection rule for more time and detected partial payment", () => {
    const base = withCarriedStock({
      ...startGame("Office", "brooklyn", 5),
      cash: 20_000,
      debt: 10_000,
      capacity: 34,
      guns: 1,
      weapons: [GUN_CATALOG[0].id],
    });
    const moreTime = applyAction(base, { type: "loan-more-time" });
    expect(moreTime.pendingOutcome?.title).toBe("Wrong answer, Office.");
    expect(moreTime.cash).toBe(1_000);
    expect(moreTime.debt).toBe(0);
    expect(moreTime.capacity).toBe(34);
    expect(inventoryUnits(moreTime)).toBe(8);
    expect(moreTime.guns).toBe(1);

    const partial = detectedPartial(base, 1_000);
    expect(partial.cash).toBe(1_000);
    expect(partial.debt).toBe(0);
    expect(partial.capacity).toBe(34);
    expect(inventoryUnits(partial)).toBe(8);
    expect(partial.guns).toBe(1);
  });

  it("strips coat stock after a detected partial payment that remains short", () => {
    const base = withCarriedStock({
      ...startGame("Withholder", "brooklyn", 6),
      cash: 5_000,
      debt: 12_000,
      capacity: 89,
      guns: 2,
      weapons: GUN_CATALOG.slice(0, 2).map((gun) => gun.id),
    });
    const result = detectedPartial(base, 1_000);
    expect(result.cash).toBe(0);
    expect(result.debt).toBe(7_000);
    expect(result.capacity).toBe(10);
    expect(inventoryUnits(result)).toBe(0);
    expect(result.guns).toBe(2);
  });

  it("accepts an all-cash partial payment without an enforcer beating", () => {
    const base = {
      ...startGame("Token", "brooklyn", 7),
      cash: 3_000,
      debt: 10_000,
      health: 88,
    };
    const result = applyAction(base, { type: "repay", amount: 3_000 });
    expect(result.cash).toBe(0);
    expect(result.debt).toBe(7_000);
    expect(result.health).toBe(88);
    expect(result.pendingOutcome?.message).not.toContain("beat you down");
  });

  it("leaves the fatal loan-shark follow-up body empty", () => {
    const result = streetCollection({
      ...startGame("Fatal", "brooklyn", 8),
      health: 1,
      cash: 0,
    });
    expect(result.pendingOutcome?.followUp?.title).toBe("They wasted you!!!");
    expect(result.pendingOutcome?.followUp?.message).toBe("");
  });

  it("cannot reach banked cash or rented storage during collection", () => {
    const opening = startGame("Banked", "brooklyn", 81);
    const base = withCarriedStock({
      ...opening,
      cash: 50_000,
      bank: 0,
      debt: 10_000,
      capacity: 55,
      guns: 1,
      weapons: [GUN_CATALOG[0].id],
      storageUnits: {
        ...opening.storageUnits,
        brooklyn: {
          units: [
            {
              slot: 1,
              productId: "heroin",
              quantity: 9,
              avgCost: 1,
            },
          ],
        },
      },
    });
    const deposited = applyAction(base, { type: "deposit", amount: 50_000 });
    expect(deposited.cash).toBe(0);
    expect(deposited.bank).toBe(50_000);
    expect(deposited.debt).toBe(10_000);
    const first = applyAction(deposited, { type: "loan-more-time" });
    expect(first.bank).toBe(50_000);
    expect(first.debt).toBe(10_000);
    expect(first.capacity).toBe(10);
    expect(inventoryUnits(first)).toBe(0);
    expect(storedUnits(first, "brooklyn")).toBe(9);
    expect(first.guns).toBe(1);
    const market = clearFlow(first);
    const second = applyAction(market, { type: "loan-more-time" });
    expect(second.bank).toBe(50_000);
    expect(storedUnits(second, "brooklyn")).toBe(9);
    expect(second.health).toBeLessThan(first.health);
  });

  it("caps heat at 85 without a police killing", () => {
    let state = richState("brooklyn", 9);
    state = {
      ...state,
      cash: 1e18,
      capacity: 100_000,
      market: {
        ...state.market,
        prices: { ...state.market.prices, heroin: 1_000_000_000_000 },
      },
    };
    for (let day = 1; day <= 8; day++) {
      state = {
        ...state,
        day,
        market: { ...state.market, day },
      };
      state = applyAction(state, {
        type: "buy",
        product: "heroin",
        quantity: 1,
      });
    }
    expect(state.identityKills).toBe(0);
    expect(state.heat).toBe(heatCeiling(0));
    expect(state.heat).toBe(85);
  });

  it("keeps four police kills near 75 rather than forcing heat to 100", () => {
    let state: GameState = {
      ...richState("bronx", 10),
      heat: 40,
      heatExposure: 30,
      cash: 100_000,
    };
    state = twoKillVolley(state);
    state = twoKillVolley(state);
    expect(state.identityKills).toBe(4);
    expect(state.officersKilled).toBe(4);
    expect(state.heat).toBeLessThanOrEqual(75);
    expect(state.heat).toBeGreaterThan(40);
    expect(state.guns).toBe(2);
  });

  it("does not cool on a heat-producing day, then cools after a clean day", () => {
    let state = richState("brooklyn", 11);
    state = applyAction(state, { type: "buy", product: "coke", quantity: 10 });
    const hot = state.heat;
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(state.day).toBe(2);
    expect(state.heat).toBe(hot);
    state = clearFlow(applyAction(state, { type: "lay-low" }));
    expect(state.day).toBe(3);
    expect(state.heat).toBeLessThan(hot);
  });

  it("takes about 10–15 quiet days for late-game heat 75 to fall below 25", () => {
    let heat = 75;
    let days = 0;
    while (heat >= 25 && days < 100) {
      const state = {
        ...richState("brooklyn", 82),
        heat,
        heatExposure: 100,
        identityKills: 4,
        lastHeatIncreaseDay: 0,
        day: days + 1,
      };
      const next = clearFlow(applyAction(state, { type: "lay-low" }));
      heat = next.heat;
      days += 1;
    }
    expect(days).toBeGreaterThanOrEqual(10);
    expect(days).toBeLessThanOrEqual(15);
  });

  it("does not cool heat merely because a Run succeeds", () => {
    const base = richState("queens", 83);
    const encounter: GameState = {
      ...base,
      heat: 52,
      heatExposure: 70,
      phase: "encounter",
      pendingEncounter: {
        destination: "queens",
        routeRisk: 0.2,
        cargoValue: 0,
        officers: 2,
        stage: "choice",
        effectiveHeat: 52,
      },
    };
    let escaped: GameState | undefined;
    for (let index = 1; index < 10_000 && !escaped; index++) {
      const candidate = applyAction(
        { ...encounter, rng: distributedRng(index) },
        { type: "resolve-encounter", choice: "escape" },
      );
      if (candidate.pendingOutcome?.title === "You got away.")
        escaped = candidate;
    }
    expect(escaped).toBeDefined();
    expect(escaped?.heat).toBe(52);
    expect(escaped?.heatExposure).toBe(70);
  });

  it("resets identity heat factors but retains lifetime kills after surgery", () => {
    const result = applyAction(
      {
        ...richState("manhattan", 12),
        day: 20,
        cash: 300_000,
        heat: 72,
        heatExposure: 140,
        identityKills: 3,
        officersKilled: 7,
      },
      { type: "use-local-service", service: "plastic-surgeon" },
    );
    expect(result.day).toBe(23);
    expect(result.heat).toBe(0);
    expect(result.heatExposure).toBe(0);
    expect(result.identityKills).toBe(0);
    expect(result.officersKilled).toBe(7);
  });
});

describe("version-three storage and resale rules", () => {
  const stockedUnit = (
    slot: number,
    productId: "green" | "meth" | "acid" | "coke" | "pills",
    quantity: number,
  ) => ({ slot, productId, quantity, avgCost: 1 });

  it("prices one exact-unit delivery at 120% locally and 140% remotely", () => {
    expect(storageBuyMultiplier("brooklyn", "brooklyn")).toBe(1.2);
    expect(storageBuyMultiplier("brooklyn", "queens")).toBe(1.4);
    let state = richState("brooklyn", 20);
    state = applyAction(state, { type: "rent-storage" });
    state = {
      ...state,
      storageUnits: {
        ...state.storageUnits,
        queens: { units: [{ slot: 2, quantity: 0, avgCost: 0 }] },
      },
      market: {
        ...state.market,
        prices: { ...state.market.prices, green: 1_001 },
      },
    };
    const cashBefore = state.cash;
    state = applyAction(state, {
      type: "buy-storage",
      borough: "brooklyn",
      unit: 1,
      product: "green",
      quantity: 2,
    });
    expect(cashBefore - state.cash).toBe(Math.ceil(1_001 * 1.2) * 2);
    expect(storageUnitAt(state, "brooklyn", 1)).toMatchObject({
      productId: "green",
      quantity: 2,
    });
    const afterLocal = state.cash;
    state = applyAction(state, {
      type: "buy-storage",
      borough: "queens",
      unit: 2,
      product: "green",
      quantity: 2,
    });
    expect(afterLocal - state.cash).toBe(Math.ceil(1_001 * 1.4) * 2);
    expect(storageUnitAt(state, "queens", 2)?.quantity).toBe(2);
  });

  it("requires rental, keeps units separate, and caps each at one product and 200", () => {
    let state = richState("queens", 21);
    const refused = applyAction(state, {
      type: "buy-storage",
      borough: "brooklyn",
      unit: 1,
      product: "green",
      quantity: 1,
    });
    expect(storedUnits(refused, "brooklyn")).toBe(0);
    expect(refused.log[0]).toContain("rent that storage unit");

    for (let index = 0; index < MAX_STORAGE_UNITS; index++)
      state = applyAction(state, { type: "rent-storage" });
    expect(rentedStorageUnits(state, "queens")).toBe(3);
    expect(state.storageUnits.queens.units.map((unit) => unit.slot)).toEqual([
      1, 2, 3,
    ]);

    state = applyAction(state, {
      type: "buy-storage",
      borough: "queens",
      unit: 1,
      product: "green",
      quantity: STORAGE_CAPACITY,
    });
    const wrongProduct = applyAction(state, {
      type: "buy-storage",
      borough: "queens",
      unit: 1,
      product: "pills",
      quantity: 1,
    });
    expect(storageUnitAt(wrongProduct, "queens", 1)?.productId).toBe("green");
    expect(wrongProduct.log[0]).toContain("already contains Green");
    const overfill = applyAction(state, {
      type: "buy-storage",
      borough: "queens",
      unit: 1,
      product: "green",
      quantity: 1,
    });
    expect(storageUnitAt(overfill, "queens", 1)?.quantity).toBe(200);
    expect(storageUnitAt(overfill, "queens", 2)?.quantity).toBe(0);
  });

  it("allows repeated zero-day coat transfers to fill and empty a unit", () => {
    let state = richState("brooklyn", 85);
    state = {
      ...applyAction(state, { type: "rent-storage" }),
      capacity: 10,
      market: {
        ...state.market,
        prices: { ...state.market.prices, green: 100 },
      },
    };
    for (let load = 0; load < 20; load++) {
      state = applyAction(state, {
        type: "buy",
        product: "green",
        quantity: 10,
      });
      state = applyAction(state, {
        type: "store",
        unit: 1,
        product: "green",
        quantity: 10,
      });
    }
    expect(state.day).toBe(1);
    expect(storageUnitAt(state, "brooklyn", 1)).toMatchObject({
      productId: "green",
      quantity: 200,
      avgCost: 100,
    });
    state = {
      ...state,
      market: {
        ...state.market,
        prices: { ...state.market.prices, green: 200 },
      },
    };
    for (let load = 0; load < 20; load++) {
      state = applyAction(state, {
        type: "retrieve",
        unit: 1,
        product: "green",
        quantity: 10,
      });
      state = applyAction(state, {
        type: "sell",
        product: "green",
        quantity: 10,
      });
    }
    expect(state.day).toBe(1);
    expect(inventoryUnits(state)).toBe(0);
    expect(storageUnitAt(state, "brooklyn", 1)).toMatchObject({
      productId: undefined,
      quantity: 0,
    });
  });

  it("liquidates a complete listed unit at 70% local or 50% remote and ends its contract", () => {
    expect(storageSaleMultiplier("queens", "queens")).toBe(0.7);
    expect(storageSaleMultiplier("queens", "brooklyn")).toBe(0.5);
    let state: GameState = {
      ...richState("queens", 22),
      market: {
        ...richState("queens", 22).market,
        prices: { ...richState("queens", 22).market.prices, meth: 5_001 },
      },
      storageUnits: {
        ...richState("queens", 22).storageUnits,
        queens: { units: [stockedUnit(1, "meth", 10)] },
        brooklyn: { units: [stockedUnit(2, "meth", 10)] },
      },
    };
    const cashBefore = state.cash;
    state = applyAction(state, {
      type: "sell-storage",
      borough: "queens",
      unit: 1,
    });
    expect(state.cash - cashBefore).toBe(Math.floor(5_001 * 0.7) * 10);
    expect(storageUnitAt(state, "queens", 1)).toBeUndefined();
    const afterLocal = state.cash;
    state = applyAction(state, {
      type: "sell-storage",
      borough: "brooklyn",
      unit: 2,
    });
    expect(state.cash - afterLocal).toBe(Math.floor(5_001 * 0.5) * 10);
    expect(rentedStorageUnits(state)).toBe(0);
  });

  it("makes an unlisted storage product unsellable", () => {
    const base = richState("queens", 23);
    const state: GameState = {
      ...base,
      market: {
        ...base.market,
        listed: base.market.listed.filter((id) => id !== "acid"),
      },
      storageUnits: {
        ...base.storageUnits,
        brooklyn: { units: [stockedUnit(1, "acid", 3)] },
      },
    };
    const result = applyAction(state, {
      type: "sell-storage",
      borough: "brooklyn",
      unit: 1,
    });
    expect(result.cash).toBe(state.cash);
    expect(storageUnitAt(result, "brooklyn", 1)?.quantity).toBe(3);
    expect(result.log[0]).toContain("not listed");
  });

  it("multiplies fence discounts and ends only the fenced storage contract", () => {
    const statenSource = { borough: "staten" as const, unit: 1 };
    const remoteSource = { borough: "brooklyn" as const, unit: 2 };
    expect(fenceMultiplier("coat")).toBeCloseTo(0.3);
    expect(fenceMultiplier(statenSource)).toBeCloseTo(0.21);
    expect(fenceMultiplier(remoteSource)).toBeCloseTo(0.15);
    const base = richState("staten", 24);
    const state: GameState = {
      ...withCarriedStock(base, 2),
      boroughs: {
        ...base.boroughs,
        staten: {
          ...base.boroughs.staten,
          ledger: {
            ...base.boroughs.staten.ledger,
            observations: {
              ...base.boroughs.staten.ledger.observations,
              coke: { day: base.day, price: 10_000 },
            },
          },
        },
      },
      storageUnits: {
        ...base.storageUnits,
        staten: { units: [stockedUnit(1, "coke", 2)] },
        brooklyn: { units: [stockedUnit(2, "coke", 2)] },
      },
    };
    expect(fenceValue(state, "coat")).toBe(6_000);
    expect(fenceValue(state, statenSource)).toBe(4_200);
    expect(fenceValue(state, remoteSource)).toBe(3_000);
    const fenced = applyAction(state, {
      type: "use-fence",
      source: remoteSource,
    });
    expect(storageUnitAt(fenced, "brooklyn", 2)).toBeUndefined();
    expect(storedUnits(fenced, "staten")).toBe(2);
    expect(inventoryUnits(fenced)).toBe(2);
  });

  it("charges rent per contract, closes only empty units, and liquidates all late units", () => {
    let state = richState("brooklyn", 25);
    for (let index = 0; index < 3; index++)
      state = applyAction(state, { type: "rent-storage" });
    state = {
      ...state,
      debt: 0,
      storageUnits: {
        ...state.storageUnits,
        brooklyn: {
          units: [
            stockedUnit(1, "pills", 20),
            { slot: 2, quantity: 0, avgCost: 0 },
            { slot: 3, quantity: 0, avgCost: 0 },
          ],
        },
      },
    };
    const refused = applyAction(state, { type: "close-storage", unit: 1 });
    expect(rentedStorageUnits(refused, "brooklyn")).toBe(3);
    const closed = applyAction(state, { type: "close-storage", unit: 2 });
    expect(rentedStorageUnits(closed, "brooklyn")).toBe(2);
    const cashBefore = closed.cash;
    const next = clearFlow(applyAction(closed, { type: "lay-low" }));
    expect(cashBefore - next.cash).toBe(2 * STORAGE_DAILY_RENT);

    let late = { ...closed, cash: 0 };
    late = clearFlow(applyAction(late, { type: "lay-low" }));
    expect(late.storageUnits.brooklyn.lateSinceDay).toBeDefined();
    late = clearFlow(applyAction(late, { type: "lay-low" }));
    expect(rentedStorageUnits(late, "brooklyn")).toBe(0);
    expect(storedUnits(late, "brooklyn")).toBe(0);
  });

  it("keeps zero-day storage actions available on Day 30", () => {
    let state = {
      ...richState("queens", 84),
      day: 30,
      market: {
        ...richState("queens", 84).market,
        day: 30,
        listed: PRODUCT_IDS,
      },
    };
    state = applyAction(state, { type: "rent-storage" });
    state = applyAction(state, {
      type: "buy-storage",
      borough: "queens",
      unit: 1,
      product: "pills",
      quantity: 5,
    });
    expect(state.day).toBe(30);
    expect(storageUnitAt(state, "queens", 1)?.quantity).toBe(5);
    expect(applyAction(state, { type: "finish-day" }).phase).toBe("gameover");
  });
});

describe("version-three gun and patrol rules", () => {
  it("caps ownership at two and buys owned guns back at half price", () => {
    let state = richState("bronx", 30);
    for (const gun of GUN_CATALOG.slice(0, MAX_GUNS))
      state = applyAction(state, { type: "buy-gun", gun: gun.id });
    expect(MAX_GUNS).toBe(2);
    expect(state.guns).toBe(2);
    const cashBeforeRefusal = state.cash;
    state = applyAction(state, {
      type: "buy-gun",
      gun: GUN_CATALOG[3].id,
    });
    expect(state.cash).toBe(cashBeforeRefusal);
    const sold = GUN_CATALOG[1];
    const beforeSale = state.cash;
    state = applyAction(state, { type: "sell-gun", gun: sold.id });
    expect(state.cash - beforeSale).toBe(Math.floor(sold.price * 0.5));
    expect(state.guns).toBe(1);
  });

  it("scales hidden gun kill likelihood strictly from 44% to 95%", () => {
    const chances = GUN_CATALOG.map((gun) => gunKillChance(gun.id));
    expect(chances.map((chance) => Math.round(chance * 100))).toEqual([
      44, 51, 58, 66, 73, 95,
    ]);
    expect(
      chances.every(
        (chance, index) => index === 0 || chance > chances[index - 1],
      ),
    ).toBe(true);
  });

  it("uses the slightly S-shaped patrol response curve", () => {
    const at = (heat: number) => {
      const range = policeOfficerRange(heat);
      return (range.min + range.max) / 2;
    };
    expect(at(10)).toBeLessThan(1.5);
    expect(at(50)).toBeCloseTo(7.5, 0);
    expect(at(90)).toBeGreaterThan(13.5);
    expect(at(100)).toBe(15);
  });

  it("gives officers 30% hit rolls but caps a volley at one 10–25 hit", () => {
    expect(POLICE_OFFICER_HIT_CHANCE).toBe(0.3);
    const base = richState("bronx", 31);
    const encounter: GameState = {
      ...base,
      health: 100,
      phase: "encounter",
      pendingEncounter: {
        destination: "bronx",
        routeRisk: 0.5,
        cargoValue: 0,
        officers: 15,
        stage: "police-fire",
      },
    };
    let hits = 0;
    for (let index = 1; index <= 500; index++) {
      const result = applyAction(
        { ...encounter, rng: distributedRng(index) },
        { type: "resolve-police-fire" },
      );
      const damage = 100 - result.health;
      if (damage > 0) {
        hits += 1;
        expect(damage).toBeGreaterThanOrEqual(10);
        expect(damage).toBeLessThanOrEqual(25);
      }
    }
    expect(hits).toBeGreaterThan(450);
  });
});
