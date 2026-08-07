/** Pure, serializable rules for the 30-day borough trading game. */

export const PRODUCTS = [
  {
    id: "green",
    name: "Green",
    role: "staple",
    base: 400,
    color: "#9be564",
  },
  {
    id: "acid",
    name: "Acid",
    role: "event-sensitive",
    base: 2500,
    color: "#d6b3ff",
  },
  {
    id: "shrooms",
    name: "Shrooms",
    role: "event-sensitive",
    base: 950,
    color: "#f0c88a",
  },
  {
    id: "speed",
    name: "Speed",
    role: "steady middle",
    base: 180,
    color: "#ffca69",
  },
  {
    id: "molly",
    name: "Molly",
    role: "nightlife",
    base: 3500,
    color: "#ff91c8",
  },
  {
    id: "coke",
    name: "Coke",
    role: "import premium",
    base: 20000,
    color: "#dfe8ef",
  },
  {
    id: "heroin",
    name: "Heroin",
    role: "scarce opioid",
    base: 10000,
    color: "#ff8d8d",
  },
  {
    id: "pills",
    name: "Pills",
    role: "prescription",
    base: 75,
    color: "#87d9ff",
  },
  {
    id: "meth",
    name: "Meth",
    role: "volatile",
    base: 1800,
    color: "#e9f27b",
  },
  {
    id: "hash",
    name: "Hash",
    role: "staple",
    base: 750,
    color: "#b4d18e",
  },
  {
    id: "opioids",
    name: "Opioids",
    role: "prescription",
    base: 1200,
    color: "#a9b7ff",
  },
  {
    id: "peyote",
    name: "Peyote",
    role: "scarcity",
    base: 500,
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

export type LocalServiceId =
  | "plastic-surgeon"
  | "coat-maker"
  | "clinic"
  | "arms-dealer"
  | "storage-unit"
  | "fence";
export interface LocalServiceOffer {
  id: LocalServiceId;
  directoryName: string;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  cost: number;
  days: number;
}
export const GUN_CATALOG = [
  { id: "taurus-g3c", name: "Taurus G3C", price: 500 },
  { id: "sig-p365", name: "SIG Sauer P365", price: 650 },
  { id: "glock-19", name: "Glock 19", price: 800 },
  { id: "beretta-92fs", name: "Beretta 92FS", price: 950 },
  { id: "colt-1911", name: "Colt 1911", price: 1200 },
  { id: "colt-python", name: "Colt Python", price: 1500 },
] as const;
export type GunId = (typeof GUN_CATALOG)[number]["id"];
export type GunDefinition = (typeof GUN_CATALOG)[number];
export const MAX_GUNS = GUN_CATALOG.length;
export const COAT_CAPACITIES = [25, 50, 100, 150, 200] as const;
export const MAX_COAT_CAPACITY = COAT_CAPACITIES.at(-1) ?? 200;

export function nextCoatCapacity(currentCapacity: number): number | undefined {
  return COAT_CAPACITIES.find((capacity) => capacity > currentCapacity);
}

export function policeFightSuccessChance(guns: number, health: number): number {
  const gunCount = clamp(Math.floor(guns), 0, MAX_GUNS);
  if (gunCount < 1) return 0;
  return clamp(0.2 + clamp(health, 0, 100) / 400 + gunCount * 0.083, 0.2, 0.95);
}

export const LOCAL_SERVICES: Record<BoroughId, LocalServiceOffer> = {
  manhattan: {
    id: "plastic-surgeon",
    directoryName: "Plastic surgeon",
    label: "Visit plastic surgeon",
    title: "A new face",
    description:
      "A new face costs $25,000 and takes five days. Your heat will fall to zero.",
    confirmLabel: "Proceed",
    cost: 25000,
    days: 5,
  },
  brooklyn: {
    id: "clinic",
    directoryName: "Clinic",
    label: "Visit clinic",
    title: "Private treatment",
    description:
      "Treatment costs $1,500, takes one day, and restores your health.",
    confirmLabel: "Get treatment",
    cost: 1500,
    days: 1,
  },
  queens: {
    id: "coat-maker",
    directoryName: "Coat factory",
    label: "Buy larger coat",
    title: "A larger coat",
    description: "The coat factory will enlarge your coat for $4,000.",
    confirmLabel: "Buy",
    cost: 4000,
    days: 0,
  },
  bronx: {
    id: "arms-dealer",
    directoryName: "Guns",
    label: "Visit gun shop",
    title: "Gun shop",
    description: "Six models are available, while you have room to carry one.",
    confirmLabel: "Choose a gun",
    cost: 0,
    days: 0,
  },
  staten: {
    id: "storage-unit",
    directoryName: "Storage",
    label: "Visit storage unit",
    title: "Storage unit",
    description:
      "Leave stock here or retrieve it when you return to Staten Island.",
    confirmLabel: "Manage storage",
    cost: 0,
    days: 0,
  },
};
export const FENCE_SERVICE: LocalServiceOffer = {
  id: "fence",
  directoryName: "Fence",
  label: "Visit fence",
  title: "No questions asked",
  description:
    "The fence will buy everything in your coat at a discount, including products not listed here today.",
  confirmLabel: "Sell everything",
  cost: 0,
  days: 0,
};

export function boroughServiceNames(id: BoroughId, home: BoroughId): string[] {
  const names = id === home ? ["Bank", "Loan shark"] : [];
  names.push(LOCAL_SERVICES[id].directoryName);
  if (id === "staten") names.push(FENCE_SERVICE.directoryName);
  return names;
}

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
export type Phase =
  "market" | "encounter" | "loan-shark" | "notice" | "outcome" | "gameover";
export interface PendingEncounter {
  destination: BoroughId;
  routeRisk: number;
  cargoValue: number;
  /** Optional so an in-progress save from the first browser build still loads. */
  officers?: number;
}
export interface PendingLoanSharkEncounter {
  destination: BoroughId;
}
export interface PendingNotice {
  kind: "travel" | "market";
  title: string;
  message: string;
}
export interface PendingOutcome {
  kind: "police" | "loan-shark";
  title: string;
  message: string;
  nextPhase: "market" | "encounter" | "gameover";
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
  /** Optional so saves from the count-only gun system remain playable. */
  weapons?: GunId[];
  capacity: number;
  inventory: Inventory;
  /** Optional so saves created before the storage service remain playable. */
  storage?: Inventory;
  boroughs: Record<BoroughId, BoroughState>;
  market: MarketSnapshot;
  phase: Phase;
  pendingEncounter?: PendingEncounter;
  pendingLoanSharkEncounter?: PendingLoanSharkEncounter;
  pendingNotices?: PendingNotice[];
  noticeReturnPhase?: "market" | "encounter" | "loan-shark";
  pendingOutcome?: PendingOutcome;
  travelEventsSeen?: string[];
  log: string[];
  score?: Score;
}

/** Reconstructs named weapons for older saves that stored only a gun count. */
export function weaponIds(state: GameState): GunId[] {
  const count = Math.max(
    0,
    Math.min(
      MAX_GUNS,
      Number.isFinite(state.guns) ? Math.floor(state.guns) : 0,
    ),
  );
  const valid = new Set<GunId>(GUN_CATALOG.map((gun) => gun.id));
  const owned: GunId[] = [];
  for (const id of state.weapons ?? []) {
    if (valid.has(id) && !owned.includes(id)) owned.push(id);
  }
  for (const gun of GUN_CATALOG) {
    if (owned.length >= count) break;
    if (!owned.includes(gun.id)) owned.push(gun.id);
  }
  return owned.slice(0, count);
}

export type Action =
  | { type: "buy"; product: ProductId; quantity: number }
  | { type: "sell"; product: ProductId; quantity: number }
  | { type: "store"; product: ProductId; quantity: number }
  | { type: "retrieve"; product: ProductId; quantity: number }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "borrow"; amount: number }
  | { type: "repay"; amount: number }
  | { type: "buy-gun"; gun?: GunId }
  | { type: "use-local-service" }
  | { type: "use-fence" }
  | { type: "travel"; destination: BoroughId }
  | { type: "lay-low" }
  | { type: "resolve-encounter"; choice: "escape" | "fight" }
  | { type: "resolve-loan-shark" }
  | { type: "continue-notice" }
  | { type: "continue" }
  | { type: "finish-day" };

export const LOAN_SHARK_CREDIT_LIMIT = 5000;

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
const PRODUCT_VOLATILITY: Record<ProductId, number> = {
  green: 0.26,
  acid: 0.66,
  shrooms: 0.58,
  speed: 0.42,
  molly: 0.61,
  coke: 0.48,
  heroin: 0.54,
  pills: 0.39,
  meth: 0.76,
  hash: 0.3,
  opioids: 0.46,
  peyote: 0.7,
};
const PRICE_CEILING: Partial<Record<ProductId, number>> = {
  coke: 100000,
  heroin: 100000,
};

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

export function accrueHeat(currentHeat: number, exposure: number): number {
  const heat = clamp(Math.round(currentHeat), 0, 100);
  const pressure = Math.max(0, exposure);
  const acceleration = 0.5 + 1.5 * (heat / 100) ** 2;
  return clamp(heat + Math.round(pressure * acceleration), 0, 100);
}

export interface HeatFactors {
  transactionValue?: number;
  gunPurchase?: boolean;
  failedEscape?: boolean;
  policeShootout?: boolean;
  policeKilled?: number;
}

export function heatAfterExposure(
  currentHeat: number,
  factors: HeatFactors,
): number {
  const transactionValue = Math.max(0, factors.transactionValue ?? 0);
  let exposure = clamp(
    Math.round(Math.log10(1 + transactionValue / 1000) * 4),
    0,
    24,
  );
  if (factors.gunPurchase) exposure += 4;
  if (factors.failedEscape) exposure += 14;
  if (factors.policeShootout) exposure += 12;
  exposure += Math.max(0, Math.floor(factors.policeKilled ?? 0)) * 18;
  return accrueHeat(currentHeat, exposure);
}

export function heatAfterTrade(
  currentHeat: number,
  transactionValue: number,
): number {
  return heatAfterExposure(currentHeat, { transactionValue });
}

export function heatAfterLayingLow(currentHeat: number): number {
  const heat = clamp(Math.round(currentHeat), 0, 100);
  const reduction = Math.round(4 + (100 - heat) * 0.24);
  return Math.max(0, heat - reduction);
}

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

function withOutcome(
  state: GameState,
  kind: PendingOutcome["kind"],
  title: string,
  message: string,
  nextPhase: PendingOutcome["nextPhase"] = state.phase === "gameover"
    ? "gameover"
    : "market",
): GameState {
  return addLog(
    {
      ...state,
      phase: "outcome",
      pendingEncounter:
        nextPhase === "encounter" ? state.pendingEncounter : undefined,
      pendingLoanSharkEncounter: undefined,
      pendingNotices: undefined,
      noticeReturnPhase: undefined,
      pendingOutcome: { kind, title, message, nextPhase },
    },
    message,
  );
}

function presentNotices(state: GameState): GameState {
  if (!state.pendingNotices?.length) {
    return {
      ...state,
      pendingNotices: undefined,
      noticeReturnPhase: undefined,
    };
  }
  if (
    state.phase !== "market" &&
    state.phase !== "encounter" &&
    state.phase !== "loan-shark"
  )
    return state;
  return {
    ...state,
    noticeReturnPhase: state.phase,
    phase: "notice",
  };
}

function continueNotice(state: GameState): GameState {
  if (state.phase !== "notice" || !state.pendingNotices?.length)
    return invalid(state, "there is no notice to continue from");
  const remaining = state.pendingNotices.slice(1);
  if (remaining.length) return { ...state, pendingNotices: remaining };
  return {
    ...state,
    phase: state.noticeReturnPhase ?? "market",
    pendingNotices: undefined,
    noticeReturnPhase: undefined,
  };
}

function addLedgerNote(
  states: Record<BoroughId, BoroughState>,
  id: BoroughId,
  note: string,
): Record<BoroughId, BoroughState> {
  const old = states[id];
  const notes = [
    note,
    ...old.ledger.notes.filter((entry) => entry !== note),
  ].slice(0, 8);
  return {
    ...states,
    [id]: { ...old, ledger: { ...old.ledger, notes } },
  };
}

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
    const centeredNoise =
      unit(hashSeed(seed, day, BOROUGH_INDEX[id], PRODUCT_INDEX[p.id], 31)) *
        2 -
      1;
    const spread = PRODUCT_VOLATILITY[p.id] * (0.65 + profile.volatility * 2.4);
    const noise = Math.exp(centeredNoise * spread);
    const roleBias =
      0.89 +
      unit(hashSeed(seed, PRODUCT_INDEX[p.id], BOROUGH_INDEX[id], 77)) * 0.27;
    const conditionMultiplier =
      local?.productId === p.id ? local.multiplier : 1;
    const rawPrice =
      p.base * profile.bias * roleBias * noise * conditionMultiplier;
    prices[p.id] = money(
      Math.min(rawPrice, PRICE_CEILING[p.id] ?? Number.POSITIVE_INFINITY),
    );
    const listingRoll = unit(
      hashSeed(seed, day, BOROUGH_INDEX[id], PRODUCT_INDEX[p.id], 43),
    );
    if (listingRoll < profile.listing) available.push(p.id);
  }
  // A shock is always actionable; sparse borough listings must not hide it.
  if (local && !available.includes(local.productId))
    available.push(local.productId);
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
  if (day === 1) return undefined;
  const roll = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 202));
  if (roll > 0.38) return undefined;
  const index = hashSeed(seed, day, BOROUGH_INDEX[id], 203) % PRODUCTS.length;
  const p = PRODUCTS[index];
  const favorable = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 204)) > 0.45;
  const magnitude = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 206));
  return {
    id: `${id}-${day}-${p.id}`,
    label: favorable
      ? `A seizure has tightened ${p.name} supply here.`
      : `A shipment has flooded the ${p.name} market.`,
    productId: p.id,
    multiplier: favorable ? 2.8 + magnitude * 3.2 : 0.1 + magnitude * 0.22,
    enforcementDelta: favorable ? 0.12 : 0.03,
    daysLeft: 2 + (hashSeed(seed, day, BOROUGH_INDEX[id], 205) % 3),
  };
}

function addTravelNotice(state: GameState): GameState {
  const seen = state.travelEventsSeen ?? [];
  const jellyDay = 3 + (hashSeed(state.seed, 601) % 7);
  let notice: PendingNotice | undefined;
  let states = state.boroughs;
  let eventId: string | undefined;

  if (!seen.includes("jelly-baby") && state.day >= jellyDay) {
    eventId = "jelly-baby";
    notice = {
      kind: "travel",
      title: "On the subway",
      message:
        'An old lady on the subway says, "Would you like a jelly, baby?"',
    };
  } else {
    const roll = unit(
      hashSeed(state.seed, state.day, BOROUGH_INDEX[state.current], 602),
    );
    if (roll > 0.46) return state;
    const selector = unit(
      hashSeed(state.seed, state.day, BOROUGH_INDEX[state.current], 603),
    );
    if (state.debt > LOAN_SHARK_CREDIT_LIMIT && selector < 0.38) {
      notice = {
        kind: "travel",
        title: "The same black car",
        message:
          "A black car keeps pace with the train. The loan shark has not forgotten you.",
      };
      states = addLedgerNote(
        states,
        state.current,
        `Day ${state.day}: Signs of loan-shark pressure on this route.`,
      );
    } else if (state.heat >= 35 && selector < 0.72) {
      notice = {
        kind: "travel",
        title: "Too much attention",
        message:
          "Two people on the platform stop talking when they see you. Your route is getting familiar.",
      };
      states = addLedgerNote(
        states,
        state.current,
        `Day ${state.day}: The route showed signs of police attention.`,
      );
    } else {
      const ordered = [...BOROUGHS].sort(
        (a, b) =>
          unit(hashSeed(state.seed, state.day, BOROUGH_INDEX[a.id], 604)) -
          unit(hashSeed(state.seed, state.day, BOROUGH_INDEX[b.id], 604)),
      );
      const hinted = ordered
        .map((candidate) => ({
          borough: candidate,
          condition: state.boroughs[candidate.id].condition
            ? undefined
            : eventFor(state.seed, state.day + 1, candidate.id),
        }))
        .find((candidate) => candidate.condition);
      if (hinted?.condition) {
        const message = `A contact expects this tomorrow in ${hinted.borough.name}: ${hinted.condition.label}`;
        notice = { kind: "travel", title: "A useful whisper", message };
        states = addLedgerNote(
          states,
          hinted.borough.id,
          `Day ${state.day}: ${message}`,
        );
      } else {
        notice = {
          kind: "travel",
          title: "Nothing useful",
          message:
            "A stranger hands you a matchbook with a phone number inside. The number is disconnected.",
        };
      }
    }
  }

  if (!notice) return state;
  const updated = {
    ...state,
    boroughs: states,
    travelEventsSeen: eventId ? [...seen, eventId] : seen,
    pendingNotices: [notice, ...(state.pendingNotices ?? [])],
  };
  return addLog(updated, `TRAVEL: ${notice.message}`);
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
  const generated = states[destination].condition
    ? undefined
    : eventFor(state.seed, day, destination);
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
  if (generated)
    states = addLedgerNote(
      states,
      destination,
      `Day ${day}: ${generated.label}`,
    );
  let next: GameState = {
    ...state,
    day,
    current: destination,
    boroughs: states,
    market,
    phase: "market",
    pendingEncounter: undefined,
    pendingLoanSharkEncounter: undefined,
    pendingNotices: generated
      ? [
          {
            kind: "market",
            title: "The market moved",
            message: generated.label,
          },
        ]
      : undefined,
    noticeReturnPhase: undefined,
    pendingOutcome: undefined,
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
    weapons: [],
    capacity: COAT_CAPACITIES[0],
    inventory: emptyInventory(),
    storage: emptyInventory(),
    boroughs: boroughMap(),
    travelEventsSeen: [],
    market: null as unknown as MarketSnapshot,
    phase: "market" as Phase,
    log: [
      `You chose ${BOROUGHS.find((b) => b.id === home)?.name}. Day 1 begins.`,
    ],
  };
  const first = arrive(base, home, 1);
  return presentNotices(
    addLog(
      first,
      "Your contact says: information is worth more than a lucky buy.",
    ),
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
    return invalid(state, "your coat is full");
  const price = state.market.prices[id];
  const cost = q * price;
  if (cost > state.cash) return invalid(state, "you do not have enough cash");
  const inventory = cloneInventory(state.inventory);
  const item = inventory[id];
  item.avgCost = (item.quantity * item.avgCost + cost) / (item.quantity + q);
  item.quantity += q;
  return addLog(
    {
      ...state,
      cash: state.cash - cost,
      inventory,
      heat: heatAfterTrade(state.heat, cost),
    },
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
    {
      ...state,
      cash: state.cash + proceeds,
      inventory,
      heat: heatAfterTrade(state.heat, proceeds),
    },
    `Sold ${q} ${productName(id)} for $${proceeds.toLocaleString()}.`,
  );
}

function storageInventory(state: GameState): Inventory {
  return state.storage ?? emptyInventory();
}

function transferStorage(
  state: GameState,
  id: ProductId,
  quantity: number,
  direction: "store" | "retrieve",
): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  if (state.current !== "staten")
    return invalid(state, "the storage unit is on Staten Island");
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  const inventory = cloneInventory(state.inventory);
  const storage = cloneInventory(storageInventory(state));
  const source = direction === "store" ? inventory[id] : storage[id];
  const target = direction === "store" ? storage[id] : inventory[id];
  if (q > source.quantity)
    return invalid(
      state,
      direction === "store"
        ? `you only carry ${source.quantity} ${productName(id)}`
        : `only ${source.quantity} ${productName(id)} is in storage`,
    );
  if (
    direction === "retrieve" &&
    totalCargo(state.inventory) + q > state.capacity
  )
    return invalid(state, "your coat is full");
  const movedCost = source.avgCost;
  target.avgCost =
    (target.quantity * target.avgCost + q * movedCost) / (target.quantity + q);
  target.quantity += q;
  source.quantity -= q;
  if (source.quantity === 0) source.avgCost = 0;
  return addLog(
    { ...state, inventory, storage },
    direction === "store"
      ? `Stored ${q} ${productName(id)} on Staten Island.`
      : `Retrieved ${q} ${productName(id)} from storage.`,
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
    if (a > state.cash)
      return invalid(state, "the bank cannot deposit money you do not have");
    return addLog(
      { ...state, cash: state.cash - a, bank: state.bank + a },
      `Deposited $${a.toLocaleString()} at home.`,
    );
  }
  if (type === "withdraw") {
    if (a > state.bank)
      return invalid(
        state,
        "the bank will not hand over money it does not hold",
      );
    return addLog(
      { ...state, cash: state.cash + a, bank: state.bank - a },
      `Withdrew $${a.toLocaleString()} from the bank.`,
    );
  }
  if (type === "borrow") {
    const available = Math.max(0, LOAN_SHARK_CREDIT_LIMIT - state.debt);
    if (a > available)
      return invalid(
        state,
        available > 0
          ? `the loan shark taps the ledger; only ${cashForLog(available)} is available`
          : `the loan shark laughs; get the debt below ${cashForLog(LOAN_SHARK_CREDIT_LIMIT)} before asking again`,
      );
    return withOutcome(
      { ...state, cash: state.cash + a, debt: state.debt + a },
      "loan-shark",
      "Money changed hands.",
      `The loan shark advanced $${a.toLocaleString()}.`,
    );
  }
  if (a > state.debt)
    return invalid(state, "the loan shark will not accept imaginary debt");
  if (a > state.cash)
    return invalid(state, "the loan shark wants cash you actually have");
  return withOutcome(
    { ...state, cash: state.cash - a, debt: state.debt - a },
    "loan-shark",
    "Debt reduced.",
    `Repaid $${a.toLocaleString()} of debt.`,
  );
}

function buyGun(state: GameState, gunId?: GunId): GameState {
  if (state.phase !== "market")
    return invalid(
      state,
      "the gear contact is unavailable during an encounter",
    );
  if (state.current !== "bronx")
    return invalid(state, "guns are available only in The Bronx");
  const owned = weaponIds(state);
  if (state.guns >= MAX_GUNS || owned.length >= MAX_GUNS)
    return invalid(state, `you can carry only ${MAX_GUNS} guns`);
  const gun = gunId
    ? GUN_CATALOG.find((candidate) => candidate.id === gunId)
    : GUN_CATALOG.find((candidate) => !owned.includes(candidate.id));
  if (!gun) return invalid(state, "that gun is not available");
  if (owned.includes(gun.id))
    return invalid(state, `you already carry a ${gun.name}`);
  if (state.cash < gun.price)
    return invalid(state, `${gun.name} costs ${cashForLog(gun.price)}`);
  return addLog(
    {
      ...state,
      cash: state.cash - gun.price,
      guns: state.guns + 1,
      weapons: [...owned, gun.id],
      heat: heatAfterExposure(state.heat, { gunPurchase: true }),
    },
    `Bought a ${gun.name} for ${cashForLog(gun.price)}. Keep it quiet.`,
  );
}
const cashForLog = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

export function fenceValue(state: GameState): number {
  return Math.floor(
    PRODUCTS.reduce(
      (total, item) =>
        total +
        state.inventory[item.id].quantity * state.market.prices[item.id],
      0,
    ) * 0.7,
  );
}

export function localServiceError(
  state: GameState,
  serviceId: LocalServiceId = LOCAL_SERVICES[state.current].id,
): string | undefined {
  if (state.phase !== "market") return "Finish the current encounter first.";
  if (serviceId === "fence") {
    if (state.current !== "staten") return "The fence is on Staten Island.";
    if (totalCargo(state.inventory) < 1) return "Your coat is empty.";
    return undefined;
  }
  const offer = LOCAL_SERVICES[state.current];
  if (offer.id !== serviceId) return "That service is not available here.";
  if (offer.id === "coat-maker" && state.capacity >= MAX_COAT_CAPACITY)
    return "The coat you have is already the largest one available.";
  if (offer.id === "clinic" && state.health >= 100)
    return "The clinic cannot improve perfect health.";
  if (offer.id === "arms-dealer" && state.guns >= MAX_GUNS)
    return `You can carry only ${MAX_GUNS} guns.`;
  if (offer.days > 0 && state.day + offer.days > 30)
    return `There are not ${offer.days} days left in the run.`;
  if (state.cash < offer.cost)
    return `You need ${cashForLog(offer.cost)} in cash.`;
  return undefined;
}

function useLocalService(state: GameState): GameState {
  const error = localServiceError(state);
  if (error) return invalid(state, error.toLowerCase());
  const offer = LOCAL_SERVICES[state.current];
  if (offer.id === "coat-maker") {
    const capacity = nextCoatCapacity(state.capacity);
    if (!capacity) return invalid(state, "your coat cannot be enlarged again");
    return addLog(
      {
        ...state,
        cash: state.cash - offer.cost,
        capacity,
      },
      `The coat factory enlarged your coat to ${capacity} spaces for ${cashForLog(offer.cost)}.`,
    );
  }
  if (offer.id === "clinic")
    return presentNotices(
      addLog(
        arrive(
          applyInterest({
            ...state,
            cash: state.cash - offer.cost,
            health: 100,
          }),
          state.current,
          state.day + offer.days,
        ),
        `The clinic restored your health for ${cashForLog(offer.cost)} and took one day.`,
      ),
    );
  if (offer.id === "arms-dealer")
    return invalid(state, "choose a gun from the shop's catalog");
  if (offer.id === "storage-unit")
    return invalid(state, "choose stock to store or retrieve");
  if (offer.id === "plastic-surgeon") {
    let next: GameState = {
      ...state,
      cash: state.cash - offer.cost,
      heat: 0,
    };
    for (let day = 0; day < offer.days; day++)
      next = arrive(applyInterest(next), next.current, next.day + 1);
    return presentNotices(
      addLog(
        next,
        `Plastic surgery cost ${cashForLog(offer.cost)} and ${offer.days} days. Your heat is gone.`,
      ),
    );
  }
  return state;
}

function useFence(state: GameState): GameState {
  const error = localServiceError(state, "fence");
  if (error) return invalid(state, error.toLowerCase());
  const proceeds = fenceValue(state);
  return addLog(
    {
      ...state,
      cash: state.cash + proceeds,
      inventory: emptyInventory(),
      heat: heatAfterTrade(state.heat, proceeds),
    },
    `The fence bought everything in your coat for ${cashForLog(proceeds)}.`,
  );
}
const LOAN_SHARK_ENFORCER_DEBT = 25000;
const LOAN_SHARK_ENFORCER_CHANCE = 0.3;

function nextRandom(state: GameState): [number, number] {
  let x = state.rng >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return [unit(x), x];
}

function applyInterest(state: GameState): GameState {
  const debtRate = state.debt > LOAN_SHARK_ENFORCER_DEBT ? 0.11 : 0.06;
  return {
    ...state,
    bank: Math.floor(state.bank * 1.005),
    debt: Math.ceil(state.debt * (1 + debtRate)),
  };
}

/** Police attention is heat-gated; route and cargo can only modify that signal. */
export function policeEncounterChance(
  heat: number,
  routePressure: number,
  cargoWorth: number,
): number {
  const normalizedHeat = clamp(Math.round(heat), 0, 100) / 100;
  const heatRisk = 0.002 + 0.798 * normalizedHeat ** 2.2;
  const cargoPressure = clamp(
    Math.log10(1 + Math.max(0, cargoWorth) / 10_000) * 0.05,
    0,
    0.2,
  );
  const context = clamp(0.75 + routePressure + cargoPressure, 0.8, 1.35);
  return clamp(heatRisk * context, 0, 0.9);
}

export function policeOfficerRange(heat: number): {
  min: number;
  max: number;
} {
  const level = clamp(Math.round(heat), 0, 100);
  return {
    min: clamp(1 + Math.floor(level / 25), 1, 5),
    max: clamp(2 + Math.floor(level / 10), 2, 12),
  };
}

function encounterChance(state: GameState, destination: BoroughId): number {
  const profile = BOROUGH_PROFILE[destination];
  const localDelta =
    borough(state, destination).condition?.enforcementDelta ?? 0;
  return policeEncounterChance(
    state.heat,
    profile.route + borough(state, destination).enforcement + localDelta,
    cargoValue(state),
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
  const arrival = addTravelNotice(
    arrive(
      applyInterest(state),
      destination,
      day,
      `You traveled from ${BOROUGHS.find((b) => b.id === state.current)?.name}.`,
    ),
  );
  const [roll, rng] = nextRandom(arrival);
  const chance = encounterChance(arrival, destination);
  const withRng = { ...arrival, rng };
  if (roll < chance) {
    const officerRange = policeOfficerRange(withRng.heat);
    const [officerRoll, encounterRng] = nextRandom(withRng);
    const officers =
      officerRange.min +
      Math.floor(officerRoll * (officerRange.max - officerRange.min + 1));
    return presentNotices(
      addLog(
        {
          ...withRng,
          rng: encounterRng,
          phase: "encounter",
          pendingEncounter: {
            destination,
            routeRisk: chance,
            cargoValue: cargoValue(withRng),
            officers,
          },
        },
        `POLICE: patrols have noticed your route. Choose escape or fight.`,
      ),
    );
  }
  if (withRng.debt > LOAN_SHARK_ENFORCER_DEBT) {
    const [enforcerRoll, enforcerRng] = nextRandom(withRng);
    const checked = { ...withRng, rng: enforcerRng };
    if (enforcerRoll < LOAN_SHARK_ENFORCER_CHANCE)
      return presentNotices(
        addLog(
          {
            ...checked,
            phase: "loan-shark",
            pendingLoanSharkEncounter: { destination },
          },
          "LOAN SHARK: the enforcers found you.",
        ),
      );
    return presentNotices(addLog(checked, "The route is quiet."));
  }
  return presentNotices(addLog(withRng, "The route is quiet."));
}

function resolveEncounter(
  state: GameState,
  choice: "escape" | "fight",
): GameState {
  if (state.phase !== "encounter" || !state.pendingEncounter)
    return invalid(state, "there is no encounter to resolve");
  const [roll, rng] = nextRandom(state);
  const encounter = state.pendingEncounter;
  const officers = Math.max(1, encounter.officers ?? 1);
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
    const [dropRoll, escapeRng] = nextRandom({ ...state, rng });
    const [dropChoiceRoll, finalRng] = nextRandom({
      ...state,
      rng: escapeRng,
    });
    const droppedGun = state.guns > 0 && dropRoll < 0.18;
    const owned = weaponIds(state);
    const droppedIndex = droppedGun
      ? Math.min(owned.length - 1, Math.floor(dropChoiceRoll * owned.length))
      : -1;
    const droppedWeapon = droppedIndex >= 0 ? owned[droppedIndex] : undefined;
    const droppedName = droppedWeapon
      ? GUN_CATALOG.find((gun) => gun.id === droppedWeapon)?.name
      : undefined;
    const remainingWeapons = droppedGun
      ? owned.filter((_, index) => index !== droppedIndex)
      : state.weapons;
    const droppedLabel = droppedName ? `your ${droppedName}` : "a gun";
    if (roll < chance) {
      return withOutcome(
        {
          ...state,
          rng: finalRng,
          guns: droppedGun ? state.guns - 1 : state.guns,
          weapons: remainingWeapons,
          phase: "market",
          pendingEncounter: undefined,
          heat: clamp(state.heat - 6, 0, 100),
        },
        "police",
        "You got away.",
        droppedGun
          ? `You slipped the patrol, but dropped ${droppedLabel} while running.`
          : "You slipped the patrol. Keep moving.",
      );
    }
    const inventory = cloneInventory(state.inventory);
    const carriedStock = totalCargo(state.inventory);
    for (const p of PRODUCTS)
      inventory[p.id].quantity = Math.floor(inventory[p.id].quantity * 0.72);
    const next = {
      ...state,
      rng: finalRng,
      guns: droppedGun ? state.guns - 1 : state.guns,
      weapons: remainingWeapons,
      inventory,
      phase: "encounter" as Phase,
      heat: heatAfterExposure(state.heat, { failedEscape: true }),
      health: Math.max(0, state.health - 18),
    };
    if (next.health <= 0) {
      const ended = endGame(next, "You were hurt escaping the patrol.");
      return withOutcome(
        ended,
        "police",
        "They wasted you!!!",
        "You were hurt escaping the patrol.",
      );
    }
    return withOutcome(
      next,
      "police",
      "You couldn't lose them.",
      `${
        carriedStock > 0
          ? "You dropped some of your stock and took a hit."
          : "You took a hit."
      }${
        droppedGun ? ` You dropped ${droppedLabel} while running.` : ""
      } ${officers} ${
        officers === 1 ? "officer is" : "officers are"
      } still chasing you.`,
      "encounter",
    );
  }
  const chance = policeFightSuccessChance(state.guns, state.health);
  if (roll < chance) {
    const remaining = officers - 1;
    const next = {
      ...state,
      rng,
      phase: (remaining > 0 ? "encounter" : "market") as Phase,
      pendingEncounter:
        remaining > 0 ? { ...encounter, officers: remaining } : undefined,
      heat: heatAfterExposure(state.heat, {
        policeShootout: true,
        policeKilled: 1,
      }),
    };
    if (remaining === 0)
      return withOutcome(
        next,
        "police",
        "You broke through.",
        "The last officer is down. The way ahead is clear.",
      );
    return withOutcome(
      next,
      "police",
      "You got one.",
      `${remaining} ${
        remaining === 1 ? "officer is" : "officers are"
      } still chasing you.`,
      "encounter",
    );
  }
  const inventory = cloneInventory(state.inventory);
  const carriedStock = totalCargo(state.inventory);
  for (const p of PRODUCTS)
    inventory[p.id].quantity = Math.floor(inventory[p.id].quantity * 0.5);
  const next = {
    ...state,
    rng,
    inventory,
    phase: "encounter" as Phase,
    heat: heatAfterExposure(state.heat, { policeShootout: true }),
    health: Math.max(0, state.health - 38),
  };
  if (next.health <= 0) {
    const ended = endGame(next, "The fight went badly.");
    return withOutcome(
      ended,
      "police",
      "They wasted you!!!",
      "The fight went badly.",
    );
  }
  return withOutcome(
    next,
    "police",
    "The patrol won the exchange.",
    `${carriedStock > 0 ? "Half your stock is gone and you are hurt." : "You are hurt."} ${officers} ${
      officers === 1 ? "officer is" : "officers are"
    } still chasing you.`,
    "encounter",
  );
}

function resolveLoanSharkEncounter(state: GameState): GameState {
  if (state.phase !== "loan-shark" || !state.pendingLoanSharkEncounter)
    return invalid(state, "the loan shark's enforcers are not here");
  const [roll, rng] = nextRandom(state);
  const healthLoss = 40 + Math.floor(roll * 31);
  const cashLost = state.cash;
  const next: GameState = {
    ...state,
    rng,
    cash: 0,
    health: Math.max(0, state.health - healthLoss),
    phase: "market",
    pendingLoanSharkEncounter: undefined,
  };
  const message = `The enforcers beat you, took ${cashForLog(
    cashLost,
  )}, and cost you ${healthLoss} health.`;
  if (next.health <= 0) {
    const ended = endGame(next, "The loan shark's enforcers beat you.");
    return withOutcome(ended, "loan-shark", "They wasted you!!!", message);
  }
  return withOutcome(next, "loan-shark", "They made their point.", message);
}

function continueOutcome(state: GameState): GameState {
  if (state.phase !== "outcome" || !state.pendingOutcome)
    return invalid(state, "there is no outcome to continue from");
  return {
    ...state,
    phase: state.pendingOutcome.nextPhase,
    pendingEncounter:
      state.pendingOutcome.nextPhase === "encounter"
        ? state.pendingEncounter
        : undefined,
    pendingOutcome: undefined,
  };
}

function settle(state: GameState, reason = "Thirty days complete."): GameState {
  const storage = storageInventory(state);
  const liquidation = PRODUCTS.reduce(
    (n, p) =>
      n +
      (state.inventory[p.id].quantity + storage[p.id].quantity) *
        state.market.prices[p.id] *
        0.72,
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
    {
      ...state,
      phase: "gameover",
      score,
      inventory: emptyInventory(),
      storage: emptyInventory(),
    },
    `SETTLED: remaining stock liquidated at 72%. Final score $${value.toLocaleString()}.`,
  );
}
function endGame(state: GameState, reason: string): GameState {
  const value = Math.round(state.cash + state.bank - state.debt);
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
        heat: heatAfterLayingLow(state.heat),
      },
      "You laid low on Day 30.",
    );
  const next = arrive(
    applyInterest({
      ...state,
      health: clamp(state.health + 22, 0, 100),
      heat: heatAfterLayingLow(state.heat),
    }),
    state.current,
    state.day + 1,
    "You lay low. The city forgets you a little.",
  );
  return presentNotices(addLog(next, "Health recovered and heat cooled."));
}

export function applyAction(state: GameState, action: Action): GameState {
  if (action.type === "continue-notice") return continueNotice(state);
  if (action.type === "continue") return continueOutcome(state);
  if (state.phase === "notice") return state;
  if (state.phase === "outcome") return state;
  if (state.phase === "gameover") return invalid(state, "this run is over");
  switch (action.type) {
    case "buy":
      return buy(state, action.product, action.quantity);
    case "sell":
      return sell(state, action.product, action.quantity);
    case "store":
      return transferStorage(state, action.product, action.quantity, "store");
    case "retrieve":
      return transferStorage(
        state,
        action.product,
        action.quantity,
        "retrieve",
      );
    case "deposit":
    case "withdraw":
    case "borrow":
    case "repay":
      return service(state, action.type, action.amount);
    case "buy-gun":
      return buyGun(state, action.gun);
    case "use-local-service":
      return useLocalService(state);
    case "use-fence":
      return useFence(state);
    case "travel":
      return travel(state, action.destination);
    case "lay-low":
      return layLow(state);
    case "resolve-encounter":
      return resolveEncounter(state, action.choice);
    case "resolve-loan-shark":
      return resolveLoanSharkEncounter(state);
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
export function storedUnits(state: GameState): number {
  return totalCargo(storageInventory(state));
}
export function currentBorough(state: GameState): BoroughState {
  return state.boroughs[state.current];
}
