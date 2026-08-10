/** Pure, serializable rules for the 30-day borough trading game. */

import FIRST_NAMES from "./firstNames.json";

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
  | "fence"
  | "contact";
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
export const POLICE_GUN_KILL_CHANCE = 2 / 3;
export const COAT_OFFERS = [
  { capacity: 21, price: 1000 },
  { capacity: 34, price: 2000 },
  { capacity: 55, price: 3000 },
  { capacity: 89, price: 5000 },
] as const;
export const COAT_CAPACITIES = [
  10,
  ...COAT_OFFERS.map((offer) => offer.capacity),
] as const;
export const MAX_COAT_CAPACITY = COAT_CAPACITIES.at(-1) ?? 89;

export function nextCoatCapacity(currentCapacity: number): number | undefined {
  return COAT_CAPACITIES.find((capacity) => capacity > currentCapacity);
}

export function nextCoatOffer(currentCapacity: number) {
  return COAT_OFFERS.find((offer) => offer.capacity > currentCapacity);
}

const CLINIC_SERVICE: LocalServiceOffer = {
  id: "clinic",
  directoryName: "Clinic",
  label: "Visit clinic",
  title: "Private treatment",
  description:
    "Treatment costs $1,500, takes one day, and restores your health.",
  confirmLabel: "Get treatment",
  cost: 1500,
  days: 1,
};
const PLASTIC_SURGEON_SERVICE: LocalServiceOffer = {
  id: "plastic-surgeon",
  directoryName: "Plastic surgeon",
  label: "Visit plastic surgeon",
  title: "A new face",
  description:
    "A new face costs $200,000 and takes three days. Your heat and notoriety will fall to zero.",
  confirmLabel: "Proceed",
  cost: 200000,
  days: 3,
};
const COAT_SERVICE: LocalServiceOffer = {
  id: "coat-maker",
  directoryName: "Coat factory",
  label: "Visit coat factory",
  title: "Coat factory",
  description: "Buy the next larger coat.",
  confirmLabel: "Buy",
  cost: 0,
  days: 0,
};
const GUN_SERVICE: LocalServiceOffer = {
  id: "arms-dealer",
  directoryName: "Guns",
  label: "Visit gun shop",
  title: "Gun shop",
  description: "Six models are available, while you have room to carry one.",
  confirmLabel: "Choose a gun",
  cost: 0,
  days: 0,
};
const STORAGE_SERVICE: LocalServiceOffer = {
  id: "storage-unit",
  directoryName: "Storage",
  label: "Visit storage unit",
  title: "Storage unit",
  description: "A local unit holds 200 items and costs $200 for each game day.",
  confirmLabel: "Manage storage",
  cost: 0,
  days: 0,
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
export const LOCAL_SERVICES: Record<BoroughId, LocalServiceOffer[]> = {
  manhattan: [CLINIC_SERVICE, PLASTIC_SURGEON_SERVICE],
  brooklyn: [PLASTIC_SURGEON_SERVICE, STORAGE_SERVICE],
  queens: [COAT_SERVICE, STORAGE_SERVICE],
  bronx: [GUN_SERVICE, CLINIC_SERVICE],
  staten: [FENCE_SERVICE, STORAGE_SERVICE],
};

export function boroughServiceNames(
  id: BoroughId,
  home: BoroughId,
  contacts: Contact[] = [],
): string[] {
  const names = id === home ? ["Bank", "Loan shark"] : [];
  names.push(...LOCAL_SERVICES[id].map((service) => service.directoryName));
  const contact = contacts.find((candidate) => candidate.borough === id);
  if (contact) names.push(contact.name);
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
export interface FieldNote {
  id: string;
  day: number;
  sequence: number;
  borough?: BoroughId;
  kind: "market" | "rumor" | "contact" | "contact-result" | "storage";
  message: string;
  relatedId?: string;
}
export interface ContactForecast {
  id: string;
  contactId: string;
  borough: BoroughId;
  productId: ProductId;
  createdDay: number;
  targetDay: number;
  direction: "up" | "down";
  actualDirection: "up" | "down";
  resolved: boolean;
}
export interface Contact {
  id: string;
  name: string;
  borough: BoroughId;
  reliability: number;
  lastConsultedVisit: number;
}
export interface ContactCandidate {
  id: string;
  name: string;
  reliability: number;
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
  stage?: "choice" | "police-fire";
  /** Effective heat at encounter creation; later kills must not improve aim. */
  effectiveHeat?: number;
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
  kind: "police" | "loan-shark" | "contact" | "storage";
  title: string;
  message: string;
  nextPhase: "market" | "encounter" | "gameover";
  buttonLabel?: "Continue" | "Game over";
  followUp?: Omit<PendingOutcome, "followUp">;
}
export interface Score {
  name: string;
  value: number;
  day: number;
  reason: string;
  date: string;
  home: BoroughId;
  officersKilled: number;
}
export type StorageBoroughId = "brooklyn" | "queens" | "staten";
export interface StorageUnit {
  active: boolean;
  inventory: Inventory;
  lateSinceDay?: number;
}
export type StorageUnits = Record<StorageBoroughId, StorageUnit>;
export interface DailyTradeLedger {
  day: number;
  grossValue: number;
  grossByProduct: Record<ProductId, number>;
  rawExposureApplied: number;
  quantityByProduct: Record<ProductId, number>;
  premiumTierByProduct: Partial<Record<ProductId, 1 | 2>>;
}
export interface GameState {
  version: 2;
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
  heatFloor: number;
  officersKilled: number;
  notorietyKills: number;
  guns: number;
  weapons: GunId[];
  capacity: number;
  inventory: Inventory;
  storageUnits: StorageUnits;
  dailyTrades: DailyTradeLedger;
  loanRate: number;
  loanGraceUntilDay: number;
  loanPremiumPressure: boolean;
  contacts: Contact[];
  contactCandidates: ContactCandidate[];
  forecasts: ContactForecast[];
  fieldNotes: FieldNote[];
  noteSequence: number;
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
  | { type: "loan-more-time" }
  | { type: "buy-gun"; gun?: GunId }
  | { type: "use-local-service"; service: LocalServiceId }
  | { type: "use-fence" }
  | { type: "rent-storage" }
  | { type: "close-storage" }
  | { type: "consult-contact" }
  | { type: "travel"; destination: BoroughId }
  | { type: "lay-low" }
  | { type: "resolve-encounter"; choice: "escape" | "fight" | "give-up" }
  | { type: "resolve-police-fire" }
  | { type: "resolve-loan-shark" }
  | { type: "continue-notice" }
  | { type: "continue" }
  | { type: "finish-day" };

export const BANK_DAILY_RATE = 0.005;
export const LOAN_DAILY_RATE = 0.06;
export const LOAN_RATE_PENALTY = 1.5;
export const REPEAT_LOAN_ADVANCE = 25_000;
export const REPEAT_LOAN_DEBT = 40_000;
export const STORAGE_CAPACITY = 200;
export const STORAGE_DAILY_RENT = 200;
export const NOTORIETY_PER_KILL = 12;

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
/** Durable borough spreads make ordinary route knowledge economically useful. */
const PRODUCT_BOROUGH_BIAS: Record<BoroughId, Record<ProductId, number>> = {
  manhattan: {
    green: 1.2,
    acid: 1.27,
    shrooms: 1.18,
    speed: 1.22,
    molly: 1.35,
    coke: 1.32,
    heroin: 1.28,
    pills: 1.2,
    meth: 1.2,
    hash: 1.22,
    opioids: 1.25,
    peyote: 1.2,
  },
  brooklyn: {
    green: 1,
    acid: 1.12,
    shrooms: 1.04,
    speed: 1,
    molly: 1.24,
    coke: 1.04,
    heroin: 1.02,
    pills: 1.02,
    meth: 1.03,
    hash: 0.98,
    opioids: 1.03,
    peyote: 1.05,
  },
  queens: {
    green: 0.92,
    acid: 0.94,
    shrooms: 0.96,
    speed: 0.9,
    molly: 0.96,
    coke: 0.78,
    heroin: 0.82,
    pills: 0.91,
    meth: 0.86,
    hash: 0.9,
    opioids: 0.9,
    peyote: 0.96,
  },
  bronx: {
    green: 0.8,
    acid: 0.91,
    shrooms: 0.88,
    speed: 0.78,
    molly: 0.94,
    coke: 0.91,
    heroin: 0.9,
    pills: 0.72,
    meth: 0.82,
    hash: 0.81,
    opioids: 0.74,
    peyote: 0.89,
  },
  staten: {
    green: 1.06,
    acid: 1.16,
    shrooms: 1.28,
    speed: 1.08,
    molly: 1.12,
    coke: 1.14,
    heroin: 1.2,
    pills: 1.1,
    meth: 1.18,
    hash: 1.08,
    opioids: 1.14,
    peyote: 1.38,
  },
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
const STORAGE_BOROUGHS: StorageBoroughId[] = ["brooklyn", "queens", "staten"];
const emptyStorageUnits = (): StorageUnits =>
  Object.fromEntries(
    STORAGE_BOROUGHS.map((id) => [
      id,
      { active: false, inventory: emptyInventory() },
    ]),
  ) as StorageUnits;
const emptyQuantityLedger = (): Record<ProductId, number> =>
  Object.fromEntries(PRODUCTS.map((item) => [item.id, 0])) as Record<
    ProductId,
    number
  >;
const emptyDailyTrades = (day: number): DailyTradeLedger => ({
  day,
  grossValue: 0,
  grossByProduct: emptyQuantityLedger(),
  rawExposureApplied: 0,
  quantityByProduct: emptyQuantityLedger(),
  premiumTierByProduct: {},
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

function makeContactCandidates(seed: number): ContactCandidate[] {
  const names: string[] = [];
  let cursor = hashSeed(seed, 0xc07ac7);
  while (names.length < 3) {
    cursor = hashSeed(cursor, names.length, 0x51a7);
    const name = FIRST_NAMES[cursor % FIRST_NAMES.length];
    if (!names.includes(name)) names.push(name);
  }
  const middleReliability = 0.5 + unit(hashSeed(seed, 0x5e1f)) * (0.95 - 0.5);
  const reliabilities = [0.5, 0.95, middleReliability].sort(
    (a, b) =>
      unit(hashSeed(seed, Math.round(a * 10_000), 0xa5516e)) -
      unit(hashSeed(seed, Math.round(b * 10_000), 0xa5516e)),
  );
  return names.map((name, index) => ({
    id: `contact-${index + 1}`,
    name,
    reliability: reliabilities[index],
  }));
}

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
  if (factors.gunPurchase) exposure += 20;
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

export function heatAfterLayingLow(currentHeat: number, heatFloor = 0): number {
  const heat = clamp(Math.round(currentHeat), 0, 100);
  const reduction = Math.round(4 + (100 - heat) * 0.24);
  return Math.max(clamp(Math.round(heatFloor), 0, 100), heat - reduction);
}

export function effectiveHeat(heat: number, destination: BoroughId): number {
  return clamp(
    Math.round(destination === "manhattan" ? heat * 2 : heat),
    0,
    100,
  );
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

function addFieldNote(
  state: GameState,
  kind: FieldNote["kind"],
  message: string,
  boroughId?: BoroughId,
  relatedId?: string,
  day = state.day,
): GameState {
  const sequence = state.noteSequence + 1;
  return {
    ...state,
    noteSequence: sequence,
    fieldNotes: [
      {
        id: `note-${day}-${sequence}`,
        day,
        sequence,
        borough: boroughId,
        kind,
        message,
        relatedId,
      },
      ...state.fieldNotes,
    ].slice(0, 120),
  };
}

function developContact(state: GameState, id: BoroughId): GameState {
  if (state.contacts.length >= 3) return state;
  if (state.contacts.some((contact) => contact.borough === id)) return state;
  const visits = state.boroughs[id].ledger.visits;
  if (visits < 3) return state;
  const candidate = state.contactCandidates[state.contacts.length];
  if (!candidate) return state;
  const contact: Contact = {
    ...candidate,
    borough: id,
    lastConsultedVisit: 0,
  };
  const name = BOROUGHS.find((entry) => entry.id === id)?.name ?? id;
  return addFieldNote(
    { ...state, contacts: [...state.contacts, contact] },
    "contact",
    `${candidate.name} is now a contact in ${name}.`,
    id,
    candidate.id,
  );
}

function resolveDueForecasts(state: GameState): GameState {
  const due = state.forecasts.filter(
    (forecast) => !forecast.resolved && forecast.targetDay <= state.day,
  );
  if (!due.length) return state;
  let next: GameState = {
    ...state,
    forecasts: state.forecasts.map((forecast) =>
      due.some((item) => item.id === forecast.id)
        ? { ...forecast, resolved: true }
        : forecast,
    ),
  };
  for (const forecast of due) {
    const contact = next.contacts.find(
      (candidate) => candidate.id === forecast.contactId,
    );
    const correct = forecast.direction === forecast.actualDirection;
    next = addFieldNote(
      next,
      "contact-result",
      `${contact?.name ?? "Your contact"}'s ${productName(forecast.productId)} forecast for Day ${forecast.targetDay} was ${correct ? "right" : "wrong"}.`,
      forecast.borough,
      forecast.id,
    );
  }
  return next;
}

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
    const durableSpread = PRODUCT_BOROUGH_BIAS[id][p.id];
    const conditionMultiplier =
      local?.productId === p.id ? local.multiplier : 1;
    const rawPrice =
      p.base * profile.bias * durableSpread * noise * conditionMultiplier;
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
      ? `A seizure tightens ${p.name} supply here.`
      : `A shipment floods the ${p.name} market.`,
    productId: p.id,
    multiplier: favorable ? 2.8 + magnitude * 3.2 : 0.1 + magnitude * 0.22,
    enforcementDelta: favorable ? 0.12 : 0.03,
    daysLeft: 2 + (hashSeed(seed, day, BOROUGH_INDEX[id], 205) % 3),
  };
}

function projectedCondition(
  state: GameState,
  targetDay: number,
  id: BoroughId,
): LocalCondition | undefined {
  let condition = state.boroughs[id].condition;
  for (let day = state.day + 1; day <= targetDay; day++) {
    if (condition && condition.daysLeft <= 1) condition = undefined;
    else if (condition)
      condition = { ...condition, daysLeft: condition.daysLeft - 1 };
    if (!condition) condition = eventFor(state.seed, day, id);
  }
  return condition;
}

function addTravelNotice(state: GameState): GameState {
  const seen = state.travelEventsSeen ?? [];
  const jellyDay = 3 + (hashSeed(state.seed, 601) % 7);
  let notice: PendingNotice | undefined;
  let states = state.boroughs;
  let eventId: string | undefined;
  let noteBorough: BoroughId | undefined;

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
    if (
      state.debt > 0 &&
      state.day > state.loanGraceUntilDay &&
      selector < 0.38
    ) {
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
        .find(
          (candidate) =>
            candidate.condition &&
            candidate.condition.productId !== "coke" &&
            candidate.condition.productId !== "heroin",
        );
      if (hinted?.condition) {
        const message = `A rumor says this happens tomorrow in ${hinted.borough.name}: ${hinted.condition.label}`;
        notice = { kind: "travel", title: "A useful whisper", message };
        noteBorough = hinted.borough.id;
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
  const noted = noteBorough
    ? addFieldNote(updated, "rumor", notice.message, noteBorough)
    : updated;
  return addLog(noted, `TRAVEL: ${notice.message}`);
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
  countVisit: boolean,
): Record<BoroughId, BoroughState> {
  const old = states[market.borough];
  const observations = { ...old.ledger.observations };
  for (const id of market.listed)
    observations[id] = { day, price: market.prices[id] };
  return {
    ...states,
    [market.borough]: {
      ...old,
      familiarity: countVisit
        ? Math.min(6, old.familiarity + 1)
        : old.familiarity,
      ledger: {
        ...old.ledger,
        visits: old.ledger.visits + (countVisit ? 1 : 0),
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
  countVisit = true,
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
  states = observe(states, market, day, countVisit);
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
    dailyTrades:
      state.dailyTrades.day === day ? state.dailyTrades : emptyDailyTrades(day),
    phase: "market",
    pendingEncounter: undefined,
    pendingLoanSharkEncounter: undefined,
    pendingNotices: [
      ...(state.pendingNotices ?? []),
      ...(generated
        ? [
            {
              kind: "market" as const,
              title: "The market moved",
              message: generated.label,
            },
          ]
        : []),
    ],
    noticeReturnPhase: undefined,
    pendingOutcome: undefined,
  };
  if (!next.pendingNotices?.length) next.pendingNotices = undefined;
  next = developContact(next, destination);
  next = resolveDueForecasts(next);
  if (generated) {
    next = addFieldNote(next, "market", generated.label, destination);
    next = addLog(next, `MARKET: ${generated.label}`);
  }
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
    version: 2 as const,
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
    heatFloor: 0,
    officersKilled: 0,
    notorietyKills: 0,
    guns: 0,
    weapons: [],
    capacity: COAT_CAPACITIES[0],
    inventory: emptyInventory(),
    storageUnits: emptyStorageUnits(),
    dailyTrades: emptyDailyTrades(1),
    loanRate: LOAN_DAILY_RATE,
    loanGraceUntilDay: 5,
    loanPremiumPressure: false,
    contacts: [],
    contactCandidates: makeContactCandidates(seed),
    forecasts: [],
    fieldNotes: [],
    noteSequence: 0,
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

function applyTradeExposure(
  state: GameState,
  id: ProductId,
  quantity: number,
  value: number,
): Pick<GameState, "heat" | "dailyTrades" | "loanPremiumPressure"> {
  const ledger =
    state.dailyTrades.day === state.day
      ? state.dailyTrades
      : emptyDailyTrades(state.day);
  const quantityByProduct = {
    ...ledger.quantityByProduct,
    [id]: ledger.quantityByProduct[id] + quantity,
  };
  const grossByProduct = {
    ...ledger.grossByProduct,
    [id]: ledger.grossByProduct[id] + value,
  };
  const grossValue = ledger.grossValue + value;
  const desiredRawExposure = clamp(
    Math.round(Math.log10(1 + grossValue / 10_000) * 3),
    0,
    18,
  );
  const incrementalRawExposure = Math.max(
    0,
    desiredRawExposure - ledger.rawExposureApplied,
  );
  let heat = accrueHeat(state.heat, incrementalRawExposure);
  const premium = id === "coke" || id === "heroin";
  const oldTier = ledger.premiumTierByProduct[id] ?? 0;
  let newTier: 0 | 1 | 2 = oldTier;
  if (premium && (quantityByProduct[id] >= 25 || grossByProduct[id] >= 500_000))
    newTier = 2;
  else if (premium && quantityByProduct[id] > 10) newTier = 1;
  if (newTier === 2 && oldTier < 2) heat = 100;
  else if (newTier === 1 && oldTier < 1) {
    const premiumHeat =
      30 + (hashSeed(state.seed, state.day, PRODUCT_INDEX[id], 0x4ea7) % 21);
    heat = clamp(heat + premiumHeat, 0, 100);
  }
  return {
    heat,
    loanPremiumPressure:
      state.loanPremiumPressure ||
      grossValue > 100_000 ||
      (premium && quantityByProduct[id] > 10),
    dailyTrades: {
      ...ledger,
      grossValue,
      grossByProduct,
      rawExposureApplied: desiredRawExposure,
      quantityByProduct,
      premiumTierByProduct: {
        ...ledger.premiumTierByProduct,
        ...(newTier > 0 ? { [id]: newTier } : {}),
      },
    },
  };
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
  const exposure = applyTradeExposure(state, id, q, cost);
  return addLog(
    {
      ...state,
      cash: state.cash - cost,
      inventory,
      ...exposure,
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
  const exposure = applyTradeExposure(state, id, q, proceeds);
  return addLog(
    {
      ...state,
      cash: state.cash + proceeds,
      inventory,
      ...exposure,
    },
    `Sold ${q} ${productName(id)} for $${proceeds.toLocaleString()}.`,
  );
}

export function isStorageBorough(id: BoroughId): id is StorageBoroughId {
  return STORAGE_BOROUGHS.includes(id as StorageBoroughId);
}

export function storageUnitAt(
  state: GameState,
  id: StorageBoroughId,
): StorageUnit {
  return state.storageUnits[id];
}

function transferStorage(
  state: GameState,
  id: ProductId,
  quantity: number,
  direction: "store" | "retrieve",
): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const unit = storageUnitAt(state, state.current);
  if (!unit.active) return invalid(state, "rent the storage unit first");
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  const inventory = cloneInventory(state.inventory);
  const storage = cloneInventory(unit.inventory);
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
  if (direction === "store" && totalCargo(storage) + q > STORAGE_CAPACITY)
    return invalid(state, "the storage unit is full");
  const movedCost = source.avgCost;
  target.avgCost =
    (target.quantity * target.avgCost + q * movedCost) / (target.quantity + q);
  target.quantity += q;
  source.quantity -= q;
  if (source.quantity === 0) source.avgCost = 0;
  return addLog(
    {
      ...state,
      inventory,
      storageUnits: {
        ...state.storageUnits,
        [state.current]: { ...unit, inventory: storage },
      },
    },
    direction === "store"
      ? `Stored ${q} ${productName(id)} in ${BOROUGHS.find((item) => item.id === state.current)?.name}.`
      : `Retrieved ${q} ${productName(id)} from storage.`,
  );
}

function rentStorage(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const unit = storageUnitAt(state, state.current);
  if (unit.active) return invalid(state, "you already rent this unit");
  if (state.cash < STORAGE_DAILY_RENT)
    return invalid(state, `you need ${cashForLog(STORAGE_DAILY_RENT)} in cash`);
  const name = BOROUGHS.find((item) => item.id === state.current)?.name;
  return addLog(
    addFieldNote(
      {
        ...state,
        cash: state.cash - STORAGE_DAILY_RENT,
        storageUnits: {
          ...state.storageUnits,
          [state.current]: { ...unit, active: true, lateSinceDay: undefined },
        },
      },
      "storage",
      `Rented a 200-space storage unit in ${name} for $200 per day.`,
      state.current,
    ),
    `Rented storage in ${name}.`,
  );
}

function closeStorage(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const unit = storageUnitAt(state, state.current);
  if (!unit.active) return invalid(state, "you do not rent this unit");
  if (totalCargo(unit.inventory) > 0)
    return invalid(state, "empty the unit before closing it");
  return addLog(
    {
      ...state,
      storageUnits: {
        ...state.storageUnits,
        [state.current]: { ...unit, active: false, lateSinceDay: undefined },
      },
    },
    "Closed the empty storage unit.",
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
    if (state.debt > 0) {
      const loanRate = state.loanRate * LOAN_RATE_PENALTY;
      return withOutcome(
        { ...state, loanRate },
        "loan-shark",
        `“I don't wanna see you again without my money...”`,
        `The vig is now ${(loanRate * 100).toFixed(1)}% per day.`,
      );
    }
    return withOutcome(
      {
        ...state,
        cash: state.cash + REPEAT_LOAN_ADVANCE,
        debt: REPEAT_LOAN_DEBT,
        loanRate: LOAN_DAILY_RATE,
        loanGraceUntilDay: state.day + 4,
        loanPremiumPressure: false,
      },
      "loan-shark",
      `“You have 5 days.”`,
      `The loan shark advances ${cashForLog(REPEAT_LOAN_ADVANCE)}.`,
    );
  }
  if (a > state.debt)
    return invalid(state, "the loan shark will not accept imaginary debt");
  if (a > state.cash)
    return invalid(state, "the loan shark wants cash you actually have");
  const cashAfterPayment = state.cash - a;
  const debtAfterPayment = state.debt - a;
  if (debtAfterPayment === 0)
    return withOutcome(
      {
        ...state,
        cash: cashAfterPayment,
        debt: 0,
        loanRate: LOAN_DAILY_RATE,
        loanPremiumPressure: false,
      },
      "loan-shark",
      `“Okay, ${state.name}. This account is closed.”`,
      "You have paid off your debt.",
    );
  if (cashAfterPayment > 0) {
    const [detectionRoll, detectionRng] = nextRandom(state);
    if (detectionRoll < 0.5) {
      const [damageRoll, damageRng] = nextRandom({
        ...state,
        rng: detectionRng,
      });
      const healthLoss = 10 + Math.floor(damageRoll * 21);
      const extraCredit = Math.min(debtAfterPayment, cashAfterPayment);
      const debt = Math.max(0, debtAfterPayment - extraCredit);
      const punished: GameState = {
        ...state,
        rng: damageRng,
        cash: 0,
        debt,
        health: Math.max(0, state.health - healthLoss),
        loanRate: debt === 0 ? LOAN_DAILY_RATE : state.loanRate,
        loanPremiumPressure: debt === 0 ? false : state.loanPremiumPressure,
      };
      const message =
        `The loan shark spots the cash you held back. His men f***ed you up and took ${cashForLog(cashAfterPayment)}. ` +
        `${cashForLog(extraCredit)} is credited toward your debt. You lost ${healthLoss} health.`;
      if (punished.health <= 0) {
        const ended = endGame(punished, "The loan shark's men killed you.");
        const result = withOutcome(
          ended,
          "loan-shark",
          "He sees the cash.",
          message,
          "gameover",
        );
        return {
          ...result,
          pendingOutcome: result.pendingOutcome
            ? {
                ...result.pendingOutcome,
                nextPhase: "gameover",
                followUp: {
                  kind: "loan-shark",
                  title: "They wasted you!!!",
                  message: "The beating kills you.",
                  nextPhase: "gameover",
                  buttonLabel: "Game over",
                },
              }
            : undefined,
        };
      }
      return withOutcome(punished, "loan-shark", "He sees the cash.", message);
    }
    return withOutcome(
      {
        ...state,
        rng: detectionRng,
        cash: cashAfterPayment,
        debt: debtAfterPayment,
      },
      "loan-shark",
      `“Thank you. I will consider this a token of good faith.”`,
      `“I don't wanna see you again without my money...”`,
    );
  }
  return withOutcome(
    { ...state, cash: 0, debt: debtAfterPayment },
    "loan-shark",
    `“Thank you. I will consider this a token of good faith.”`,
    `“I don't wanna see you again without my money...”`,
  );
}

function askLoanSharkForMoreTime(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  if (state.current !== state.home)
    return invalid(state, "the loan shark only deals at home");
  const [damageRoll, rng] = nextRandom(state);
  const healthLoss = 10 + Math.floor(damageRoll * 21);
  const cashLost = state.cash;
  const punished: GameState = {
    ...state,
    rng,
    cash: 0,
    health: Math.max(0, state.health - healthLoss),
  };
  const message =
    `The loan shark's men f***ed you up and took ${cashForLog(cashLost)}. ` +
    `None of it is credited toward your debt. You lost ${healthLoss} health.`;
  if (punished.health <= 0) {
    const ended = endGame(punished, "The loan shark's men killed you.");
    const result = withOutcome(
      ended,
      "loan-shark",
      "That was the wrong answer.",
      message,
      "gameover",
    );
    return {
      ...result,
      pendingOutcome: result.pendingOutcome
        ? {
            ...result.pendingOutcome,
            followUp: {
              kind: "loan-shark",
              title: "They wasted you!!!",
              message: "The beating kills you.",
              nextPhase: "gameover",
              buttonLabel: "Game over",
            },
          }
        : undefined,
    };
  }
  return withOutcome(
    punished,
    "loan-shark",
    "That was the wrong answer.",
    message,
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
  serviceId: LocalServiceId,
): string | undefined {
  if (state.phase !== "market") return "Finish the current encounter first.";
  if (serviceId === "fence") {
    if (state.current !== "staten") return "The fence is on Staten Island.";
    if (totalCargo(state.inventory) < 1) return "Your coat is empty.";
    return undefined;
  }
  const offer = LOCAL_SERVICES[state.current].find(
    (candidate) => candidate.id === serviceId,
  );
  if (!offer) return "That service is not available here.";
  if (offer.id === "coat-maker" && state.capacity >= MAX_COAT_CAPACITY)
    return "The coat you have is already the largest one available.";
  if (offer.id === "clinic" && state.health >= 100)
    return "The clinic cannot improve perfect health.";
  if (offer.id === "arms-dealer" && state.guns >= MAX_GUNS)
    return `You can carry only ${MAX_GUNS} guns.`;
  if (offer.days > 0 && state.day + offer.days > 30)
    return `There are not ${offer.days} days left in the run.`;
  const cost =
    offer.id === "coat-maker"
      ? (nextCoatOffer(state.capacity)?.price ?? 0)
      : offer.cost;
  if (state.cash < cost) return `You need ${cashForLog(cost)} in cash.`;
  return undefined;
}

function useLocalService(
  state: GameState,
  serviceId: LocalServiceId,
): GameState {
  const error = localServiceError(state, serviceId);
  if (error) return invalid(state, error.toLowerCase());
  const offer = LOCAL_SERVICES[state.current].find(
    (candidate) => candidate.id === serviceId,
  );
  if (!offer) return invalid(state, "that service is not available here");
  if (offer.id === "coat-maker") {
    const coat = nextCoatOffer(state.capacity);
    if (!coat) return invalid(state, "your coat cannot be enlarged again");
    return addLog(
      {
        ...state,
        cash: state.cash - coat.price,
        capacity: coat.capacity,
      },
      `Bought a ${coat.capacity}-space coat for ${cashForLog(coat.price)}.`,
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
          undefined,
          false,
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
      heatFloor: 0,
      notorietyKills: 0,
    };
    for (let day = 0; day < offer.days; day++)
      next = arrive(
        applyInterest(next),
        next.current,
        next.day + 1,
        undefined,
        false,
      );
    return presentNotices(
      addLog(
        next,
        `Plastic surgery cost ${cashForLog(offer.cost)} and ${offer.days} days. Your heat and notoriety are gone.`,
      ),
    );
  }
  return state;
}

function useFence(state: GameState): GameState {
  const error = localServiceError(state, "fence");
  if (error) return invalid(state, error.toLowerCase());
  const proceeds = fenceValue(state);
  let exposureState = state;
  for (const item of PRODUCTS) {
    const quantity = state.inventory[item.id].quantity;
    if (quantity < 1) continue;
    const value = Math.floor(quantity * state.market.prices[item.id] * 0.7);
    const exposure = applyTradeExposure(
      exposureState,
      item.id,
      quantity,
      value,
    );
    exposureState = { ...exposureState, ...exposure };
  }
  return addLog(
    {
      ...state,
      cash: state.cash + proceeds,
      inventory: emptyInventory(),
      heat: exposureState.heat,
      dailyTrades: exposureState.dailyTrades,
      loanPremiumPressure: exposureState.loanPremiumPressure,
    },
    `The fence bought everything in your coat for ${cashForLog(proceeds)}.`,
  );
}

function consultContact(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  const contact = state.contacts.find(
    (candidate) => candidate.borough === state.current,
  );
  if (!contact) return invalid(state, "you do not have a contact here");
  const visits = state.boroughs[state.current].ledger.visits;
  if (contact.lastConsultedVisit === visits)
    return invalid(state, `${contact.name} has told you everything for now`);
  if (state.day + 2 > 30)
    return invalid(
      state,
      "there is not enough time left for a useful forecast",
    );

  const [countRoll, firstRng] = nextRandom(state);
  const count = 1 + Math.floor(countRoll * 4);
  const selected = [...PRODUCTS]
    .sort(
      (a, b) =>
        unit(hashSeed(firstRng, state.day, PRODUCT_INDEX[a.id], 0xf04e)) -
        unit(hashSeed(firstRng, state.day, PRODUCT_INDEX[b.id], 0xf04e)),
    )
    .slice(0, count);
  const targetDay = state.day + 2;
  let rng = firstRng;
  const forecasts: ContactForecast[] = [];
  for (const item of selected) {
    // Forecast the market the player will actually reach, including shocks that
    // begin tomorrow and survive into the target day.
    const futureCondition = projectedCondition(state, targetDay, state.current);
    const future = makeMarket(
      state.seed,
      targetDay,
      state.current,
      futureCondition,
    ).prices[item.id];
    const actualDirection: ContactForecast["actualDirection"] =
      future >= state.market.prices[item.id] ? "up" : "down";
    const [accuracyRoll, nextRng] = nextRandom({ ...state, rng });
    rng = nextRng;
    const direction =
      accuracyRoll < contact.reliability
        ? actualDirection
        : actualDirection === "up"
          ? "down"
          : "up";
    forecasts.push({
      id: `${contact.id}-${state.day}-${item.id}`,
      contactId: contact.id,
      borough: state.current,
      productId: item.id,
      createdDay: state.day,
      targetDay,
      direction,
      actualDirection,
      resolved: false,
    });
  }

  let next: GameState = {
    ...state,
    rng,
    contacts: state.contacts.map((candidate) =>
      candidate.id === contact.id
        ? { ...candidate, lastConsultedVisit: visits }
        : candidate,
    ),
    forecasts: [...state.forecasts, ...forecasts],
  };
  for (const forecast of forecasts) {
    const direction = forecast.direction === "up" ? "higher" : "lower";
    next = addFieldNote(
      next,
      "contact",
      `${contact.name} expects ${productName(forecast.productId)} to be ${direction} here on Day ${targetDay}.`,
      state.current,
      forecast.id,
    );
  }
  const message = forecasts
    .map(
      (forecast) =>
        `${productName(forecast.productId)}: ${forecast.direction === "up" ? "higher" : "lower"} on Day ${targetDay}.`,
    )
    .join("\n");
  return withOutcome(
    next,
    "contact",
    `${contact.name} has ${count === 1 ? "one forecast" : `${count} forecasts`}.`,
    message,
  );
}
function nextRandom(state: GameState): [number, number] {
  let x = state.rng >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return [unit(x), x];
}

function applyInterest(state: GameState): GameState {
  const nextDay = state.day + 1;
  let next: GameState = {
    ...state,
    bank: Math.floor(state.bank * (1 + BANK_DAILY_RATE)),
    debt: state.debt > 0 ? Math.ceil(state.debt * (1 + state.loanRate)) : 0,
  };
  for (const id of STORAGE_BOROUGHS) {
    const unit = next.storageUnits[id];
    if (!unit.active) continue;
    const name = BOROUGHS.find((borough) => borough.id === id)?.name ?? id;
    if (unit.lateSinceDay !== undefined) {
      if (next.cash >= STORAGE_DAILY_RENT) {
        next = {
          ...next,
          cash: next.cash - STORAGE_DAILY_RENT,
          storageUnits: {
            ...next.storageUnits,
            [id]: { ...unit, lateSinceDay: undefined },
          },
        };
      } else {
        const lost = totalCargo(unit.inventory);
        const message = `The ${name} storage unit is liquidated for unpaid rent. ${lost} ${lost === 1 ? "item is" : "items are"} gone.`;
        next = addFieldNote(
          {
            ...next,
            storageUnits: {
              ...next.storageUnits,
              [id]: {
                active: false,
                inventory: emptyInventory(),
              },
            },
            pendingNotices: [
              ...(next.pendingNotices ?? []),
              { kind: "market", title: "Storage liquidated", message },
            ],
          },
          "storage",
          message,
          id,
          undefined,
          nextDay,
        );
      }
      continue;
    }
    if (next.cash >= STORAGE_DAILY_RENT) {
      next = { ...next, cash: next.cash - STORAGE_DAILY_RENT };
      continue;
    }
    const message =
      `You have a voicemail from the ${name} storage location. ` +
      "Your rent is late. If you don't pay by tomorrow, your storage unit will be liquidated.";
    next = addFieldNote(
      {
        ...next,
        storageUnits: {
          ...next.storageUnits,
          [id]: { ...unit, lateSinceDay: nextDay },
        },
        pendingNotices: [
          ...(next.pendingNotices ?? []),
          { kind: "market", title: "Voicemail", message },
        ],
      },
      "storage",
      message,
      id,
      undefined,
      nextDay,
    );
  }
  return next;
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
    effectiveHeat(state.heat, destination),
    profile.route + borough(state, destination).enforcement + localDelta,
    cargoValue(state),
  );
}

export function loanSharkEncounterChance(
  state: GameState,
  destination: BoroughId,
): number {
  if (state.debt <= 0 || state.day <= state.loanGraceUntilDay) return 0;
  if (state.loanPremiumPressure) return destination === state.home ? 0.5 : 0.2;
  return destination === state.home ? 0.25 : 0.1;
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
  const enforcerChance = loanSharkEncounterChance(arrival, destination);
  const [enforcerRoll, enforcerRng] = nextRandom(arrival);
  const afterEnforcerCheck = { ...arrival, rng: enforcerRng };
  if (enforcerRoll < enforcerChance)
    return presentNotices(
      addLog(
        {
          ...afterEnforcerCheck,
          phase: "loan-shark",
          pendingLoanSharkEncounter: { destination },
        },
        "LOAN SHARK: the enforcers found you.",
      ),
    );

  const [roll, rng] = nextRandom(afterEnforcerCheck);
  const chance = encounterChance(afterEnforcerCheck, destination);
  const withRng = { ...afterEnforcerCheck, rng };
  if (roll < chance) {
    const officerRange = policeOfficerRange(
      effectiveHeat(withRng.heat, destination),
    );
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
            stage: "choice",
            effectiveHeat: effectiveHeat(withRng.heat, destination),
          },
        },
        `POLICE: patrols have noticed your route. Choose escape or fight.`,
      ),
    );
  }
  return presentNotices(addLog(withRng, "The route is quiet."));
}

function resolveEncounter(
  state: GameState,
  choice: "escape" | "fight" | "give-up",
): GameState {
  if (state.phase !== "encounter" || !state.pendingEncounter)
    return invalid(state, "there is no encounter to resolve");
  const encounter = state.pendingEncounter;
  if ((encounter.stage ?? "choice") !== "choice")
    return invalid(state, "the police are firing");
  const officers = Math.max(1, encounter.officers ?? 1);
  if (choice === "fight" && state.guns < 1)
    return invalid(state, "you have no guns; run or give up");
  if (choice === "escape") {
    const [roll, rng] = nextRandom(state);
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
          heat: Math.max(state.heatFloor, state.heat - 6),
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
      pendingEncounter: { ...encounter, stage: "police-fire" as const },
    };
    return withOutcome(
      next,
      "police",
      "You couldn't lose them.",
      `${
        carriedStock > 0
          ? "You dropped some of your stock."
          : "They are still behind you."
      }${
        droppedGun ? ` You dropped ${droppedLabel} while running.` : ""
      } ${officers} ${
        officers === 1 ? "officer is" : "officers are"
      } still chasing you.`,
      "encounter",
    );
  }
  if (choice === "give-up") {
    const pressure =
      encounter.effectiveHeat ??
      effectiveHeat(state.heat, encounter.destination);
    if (pressure < 33) {
      const clean = totalCargo(state.inventory) === 0 && state.guns === 0;
      const searched = clean
        ? state
        : endGame(state, "You were arrested by the police.");
      const result = withOutcome(
        searched,
        "police",
        "You give up.",
        "You are detained by the police. They search your coat...",
        clean ? "market" : "gameover",
      );
      return {
        ...result,
        pendingOutcome: result.pendingOutcome
          ? {
              ...result.pendingOutcome,
              followUp: {
                kind: "police",
                title: clean ? "You're clean!" : "Oh no!",
                message: clean ? "They let you go." : "You are under arrest!",
                nextPhase: clean ? "market" : "gameover",
                buttonLabel: clean ? "Continue" : "Game over",
              },
            }
          : undefined,
      };
    }
    return withOutcome(
      {
        ...state,
        pendingEncounter: { ...encounter, stage: "police-fire" },
      },
      "police",
      "You give up.",
      "You stand there looking like an idiot.",
      "encounter",
    );
  }

  let rng = state.rng;
  let kills = 0;
  for (let gun = 0; gun < state.guns; gun++) {
    const [roll, nextRng] = nextRandom({ ...state, rng });
    rng = nextRng;
    if (roll < POLICE_GUN_KILL_CHANCE) kills += 1;
  }
  kills = Math.min(officers, kills);
  const remaining = officers - kills;
  const notorietyKills = state.notorietyKills + kills;
  const heatFloor = Math.min(90, notorietyKills * NOTORIETY_PER_KILL);
  const next: GameState = {
    ...state,
    rng,
    officersKilled: state.officersKilled + kills,
    notorietyKills,
    heatFloor,
    heat: Math.max(
      heatFloor,
      heatAfterExposure(state.heat, {
        policeShootout: true,
        policeKilled: kills,
      }),
    ),
    pendingEncounter:
      remaining > 0
        ? { ...encounter, officers: remaining, stage: "police-fire" }
        : undefined,
  };
  if (remaining === 0)
    return withOutcome(
      next,
      "police",
      kills === 1 ? "You got the last one." : `You got all ${kills}.`,
      "The way ahead is clear.",
    );
  return withOutcome(
    next,
    "police",
    kills === 0
      ? "You missed."
      : kills === 1
        ? "You got one."
        : `You got ${kills}.`,
    `${remaining} ${
      remaining === 1 ? "officer is" : "officers are"
    } still chasing you.`,
    "encounter",
  );
}

function resolvePoliceFire(state: GameState): GameState {
  if (state.phase !== "encounter" || !state.pendingEncounter)
    return invalid(state, "there is no encounter to resolve");
  const encounter = state.pendingEncounter;
  if (encounter.stage !== "police-fire")
    return invalid(state, "the police are waiting for your move");
  const officers = Math.max(1, encounter.officers ?? 1);
  const pressure =
    encounter.effectiveHeat ?? effectiveHeat(state.heat, encounter.destination);
  const hitChance = clamp(
    0.18 + officers * 0.055 + pressure * 0.003,
    0.22,
    0.9,
  );
  const [hitRoll, hitRng] = nextRandom(state);
  const choiceEncounter = { ...encounter, stage: "choice" as const };
  if (hitRoll >= hitChance)
    return withOutcome(
      { ...state, rng: hitRng, pendingEncounter: choiceEncounter },
      "police",
      "They miss.",
      "Bullets go past you.",
      "encounter",
    );
  const [damageRoll, rng] = nextRandom({ ...state, rng: hitRng });
  const healthLoss = 10 + Math.floor(damageRoll * 21);
  const hit: GameState = {
    ...state,
    rng,
    health: Math.max(0, state.health - healthLoss),
    pendingEncounter: choiceEncounter,
  };
  const message = `They hit you. You lose ${healthLoss} health.`;
  if (hit.health <= 0) {
    const ended = endGame(hit, "The police shot you.");
    const result = withOutcome(
      ended,
      "police",
      "They hit you.",
      message,
      "gameover",
    );
    return {
      ...result,
      pendingOutcome: result.pendingOutcome
        ? {
            ...result.pendingOutcome,
            followUp: {
              kind: "police",
              title: "They wasted you!!!",
              message: "You die from the gunshot.",
              nextPhase: "gameover",
              buttonLabel: "Game over",
            },
          }
        : undefined,
    };
  }
  return withOutcome(hit, "police", "They hit you.", message, "encounter");
}

function resolveLoanSharkEncounter(state: GameState): GameState {
  if (state.phase !== "loan-shark" || !state.pendingLoanSharkEncounter)
    return invalid(state, "the loan shark's enforcers are not here");
  const [roll, rng] = nextRandom(state);
  const healthLoss = 25 + Math.floor(roll * 51);
  const cashLost = state.cash;
  const gunsLost = state.guns;
  const next: GameState = {
    ...state,
    rng,
    cash: 0,
    guns: 0,
    weapons: [],
    inventory: emptyInventory(),
    capacity: COAT_CAPACITIES[0],
    health: Math.max(0, state.health - healthLoss),
    phase: "market",
    pendingLoanSharkEncounter: undefined,
  };
  const message =
    "The loan shark's enforcers f***ed you up and relieved you of your cash and coat. " +
    `You lost ${cashForLog(cashLost)} and ${gunsLost} ${gunsLost === 1 ? "gun" : "guns"}. ` +
    `You lost ${healthLoss} health.`;
  if (next.health <= 0) {
    const ended = endGame(next, "The loan shark's enforcers beat you.");
    const result = withOutcome(
      ended,
      "loan-shark",
      "They made their point.",
      message,
      "gameover",
    );
    return {
      ...result,
      pendingOutcome: result.pendingOutcome
        ? {
            ...result.pendingOutcome,
            followUp: {
              kind: "loan-shark",
              title: "They wasted you!!!",
              message: "The beating kills you.",
              nextPhase: "gameover",
              buttonLabel: "Game over",
            },
          }
        : undefined,
    };
  }
  return withOutcome(next, "loan-shark", "They made their point.", message);
}

function continueOutcome(state: GameState): GameState {
  if (state.phase !== "outcome" || !state.pendingOutcome)
    return invalid(state, "there is no outcome to continue from");
  if (state.pendingOutcome.followUp)
    return {
      ...state,
      phase: "outcome",
      pendingOutcome: state.pendingOutcome.followUp,
    };
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

function settle(state: GameState, reason = "Day 30 settled."): GameState {
  const value = Math.round(state.cash + state.bank - state.debt);
  const score: Score = {
    name: state.name,
    value,
    day: state.day,
    reason,
    date: "",
    home: state.home,
    officersKilled: state.officersKilled,
  };
  return addLog(
    {
      ...state,
      phase: "gameover",
      score,
    },
    `SETTLED: final net worth ${cashForLog(value)}. Unsold stock is worthless.`,
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
        date: "",
        home: state.home,
        officersKilled: state.officersKilled,
      },
    },
    `GAME OVER: ${reason}`,
  );
}

function layLow(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "you cannot lay low during an encounter");
  if (state.day >= 30) return invalid(state, "Day 30 is for settling up");
  const next = arrive(
    applyInterest({
      ...state,
      health: clamp(state.health + 22, 0, 100),
      heat: heatAfterLayingLow(state.heat, state.heatFloor),
    }),
    state.current,
    state.day + 1,
    "You lay low. The city forgets you a little.",
    false,
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
    case "loan-more-time":
      return askLoanSharkForMoreTime(state);
    case "buy-gun":
      return buyGun(state, action.gun);
    case "use-local-service":
      return useLocalService(state, action.service);
    case "use-fence":
      return useFence(state);
    case "rent-storage":
      return rentStorage(state);
    case "close-storage":
      return closeStorage(state);
    case "consult-contact":
      return consultContact(state);
    case "travel":
      return travel(state, action.destination);
    case "lay-low":
      return layLow(state);
    case "resolve-encounter":
      return resolveEncounter(state, action.choice);
    case "resolve-police-fire":
      return resolvePoliceFire(state);
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
export function storedUnits(state: GameState, id?: StorageBoroughId): number {
  if (id) return totalCargo(state.storageUnits[id].inventory);
  return STORAGE_BOROUGHS.reduce(
    (total, boroughId) =>
      total + totalCargo(state.storageUnits[boroughId].inventory),
    0,
  );
}
export function currentBorough(state: GameState): BoroughState {
  return state.boroughs[state.current];
}
