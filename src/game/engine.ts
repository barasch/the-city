/** Pure, serializable rules for the 30-day borough trading game. */

export const PRODUCTS = [
  { id: "green", name: "Green", role: "staple", base: 90, color: "#9be564" },
  {
    id: "acid",
    name: "Acid",
    role: "event-sensitive",
    base: 240,
    color: "#d6b3ff",
  },
  {
    id: "shrooms",
    name: "Shrooms",
    role: "event-sensitive",
    base: 180,
    color: "#f0c88a",
  },
  {
    id: "speed",
    name: "Speed",
    role: "steady middle",
    base: 320,
    color: "#ffca69",
  },
  {
    id: "molly",
    name: "Molly",
    role: "nightlife",
    base: 560,
    color: "#ff91c8",
  },
  {
    id: "coke",
    name: "Coke",
    role: "import premium",
    base: 950,
    color: "#dfe8ef",
  },
  {
    id: "heroin",
    name: "Heroin",
    role: "scarce opioid",
    base: 1250,
    color: "#ff8d8d",
  },
  {
    id: "pills",
    name: "Pills",
    role: "prescription",
    base: 480,
    color: "#87d9ff",
  },
  { id: "meth", name: "Meth", role: "volatile", base: 720, color: "#e9f27b" },
  { id: "hash", name: "Hash", role: "staple", base: 145, color: "#b4d18e" },
  {
    id: "opioids",
    name: "Opioids",
    role: "prescription",
    base: 680,
    color: "#a9b7ff",
  },
  {
    id: "peyote",
    name: "Peyote",
    role: "scarcity",
    base: 380,
    color: "#c8f5a3",
  },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];
export type BoroughId =
  "manhattan" | "brooklyn" | "queens" | "bronx" | "staten";
export const BOROUGHS: { id: BoroughId; name: string; summary: string }[] = [
  {
    id: "manhattan",
    name: "Manhattan",
    summary: "Broad listings, fast information, watch the heat.",
  },
  {
    id: "brooklyn",
    name: "Brooklyn",
    summary: "Volatile nightlife demand and quick reversals.",
  },
  {
    id: "queens",
    name: "Queens",
    summary: "Import links and conditions that linger.",
  },
  {
    id: "bronx",
    name: "The Bronx",
    summary: "Reliable patrol patterns and wholesale bargains.",
  },
  {
    id: "staten",
    name: "Staten Island",
    summary: "Sparse listings, occasional scarcity premiums.",
  },
];

export interface InventoryItem {
  quantity: number;
  avgCost: number;
}
export type Inventory = Record<ProductId, InventoryItem>;
export interface PriceObservation {
  day: number;
  price: number;
}
export interface LedgerEntry {
  visits: number;
  lastVisitDay: number | null;
  observations: Partial<Record<ProductId, PriceObservation>>;
  notes: string[];
}
export interface LocalCondition {
  id: string;
  label: string;
  productId: ProductId;
  multiplier: number;
  enforcementDelta: number;
  daysLeft: number;
}
export interface MarketSnapshot {
  borough: BoroughId;
  day: number;
  prices: Record<ProductId, number>;
  listed: ProductId[];
  bulletin: string;
  condition?: LocalCondition;
}
export interface BoroughState {
  id: BoroughId;
  familiarity: number;
  enforcement: number;
  condition?: LocalCondition;
  ledger: LedgerEntry;
  market: MarketSnapshot | null;
}
export type Phase = "market" | "encounter" | "gameover";
export interface PendingEncounter {
  destination: BoroughId;
  routeRisk: number;
  cargoValue: number;
}
export interface Score {
  name: string;
  value: number;
  day: number;
  reason: string;
  date: string;
}
export interface GameState {
  version: 1;
  seed: number;
  rng: number;
  name: string;
  day: number;
  home: BoroughId;
  current: BoroughId;
  cash: number;
  bank: number;
  debt: number;
  health: number;
  heat: number;
  guns: number;
  capacity: number;
  inventory: Inventory;
  boroughs: Record<BoroughId, BoroughState>;
  market: MarketSnapshot;
  phase: Phase;
  pendingEncounter?: PendingEncounter;
  log: string[];
  score?: Score;
}

export type Action =
  | { type: "buy"; product: ProductId; quantity: number }
  | { type: "sell"; product: ProductId; quantity: number }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "borrow"; amount: number }
  | { type: "repay"; amount: number }
  | { type: "buy-gun" }
  | { type: "travel"; destination: BoroughId }
  | { type: "lay-low" }
  | { type: "resolve-encounter"; choice: "escape" | "fight" }
  | { type: "finish-day" };

const BOROUGH_PROFILE: Record<
  BoroughId,
  {
    bias: number;
    volatility: number;
    enforcement: number;
    listing: number;
    route: number;
  }
> = {
  manhattan: {
    bias: 1.1,
    volatility: 0.15,
    enforcement: 0.16,
    listing: 0.92,
    route: 0.12,
  },
  brooklyn: {
    bias: 0.98,
    volatility: 0.29,
    enforcement: 0.1,
    listing: 0.78,
    route: 0.1,
  },
  queens: {
    bias: 0.91,
    volatility: 0.19,
    enforcement: 0.08,
    listing: 0.83,
    route: 0.18,
  },
  bronx: {
    bias: 0.88,
    volatility: 0.13,
    enforcement: 0.07,
    listing: 0.87,
    route: 0.08,
  },
  staten: {
    bias: 1.01,
    volatility: 0.35,
    enforcement: 0.12,
    listing: 0.52,
    route: 0.28,
  },
};
const PRODUCT_INDEX = Object.fromEntries(
  PRODUCTS.map((p, i) => [p.id, i]),
) as Record<ProductId, number>;
const BOROUGH_INDEX = Object.fromEntries(
  BOROUGHS.map((b, i) => [b.id, i]),
) as Record<BoroughId, number>;

const emptyInventory = (): Inventory =>
  Object.fromEntries(
    PRODUCTS.map((p) => [p.id, { quantity: 0, avgCost: 0 }]),
  ) as Inventory;
const emptyLedger = (): LedgerEntry => ({
  visits: 0,
  lastVisitDay: null,
  observations: {},
  notes: [],
});
const boroughMap = (): Record<BoroughId, BoroughState> =>
  Object.fromEntries(
    BOROUGHS.map((b) => [
      b.id,
      {
        id: b.id,
        familiarity: 0,
        enforcement: BOROUGH_PROFILE[b.id].enforcement,
        ledger: emptyLedger(),
        market: null,
      },
    ]),
  ) as Record<BoroughId, BoroughState>;

/** A fast integer hash gives stable results in browser, tests, and future server replays. */
export function hashSeed(seed: number, ...parts: number[]): number {
  let value = seed >>> 0;
  for (const part of parts) {
    value ^= (part + 0x9e3779b9 + (value << 6) + (value >>> 2)) >>> 0;
    value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
    value = Math.imul(value ^ (value >>> 13), 0x45d9f3b);
  }
  return (value ^ (value >>> 16)) >>> 0;
}
const unit = (value: number): number => (value >>> 0) / 4294967296;
const money = (value: number): number => Math.max(0, Math.round(value));
const clamp = (value: number, low: number, high: number): number =>
  Math.max(low, Math.min(high, value));
const borough = (state: GameState, id: BoroughId): BoroughState =>
  state.boroughs[id];
const product = (id: ProductId) => PRODUCTS[PRODUCT_INDEX[id]];
const productName = (id: ProductId) => product(id).name;
const totalCargo = (inventory: Inventory): number =>
  PRODUCTS.reduce((n, p) => n + inventory[p.id].quantity, 0);
const cargoValue = (state: GameState): number =>
  PRODUCTS.reduce(
    (n, p) => n + state.inventory[p.id].quantity * state.market.prices[p.id],
    0,
  );
const addLog = (state: GameState, message: string): GameState => ({
  ...state,
  log: [message, ...state.log].slice(0, 18),
});

function makeMarket(
  seed: number,
  day: number,
  id: BoroughId,
  local?: LocalCondition,
): MarketSnapshot {
  const profile = BOROUGH_PROFILE[id];
  const prices = {} as Record<ProductId, number>;
  const available: ProductId[] = [];
  for (const p of PRODUCTS) {
    const noise =
      1 +
      (unit(hashSeed(seed, day, BOROUGH_INDEX[id], PRODUCT_INDEX[p.id], 31)) -
        0.5) *
        profile.volatility *
        2;
    const roleBias =
      0.89 +
      unit(hashSeed(seed, PRODUCT_INDEX[p.id], BOROUGH_INDEX[id], 77)) * 0.27;
    const conditionMultiplier =
      local?.productId === p.id ? local.multiplier : 1;
    prices[p.id] = money(
      p.base * profile.bias * roleBias * noise * conditionMultiplier,
    );
    const listingRoll = unit(
      hashSeed(seed, day, BOROUGH_INDEX[id], PRODUCT_INDEX[p.id], 43),
    );
    if (listingRoll < profile.listing) available.push(p.id);
  }
  // Keep each market useful without introducing quantity/depth caps.
  if (available.length < 5) {
    const missing = PRODUCTS.filter((p) => !available.includes(p.id)).sort(
      (a, b) =>
        unit(hashSeed(seed, day, PRODUCT_INDEX[a.id], 91)) -
        unit(hashSeed(seed, day, PRODUCT_INDEX[b.id], 91)),
    );
    available.push(...missing.slice(0, 5 - available.length).map((p) => p.id));
  }
  const bulletin = local
    ? local.label
    : `${BOROUGHS.find((b) => b.id === id)?.name} is open for business.`;
  return {
    borough: id,
    day,
    prices,
    listed: available,
    bulletin,
    condition: local,
  };
}

function eventFor(
  seed: number,
  day: number,
  id: BoroughId,
): LocalCondition | undefined {
  const roll = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 202));
  if (roll > 0.22) return undefined;
  const index = hashSeed(seed, day, BOROUGH_INDEX[id], 203) % PRODUCTS.length;
  const p = PRODUCTS[index];
  const favorable = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 204)) > 0.45;
  return {
    id: `${id}-${day}-${p.id}`,
    label: favorable
      ? `A seizure has tightened ${p.name} supply here.`
      : `A shipment has flooded the ${p.name} market.`,
    productId: p.id,
    multiplier: favorable ? 1.48 : 0.58,
    enforcementDelta: favorable ? 0.12 : 0.03,
    daysLeft: 3 + (hashSeed(seed, day, BOROUGH_INDEX[id], 205) % 3),
  };
}

function decayConditions(
  states: Record<BoroughId, BoroughState>,
): Record<BoroughId, BoroughState> {
  const result = { ...states } as Record<BoroughId, BoroughState>;
  for (const b of BOROUGHS) {
    const old = states[b.id];
    if (old.condition && old.condition.daysLeft <= 1) {
      result[b.id] = { ...old, condition: undefined };
    } else if (old.condition) {
      result[b.id] = {
        ...old,
        condition: { ...old.condition, daysLeft: old.condition.daysLeft - 1 },
      };
    }
  }
  return result;
}

function observe(
  states: Record<BoroughId, BoroughState>,
  market: MarketSnapshot,
  day: number,
): Record<BoroughId, BoroughState> {
  const old = states[market.borough];
  const observations = { ...old.ledger.observations };
  for (const id of market.listed)
    observations[id] = { day, price: market.prices[id] };
  return {
    ...states,
    [market.borough]: {
      ...old,
      familiarity: Math.min(6, old.familiarity + 1),
      ledger: {
        ...old.ledger,
        visits: old.ledger.visits + 1,
        lastVisitDay: day,
        observations,
      },
      market,
    },
  };
}

function arrive(
  state: GameState,
  destination: BoroughId,
  day: number,
  extraLog?: string,
): GameState {
  let states = decayConditions(state.boroughs);
  const generated = eventFor(state.seed, day, destination);
  const target = states[destination];
  // Enforcement is a durable borough baseline; the condition's delta is applied
  // only while that condition exists, so a crackdown cannot ratchet forever.
  if (generated)
    states = { ...states, [destination]: { ...target, condition: generated } };
  const market = makeMarket(
    state.seed,
    day,
    destination,
    states[destination].condition,
  );
  states = observe(states, market, day);
  let next: GameState = {
    ...state,
    day,
    current: destination,
    boroughs: states,
    market,
    phase: "market",
    pendingEncounter: undefined,
  };
  if (generated) next = addLog(next, `MARKET: ${generated.label}`);
  if (extraLog) next = addLog(next, extraLog);
  return next;
}

export function startGame(
  name: string,
  home: BoroughId,
  seed = 0xb0a0d05,
): GameState {
  const cleanName = name.trim().slice(0, 24) || "Runner";
  const base = {
    version: 1 as const,
    seed: seed >>> 0,
    rng: hashSeed(seed, 1),
    name: cleanName,
    day: 1,
    home,
    current: home,
    cash: 5000,
    bank: 0,
    debt: 10000,
    health: 100,
    heat: 0,
    guns: 0,
    capacity: 100,
    inventory: emptyInventory(),
    boroughs: boroughMap(),
    market: null as unknown as MarketSnapshot,
    phase: "market" as Phase,
    log: [
      `You chose ${BOROUGHS.find((b) => b.id === home)?.name}. Day 1 begins.`,
    ],
  };
  const first = arrive(base, home, 1);
  return addLog(
    first,
    "Your contact says: information is worth more than a lucky buy.",
  );
}

function invalid(state: GameState, reason: string): GameState {
  return addLog(state, `NOT NOW: ${reason}`);
}
function cloneInventory(inventory: Inventory): Inventory {
  return Object.fromEntries(
    PRODUCTS.map((p) => [p.id, { ...inventory[p.id] }]),
  ) as Inventory;
}

function buy(state: GameState, id: ProductId, quantity: number): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  if (!state.market.listed.includes(id))
    return invalid(state, `${productName(id)} is not listed here today`);
  if (totalCargo(state.inventory) + q > state.capacity)
    return invalid(state, "your bag is full");
  const price = state.market.prices[id];
  const cost = q * price;
  if (cost > state.cash) return invalid(state, "you do not have enough cash");
  const inventory = cloneInventory(state.inventory);
  const item = inventory[id];
  item.avgCost = (item.quantity * item.avgCost + cost) / (item.quantity + q);
  item.quantity += q;
  return addLog(
    { ...state, cash: state.cash - cost, inventory },
    `Bought ${q} ${productName(id)} for $${cost.toLocaleString()}.`,
  );
}

function sell(state: GameState, id: ProductId, quantity: number): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  const q = Math.floor(quantity);
  const item = state.inventory[id];
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  if (!state.market.listed.includes(id))
    return invalid(state, `${productName(id)} is not listed here today`);
  if (q > item.quantity)
    return invalid(state, `you only have ${item.quantity} ${productName(id)}`);
  const proceeds = q * state.market.prices[id];
  const inventory = cloneInventory(state.inventory);
  inventory[id].quantity -= q;
  if (inventory[id].quantity === 0) inventory[id].avgCost = 0;
  return addLog(
    { ...state, cash: state.cash + proceeds, inventory },
    `Sold ${q} ${productName(id)} for $${proceeds.toLocaleString()}.`,
  );
}

function service(
  state: GameState,
  type: "deposit" | "withdraw" | "borrow" | "repay",
  amount: number,
): GameState {
  if (state.phase !== "market")
    return invalid(state, "services are closed during an encounter");
  if (state.current !== state.home)
    return invalid(state, "the bank and loan shark only deal at home");
  const a = Math.floor(amount);
  if (!Number.isFinite(a) || a <= 0)
    return invalid(state, "amount must be positive");
  if (type === "deposit") {
    const x = Math.min(a, state.cash);
    return addLog(
      { ...state, cash: state.cash - x, bank: state.bank + x },
      `Deposited $${x.toLocaleString()} at home.`,
    );
  }
  if (type === "withdraw") {
    const x = Math.min(a, state.bank);
    return addLog(
      { ...state, cash: state.cash + x, bank: state.bank - x },
      `Withdrew $${x.toLocaleString()} from the bank.`,
    );
  }
  if (type === "borrow")
    return addLog(
      { ...state, cash: state.cash + a, debt: state.debt + a },
      `The loan shark advanced $${a.toLocaleString()}.`,
    );
  const x = Math.min(a, state.cash, state.debt);
  return addLog(
    { ...state, cash: state.cash - x, debt: state.debt - x },
    `Repaid $${x.toLocaleString()} of debt.`,
  );
}

function buyGun(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(
      state,
      "the gear contact is unavailable during an encounter",
    );
  if (state.current !== state.home)
    return invalid(state, "gear is arranged through your home contact");
  const price = 900 + state.guns * 180;
  if (state.cash < price)
    return invalid(state, `a gun costs ${cashForLog(price)} today`);
  return addLog(
    {
      ...state,
      cash: state.cash - price,
      guns: state.guns + 1,
      heat: clamp(state.heat + 4, 0, 100),
    },
    `Bought a gun for ${cashForLog(price)}. Keep it quiet.`,
  );
}
const cashForLog = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

function nextRandom(state: GameState): [number, number] {
  let x = state.rng >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return [unit(x), x];
}

function applyInterest(state: GameState): GameState {
  return {
    ...state,
    bank: Math.floor(state.bank * 1.005),
    debt: Math.ceil(state.debt * 1.015),
  };
}

function encounterChance(state: GameState, destination: BoroughId): number {
  const profile = BOROUGH_PROFILE[destination];
  const localDelta =
    borough(state, destination).condition?.enforcementDelta ?? 0;
  return clamp(
    profile.route +
      borough(state, destination).enforcement +
      localDelta +
      state.heat / 180 +
      cargoValue(state) / 80000,
    0.04,
    0.82,
  );
}

function travel(state: GameState, destination: BoroughId): GameState {
  if (state.phase !== "market")
    return invalid(state, "you cannot travel during an encounter");
  if (state.day >= 30)
    return invalid(state, "Day 30 is for settling up, not traveling");
  if (destination === state.current)
    return invalid(state, "you are already there");
  const day = state.day + 1;
  const arrival = arrive(
    applyInterest(state),
    destination,
    day,
    `You traveled from ${BOROUGHS.find((b) => b.id === state.current)?.name}.`,
  );
  const [roll, rng] = nextRandom(arrival);
  const chance = encounterChance(arrival, destination);
  const withRng = { ...arrival, rng };
  if (roll < chance) {
    return addLog(
      {
        ...withRng,
        phase: "encounter",
        pendingEncounter: {
          destination,
          routeRisk: chance,
          cargoValue: cargoValue(withRng),
        },
      },
      `POLICE: patrols have noticed your route. Choose escape or fight.`,
    );
  }
  return addLog(withRng, "The route is quiet.");
}

function resolveEncounter(
  state: GameState,
  choice: "escape" | "fight",
): GameState {
  if (state.phase !== "encounter" || !state.pendingEncounter)
    return invalid(state, "there is no encounter to resolve");
  const [roll, rng] = nextRandom(state);
  const encounter = state.pendingEncounter;
  if (choice === "fight" && state.guns < 1)
    return invalid(state, "you have no guns; try to escape");
  if (choice === "escape") {
    const chance = clamp(
      0.58 -
        encounter.routeRisk * 0.35 +
        state.health / 260 +
        state.guns * 0.012,
      0.28,
      0.86,
    );
    if (roll < chance)
      return addLog(
        {
          ...state,
          rng,
          phase: "market",
          pendingEncounter: undefined,
          heat: clamp(state.heat - 6, 0, 100),
        },
        "You slipped the patrol. Keep moving.",
      );
    const inventory = cloneInventory(state.inventory);
    for (const p of PRODUCTS)
      inventory[p.id].quantity = Math.floor(inventory[p.id].quantity * 0.72);
    const next = {
      ...state,
      rng,
      inventory,
      phase: "market" as Phase,
      pendingEncounter: undefined,
      heat: clamp(state.heat + 14, 0, 100),
      health: state.health - 18,
    };
    if (next.health <= 0)
      return endGame(next, "You were hurt escaping the patrol.");
    return addLog(
      next,
      "You escaped, but lost some of the bag and took a hit.",
    );
  }
  const chance = clamp(
    0.24 + state.guns * 0.14 + state.health / 360,
    0.18,
    0.9,
  );
  const guns = Math.max(0, state.guns - 1);
  if (roll < chance)
    return addLog(
      {
        ...state,
        rng,
        guns,
        phase: "market",
        pendingEncounter: undefined,
        heat: clamp(state.heat + 10, 0, 100),
      },
      `You fought through. One gun is gone; ${guns} remain.`,
    );
  const inventory = cloneInventory(state.inventory);
  for (const p of PRODUCTS)
    inventory[p.id].quantity = Math.floor(inventory[p.id].quantity * 0.5);
  const next = {
    ...state,
    rng,
    guns,
    inventory,
    phase: "market" as Phase,
    pendingEncounter: undefined,
    heat: clamp(state.heat + 25, 0, 100),
    health: state.health - 38,
  };
  if (next.health <= 0) return endGame(next, "The fight went badly.");
  return addLog(
    next,
    "The fight went badly. Half the bag is gone and you are hurt.",
  );
}

function settle(state: GameState, reason = "Thirty days complete."): GameState {
  const liquidation = PRODUCTS.reduce(
    (n, p) =>
      n + state.inventory[p.id].quantity * state.market.prices[p.id] * 0.72,
    0,
  );
  const value = Math.round(state.cash + state.bank + liquidation - state.debt);
  const score: Score = {
    name: state.name,
    value,
    day: state.day,
    reason,
    date: `Day ${state.day}`,
  };
  return addLog(
    { ...state, phase: "gameover", score, inventory: emptyInventory() },
    `SETTLED: remaining stock liquidated at 72%. Final score $${value.toLocaleString()}.`,
  );
}
function endGame(state: GameState, reason: string): GameState {
  const value = Math.round(
    state.cash + state.bank - state.debt + cargoValue(state),
  );
  return addLog(
    {
      ...state,
      phase: "gameover",
      score: {
        name: state.name,
        value,
        day: state.day,
        reason,
        date: `Day ${state.day}`,
      },
    },
    `GAME OVER: ${reason}`,
  );
}

function layLow(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "you cannot lay low during an encounter");
  if (state.day >= 30)
    return settle(
      {
        ...state,
        health: clamp(state.health + 22, 0, 100),
        heat: Math.max(0, state.heat - 24),
      },
      "You laid low on Day 30.",
    );
  const next = arrive(
    applyInterest({
      ...state,
      health: clamp(state.health + 22, 0, 100),
      heat: Math.max(0, state.heat - 24),
    }),
    state.current,
    state.day + 1,
    "You lay low. The city forgets you a little.",
  );
  return addLog(next, "Health recovered and heat cooled.");
}

export function applyAction(state: GameState, action: Action): GameState {
  if (state.phase === "gameover") return invalid(state, "this run is over");
  switch (action.type) {
    case "buy":
      return buy(state, action.product, action.quantity);
    case "sell":
      return sell(state, action.product, action.quantity);
    case "deposit":
    case "withdraw":
    case "borrow":
    case "repay":
      return service(state, action.type, action.amount);
    case "buy-gun":
      return buyGun(state);
    case "travel":
      return travel(state, action.destination);
    case "lay-low":
      return layLow(state);
    case "resolve-encounter":
      return resolveEncounter(state, action.choice);
    case "finish-day":
      return state.day === 30 && state.phase === "market"
        ? settle(state)
        : invalid(state, "you can settle only after trading on Day 30");
  }
}

export function inventoryUnits(state: GameState): number {
  return totalCargo(state.inventory);
}
export function inventoryValue(state: GameState): number {
  return cargoValue(state);
}
export function currentBorough(state: GameState): BoroughState {
  return state.boroughs[state.current];
}
