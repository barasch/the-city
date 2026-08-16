/** Pure, serializable rules for the 30-day borough trading game. */

import FIRST_NAMES from "./firstNames.json";

export const PRODUCTS = [
  {
    id: "pills",
    name: "Pills",
    role: "prescription",
    base: 95,
    color: "#87d9ff",
  },
  {
    id: "speed",
    name: "Speed",
    role: "steady middle",
    base: 189,
    color: "#ffca69",
  },
  {
    id: "green",
    name: "Green",
    role: "staple",
    base: 971,
    color: "#9be564",
  },
  {
    id: "peyote",
    name: "Peyote",
    role: "scarcity",
    base: 796,
    color: "#c8f5a3",
  },
  {
    id: "hash",
    name: "Hash",
    role: "staple",
    base: 1920,
    color: "#b4d18e",
  },
  {
    id: "shrooms",
    name: "Shrooms",
    role: "event-sensitive",
    base: 2545,
    color: "#f0c88a",
  },
  {
    id: "meth",
    name: "Meth",
    role: "volatile",
    base: 4204,
    color: "#e9f27b",
  },
  {
    id: "opioids",
    name: "Opioids",
    role: "prescription",
    base: 8236,
    color: "#a9b7ff",
  },
  {
    id: "acid",
    name: "Acid",
    role: "event-sensitive",
    base: 12503,
    color: "#d6b3ff",
  },
  {
    id: "molly",
    name: "Molly",
    role: "nightlife",
    base: 18746,
    color: "#ff91c8",
  },
  {
    id: "coke",
    name: "Coke",
    role: "import premium",
    base: 30858,
    color: "#dfe8ef",
  },
  {
    id: "heroin",
    name: "Heroin",
    role: "scarce opioid",
    base: 49307,
    color: "#ff8d8d",
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
  { id: "taurus-g3c", name: "Taurus G3C", price: 500, quality: 0.44 / 0.95 },
  {
    id: "sig-p365",
    name: "SIG Sauer P365",
    price: 650,
    quality: 0.51 / 0.95,
  },
  { id: "glock-19", name: "Glock 19", price: 800, quality: 0.58 / 0.95 },
  {
    id: "beretta-92fs",
    name: "Beretta 92FS",
    price: 950,
    quality: 0.66 / 0.95,
  },
  { id: "colt-1911", name: "Colt 1911", price: 1200, quality: 0.73 / 0.95 },
  { id: "colt-python", name: "Colt Python", price: 1500, quality: 1 },
] as const;
export type GunId = (typeof GUN_CATALOG)[number]["id"];
export type GunDefinition = (typeof GUN_CATALOG)[number];
export const MAX_GUNS = 2;
export const MAX_GUNS_FIRED = 2;
export const POLICE_GUN_KILL_CHANCE = 0.95;
export const POLICE_OFFICER_HIT_CHANCE = 0.3;

export function gunKillChance(id: GunId): number {
  const gun = GUN_CATALOG.find((candidate) => candidate.id === id);
  return Math.min(1, POLICE_GUN_KILL_CHANCE * (gun?.quality ?? 0));
}
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
    "A new face costs $200,000 and takes three days. Your heat and accumulated exposure will fall to zero.",
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
  description: "Six models are available. You may carry two guns.",
  confirmLabel: "Choose a gun",
  cost: 0,
  days: 0,
};
const STORAGE_SERVICE: LocalServiceOffer = {
  id: "storage-unit",
  directoryName: "Storage",
  label: "Visit storage unit",
  title: "Storage unit",
  description:
    "Each unit holds 200 units of one product and costs $200 per game day. Rent up to three units at each storage location.",
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
    "The fence will buy your coat inventory or one complete storage unit at a steep discount.",
  confirmLabel: "Choose inventory",
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
  slot: number;
  productId?: ProductId;
  quantity: number;
  avgCost: number;
}
export interface StorageLocation {
  units: StorageUnit[];
  lateSinceDay?: number;
}
export type StorageUnits = Record<StorageBoroughId, StorageLocation>;
export type StorageSource = {
  borough: StorageBoroughId;
  unit: number;
};
export type FenceSource = "coat" | StorageSource;
export interface DailyTradeLedger {
  day: number;
  grossValue: number;
  grossByProduct: Record<ProductId, number>;
  rawExposureApplied: number;
  quantityByProduct: Record<ProductId, number>;
}
export interface GameState {
  version: 3;
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
  heatExposure: number;
  lastHeatIncreaseDay: number;
  officersKilled: number;
  identityKills: number;
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
  | {
      type: "buy-storage";
      borough: StorageBoroughId;
      unit: number;
      product: ProductId;
      quantity: number;
    }
  | { type: "sell"; product: ProductId; quantity: number }
  | {
      type: "sell-storage";
      borough: StorageBoroughId;
      unit: number;
    }
  | { type: "store"; unit: number; product: ProductId; quantity: number }
  | { type: "retrieve"; unit: number; product: ProductId; quantity: number }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "borrow"; amount: number }
  | { type: "repay"; amount: number }
  | { type: "loan-more-time" }
  | { type: "buy-gun"; gun?: GunId }
  | { type: "sell-gun"; gun: GunId }
  | { type: "use-local-service"; service: LocalServiceId }
  | { type: "use-fence"; source: FenceSource }
  | { type: "rent-storage" }
  | { type: "close-storage"; unit: number }
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
export const LOAN_PRESSURE_GROSS_VALUE = 500_000;
export const STORAGE_CAPACITY = 200;
export const STORAGE_DAILY_RENT = 200;
export const MAX_STORAGE_UNITS = 3;
export const STORAGE_LOCAL_BUY_MULTIPLIER = 1.2;
export const STORAGE_REMOTE_BUY_MULTIPLIER = 1.4;
export const TRADE_HEAT_VALUE_SCALE = 25_000;
export const TRADE_HEAT_LOG_MULTIPLIER = 4;
export const GUN_PURCHASE_EXPOSURE = 2;
export const FAILED_ESCAPE_EXPOSURE = 6;
export const POLICE_SHOOTOUT_EXPOSURE = 6;
export const POLICE_KILL_EXPOSURE = 2;

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
  acid: 0.7,
  shrooms: 0.58,
  speed: 0.42,
  molly: 0.62,
  coke: 0.52,
  heroin: 0.58,
  pills: 0.39,
  meth: 0.76,
  hash: 0.3,
  opioids: 0.4,
  peyote: 0.7,
};
/** Fixed market structure; deliberately not exposed in player-facing views. */
const HIGH_VALUE_HOME: Record<BoroughId, ProductId> = {
  manhattan: "acid",
  brooklyn: "molly",
  queens: "coke",
  bronx: "heroin",
  staten: "opioids",
};
/** Durable borough spreads make ordinary route knowledge economically useful. */
const PRODUCT_BOROUGH_BIAS: Record<BoroughId, Record<ProductId, number>> = {
  manhattan: {
    green: 1.2,
    acid: 0.62,
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
    molly: 0.7,
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
    molly: 1,
    coke: 0.76,
    heroin: 0.94,
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
    molly: 1.02,
    coke: 0.91,
    heroin: 0.76,
    pills: 0.72,
    meth: 0.82,
    hash: 0.81,
    opioids: 0.9,
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
    opioids: 0.67,
    peyote: 1.38,
  },
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
    STORAGE_BOROUGHS.map((id) => [id, { units: [] as StorageUnit[] }]),
  ) as unknown as StorageUnits;
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

export function heatCeiling(identityKills: number): number {
  return Math.min(100, 85 + Math.max(0, Math.floor(identityKills)) * 5);
}

export function heatSensitivity(
  cumulativeExposure: number,
  identityKills: number,
): number {
  const exposureEffect = Math.min(0.6, Math.max(0, cumulativeExposure) / 200);
  const violenceEffect = Math.min(
    0.8,
    Math.max(0, Math.floor(identityKills)) * 0.1,
  );
  return 1 + exposureEffect + violenceEffect;
}

export function accrueHeat(
  currentHeat: number,
  rawExposure: number,
  cumulativeExposure = 0,
  identityKills = 0,
): number {
  const heat = clamp(Math.round(currentHeat), 0, 100);
  const pressure = Math.max(0, rawExposure);
  const increase = Math.round(
    pressure * heatSensitivity(cumulativeExposure, identityKills),
  );
  return Math.min(heatCeiling(identityKills), heat + increase);
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
  cumulativeExposure = 0,
  identityKills = 0,
): number {
  const transactionValue = Math.max(0, factors.transactionValue ?? 0);
  let exposure = Math.round(
    Math.log10(1 + transactionValue / TRADE_HEAT_VALUE_SCALE) *
      TRADE_HEAT_LOG_MULTIPLIER,
  );
  if (factors.gunPurchase) exposure += GUN_PURCHASE_EXPOSURE;
  if (factors.failedEscape) exposure += FAILED_ESCAPE_EXPOSURE;
  if (factors.policeShootout) exposure += POLICE_SHOOTOUT_EXPOSURE;
  exposure +=
    Math.max(0, Math.floor(factors.policeKilled ?? 0)) * POLICE_KILL_EXPOSURE;
  return accrueHeat(
    currentHeat,
    exposure,
    cumulativeExposure + exposure,
    identityKills,
  );
}

export function heatAfterTrade(
  currentHeat: number,
  transactionValue: number,
): number {
  return heatAfterExposure(currentHeat, { transactionValue });
}

export function heatAfterElapsedDay(
  currentHeat: number,
  cumulativeExposure = 0,
  identityKills = 0,
): number {
  const heat = clamp(Math.round(currentHeat), 0, 100);
  if (heat === 0) return 0;
  const exposureStickiness = Math.min(
    1.25,
    Math.max(0, cumulativeExposure) / 160,
  );
  const violenceStickiness = Math.min(
    1.4,
    Math.max(0, Math.floor(identityKills)) * 0.35,
  );
  const reduction = Math.max(
    1,
    Math.round(
      (10 + (100 - heat) * 0.1) / (1 + exposureStickiness + violenceStickiness),
    ),
  );
  return Math.max(0, heat - reduction);
}

export function effectiveHeat(heat: number, destination: BoroughId): number {
  return clamp(
    Math.round(destination === "manhattan" ? heat * 1.5 : heat),
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
    prices[p.id] = money(rawPrice);
    const listingRoll = unit(
      hashSeed(seed, day, BOROUGH_INDEX[id], PRODUCT_INDEX[p.id], 43),
    );
    const listingChance = HIGH_VALUE_HOME[id] === p.id ? 0.95 : profile.listing;
    if (listingRoll < listingChance) available.push(p.id);
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
  const homeProduct = HIGH_VALUE_HOME[id];
  const homeGlut = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 208)) < 0.25;
  if (homeGlut) {
    const magnitude = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 206));
    const p = product(homeProduct);
    return {
      id: `home-glut-${id}-${day}-${p.id}`,
      label: `A shipment floods the ${p.name} market.`,
      productId: p.id,
      multiplier: 0.1 + magnitude * 0.22,
      enforcementDelta: 0.03,
      daysLeft: 1,
    };
  }
  const roll = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 202));
  if (roll > 0.18) return undefined;
  const otherProducts = PRODUCTS.filter(
    (product) => product.id !== homeProduct,
  );
  const p =
    otherProducts[
      hashSeed(seed, day, BOROUGH_INDEX[id], 207) % otherProducts.length
    ];
  const directionRoll = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 204));
  const glut = directionRoll < 0.45;
  const magnitude = unit(hashSeed(seed, day, BOROUGH_INDEX[id], 206));
  return {
    id: `${id}-${day}-${p.id}`,
    label: glut
      ? `A shipment floods the ${p.name} market.`
      : `A seizure tightens ${p.name} supply here.`,
    productId: p.id,
    multiplier: glut ? 0.1 + magnitude * 0.22 : 2.8 + magnitude * 3.2,
    enforcementDelta: glut ? 0.03 : 0.12,
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
    const candidate = eventFor(state.seed, day, id);
    if (candidate?.id.startsWith("home-glut-") || !condition)
      condition = candidate ?? condition;
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
  return addLog(noted, `JET: ${notice.message}`);
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
  const candidate = eventFor(state.seed, day, destination);
  const generated =
    candidate?.id.startsWith("home-glut-") || !states[destination].condition
      ? candidate
      : undefined;
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
    version: 3 as const,
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
    heatExposure: 0,
    lastHeatIncreaseDay: 0,
    officersKilled: 0,
    identityKills: 0,
    guns: 0,
    weapons: [],
    capacity: COAT_CAPACITIES[0],
    inventory: emptyInventory(),
    storageUnits: emptyStorageUnits(),
    dailyTrades: emptyDailyTrades(1),
    loanRate: LOAN_DAILY_RATE,
    loanGraceUntilDay: 6,
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
): Pick<
  GameState,
  | "heat"
  | "heatExposure"
  | "lastHeatIncreaseDay"
  | "dailyTrades"
  | "loanPremiumPressure"
> {
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
  const desiredRawExposure = Math.round(
    Math.log10(1 + grossValue / TRADE_HEAT_VALUE_SCALE) *
      TRADE_HEAT_LOG_MULTIPLIER,
  );
  const incrementalRawExposure = Math.max(
    0,
    desiredRawExposure - ledger.rawExposureApplied,
  );
  const heatExposure = state.heatExposure + incrementalRawExposure;
  const heat = accrueHeat(
    state.heat,
    incrementalRawExposure,
    heatExposure,
    state.identityKills,
  );
  const premium = id === "coke" || id === "heroin";
  return {
    heat,
    heatExposure,
    lastHeatIncreaseDay:
      incrementalRawExposure > 0 ? state.day : state.lastHeatIncreaseDay,
    loanPremiumPressure:
      state.loanPremiumPressure ||
      grossValue > LOAN_PRESSURE_GROSS_VALUE ||
      (premium && quantityByProduct[id] > 10),
    dailyTrades: {
      ...ledger,
      grossValue,
      grossByProduct,
      rawExposureApplied: desiredRawExposure,
      quantityByProduct,
    },
  };
}

function applyRawHeatExposure(
  state: GameState,
  rawExposure: number,
  identityKills = state.identityKills,
): Pick<
  GameState,
  "heat" | "heatExposure" | "lastHeatIncreaseDay" | "identityKills"
> {
  const raw = Math.max(0, rawExposure);
  const heatExposure = state.heatExposure + raw;
  return {
    heat: accrueHeat(state.heat, raw, heatExposure, identityKills),
    heatExposure,
    lastHeatIncreaseDay: raw > 0 ? state.day : state.lastHeatIncreaseDay,
    identityKills,
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

function buyStorage(
  state: GameState,
  storageBorough: StorageBoroughId,
  slot: number,
  id: ProductId,
  quantity: number,
): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  if (!state.market.listed.includes(id))
    return invalid(state, `${productName(id)} is not listed here today`);
  const location = state.storageUnits[storageBorough];
  const unit = storageUnitAt(state, storageBorough, slot);
  if (!unit) return invalid(state, "rent that storage unit before using it");
  if (unit.productId !== undefined && unit.productId !== id)
    return invalid(
      state,
      `unit ${slot} already contains ${productName(unit.productId)}`,
    );
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  if (q > STORAGE_CAPACITY)
    return invalid(state, `a delivery cannot exceed ${STORAGE_CAPACITY} units`);
  if (unit.quantity + q > STORAGE_CAPACITY)
    return invalid(state, `unit ${slot} does not have enough space`);
  const unitPrice = Math.ceil(
    state.market.prices[id] *
      storageBuyMultiplier(state.current, storageBorough),
  );
  const cost = q * unitPrice;
  if (cost > state.cash) return invalid(state, "you do not have enough cash");
  const updatedUnit: StorageUnit = {
    ...unit,
    productId: id,
    avgCost: (unit.quantity * unit.avgCost + cost) / (unit.quantity + q),
    quantity: unit.quantity + q,
  };
  const exposure = applyTradeExposure(state, id, q, cost);
  const storageName = BOROUGHS.find(
    (borough) => borough.id === storageBorough,
  )?.name;
  return addLog(
    {
      ...state,
      cash: state.cash - cost,
      storageUnits: {
        ...state.storageUnits,
        [storageBorough]: {
          ...location,
          units: location.units.map((candidate) =>
            candidate.slot === slot ? updatedUnit : candidate,
          ),
        },
      },
      ...exposure,
    },
    `Bought ${q} ${productName(id)} into ${storageName} storage unit ${slot} for ${cashForLog(cost)}.`,
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

export function storageSaleMultiplier(
  marketBorough: BoroughId,
  storageBorough: StorageBoroughId,
): number {
  return marketBorough === storageBorough ? 0.7 : 0.5;
}

export function storageBuyMultiplier(
  marketBorough: BoroughId,
  storageBorough: StorageBoroughId,
): number {
  return marketBorough === storageBorough
    ? STORAGE_LOCAL_BUY_MULTIPLIER
    : STORAGE_REMOTE_BUY_MULTIPLIER;
}

function sellStorage(
  state: GameState,
  storageBorough: StorageBoroughId,
  slot: number,
): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  const location = state.storageUnits[storageBorough];
  const unit = storageUnitAt(state, storageBorough, slot);
  if (!unit) return invalid(state, "that storage unit is not active");
  if (unit.productId === undefined || unit.quantity < 1)
    return invalid(state, "that storage unit is empty");
  const id = unit.productId;
  if (!state.market.listed.includes(id))
    return invalid(state, `${productName(id)} is not listed here today`);
  const q = unit.quantity;
  const multiplier = storageSaleMultiplier(state.current, storageBorough);
  const unitPrice = Math.floor(state.market.prices[id] * multiplier);
  const proceeds = q * unitPrice;
  const exposure = applyTradeExposure(state, id, q, proceeds);
  const storageName = BOROUGHS.find(
    (borough) => borough.id === storageBorough,
  )?.name;
  return addLog(
    {
      ...state,
      cash: state.cash + proceeds,
      storageUnits: {
        ...state.storageUnits,
        [storageBorough]: {
          units: location.units.filter((candidate) => candidate.slot !== slot),
          lateSinceDay:
            location.units.length === 1 ? undefined : location.lateSinceDay,
        },
      },
      ...exposure,
    },
    `Sold all ${q} stored ${productName(id)} from ${storageName} unit ${slot} for ${cashForLog(proceeds)} and ended its contract.`,
  );
}

export function isStorageBorough(id: BoroughId): id is StorageBoroughId {
  return STORAGE_BOROUGHS.includes(id as StorageBoroughId);
}

export function storageUnitAt(
  state: GameState,
  id: StorageBoroughId,
  slot: number,
): StorageUnit | undefined {
  return state.storageUnits[id].units.find((unit) => unit.slot === slot);
}

function transferStorage(
  state: GameState,
  slot: number,
  id: ProductId,
  quantity: number,
  direction: "store" | "retrieve",
): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const storageBorough = state.current;
  const location = state.storageUnits[storageBorough];
  const unit = storageUnitAt(state, storageBorough, slot);
  if (!unit) return invalid(state, "rent that storage unit first");
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q <= 0)
    return invalid(state, "quantity must be positive");
  const inventory = cloneInventory(state.inventory);
  if (
    direction === "store" &&
    unit.productId !== undefined &&
    unit.productId !== id
  )
    return invalid(
      state,
      `unit ${slot} already contains ${productName(unit.productId)}`,
    );
  if (direction === "retrieve" && unit.productId !== id)
    return invalid(state, `unit ${slot} does not contain ${productName(id)}`);
  const sourceQuantity =
    direction === "store" ? inventory[id].quantity : unit.quantity;
  if (q > sourceQuantity)
    return invalid(
      state,
      direction === "store"
        ? `you only carry ${sourceQuantity} ${productName(id)}`
        : `only ${sourceQuantity} ${productName(id)} is in storage`,
    );
  if (
    direction === "retrieve" &&
    totalCargo(state.inventory) + q > state.capacity
  )
    return invalid(state, "your coat is full");
  if (direction === "store" && unit.quantity + q > STORAGE_CAPACITY)
    return invalid(state, "the storage unit is full");
  let updatedUnit: StorageUnit;
  if (direction === "store") {
    const coatItem = inventory[id];
    updatedUnit = {
      ...unit,
      productId: id,
      avgCost:
        (unit.quantity * unit.avgCost + q * coatItem.avgCost) /
        (unit.quantity + q),
      quantity: unit.quantity + q,
    };
    coatItem.quantity -= q;
    if (coatItem.quantity === 0) coatItem.avgCost = 0;
  } else {
    const coatItem = inventory[id];
    coatItem.avgCost =
      (coatItem.quantity * coatItem.avgCost + q * unit.avgCost) /
      (coatItem.quantity + q);
    coatItem.quantity += q;
    const remaining = unit.quantity - q;
    updatedUnit = {
      ...unit,
      productId: remaining > 0 ? unit.productId : undefined,
      quantity: remaining,
      avgCost: remaining > 0 ? unit.avgCost : 0,
    };
  }
  return addLog(
    {
      ...state,
      inventory,
      storageUnits: {
        ...state.storageUnits,
        [storageBorough]: {
          ...location,
          units: location.units.map((candidate) =>
            candidate.slot === slot ? updatedUnit : candidate,
          ),
        },
      },
    },
    direction === "store"
      ? `Stored ${q} ${productName(id)} in ${BOROUGHS.find((item) => item.id === state.current)?.name} unit ${slot}.`
      : `Retrieved ${q} ${productName(id)} from storage unit ${slot}.`,
  );
}

function rentStorage(state: GameState): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const storageBorough = state.current;
  const location = state.storageUnits[storageBorough];
  if (location.lateSinceDay !== undefined)
    return invalid(state, "settle the overdue rent before adding storage");
  if (location.units.length >= MAX_STORAGE_UNITS)
    return invalid(state, `you already rent ${MAX_STORAGE_UNITS} units here`);
  if (state.cash < STORAGE_DAILY_RENT)
    return invalid(state, `you need ${cashForLog(STORAGE_DAILY_RENT)} in cash`);
  const name = BOROUGHS.find((item) => item.id === state.current)?.name;
  const usedSlots = new Set(location.units.map((unit) => unit.slot));
  const slot = [1, 2, 3].find((candidate) => !usedSlots.has(candidate));
  if (!slot) return invalid(state, "there is no storage slot available");
  return addLog(
    addFieldNote(
      {
        ...state,
        cash: state.cash - STORAGE_DAILY_RENT,
        storageUnits: {
          ...state.storageUnits,
          [storageBorough]: {
            ...location,
            units: [...location.units, { slot, quantity: 0, avgCost: 0 }].sort(
              (a, b) => a.slot - b.slot,
            ),
            lateSinceDay: undefined,
          },
        },
      },
      "storage",
      `Rented storage unit ${slot} of ${MAX_STORAGE_UNITS} in ${name} for $200 per day.`,
      state.current,
    ),
    `Rented storage in ${name}.`,
  );
}

function closeStorage(state: GameState, slot: number): GameState {
  if (state.phase !== "market")
    return invalid(state, "finish the current encounter first");
  if (!isStorageBorough(state.current))
    return invalid(state, "there is no storage unit here");
  const storageBorough = state.current;
  const location = state.storageUnits[storageBorough];
  const unit = storageUnitAt(state, storageBorough, slot);
  if (!unit) return invalid(state, "you do not rent that storage unit");
  if (location.lateSinceDay !== undefined)
    return invalid(state, "settle the overdue rent before releasing storage");
  if (unit.quantity > 0)
    return invalid(state, "empty that storage unit before releasing it");
  const remainingUnits = location.units.filter(
    (candidate) => candidate.slot !== slot,
  );
  return addLog(
    {
      ...state,
      storageUnits: {
        ...state.storageUnits,
        [storageBorough]: { units: remainingUnits },
      },
    },
    `Released storage unit ${slot}. ${remainingUnits.length} remain.`,
  );
}

interface DebtCollection {
  state: GameState;
  cashSeized: number;
  debtCredit: number;
  cashRetained: number;
  stockLost: number;
  coatLost: boolean;
}

/** The same financial collection rule governs every enforcer intervention. */
function collectOutstandingDebt(state: GameState): DebtCollection {
  const cashBefore = state.cash;
  const debtCredit = Math.min(cashBefore, state.debt);
  const surplus = Math.max(0, cashBefore - state.debt);
  const cashRetained = Math.floor(surplus * 0.1);
  const cashSeized = cashBefore - cashRetained;
  const debt = Math.max(0, state.debt - debtCredit);
  const stripCoat = debt > 0;
  const stockLost = stripCoat ? totalCargo(state.inventory) : 0;
  const coatLost = stripCoat && state.capacity > COAT_CAPACITIES[0];
  return {
    cashSeized,
    debtCredit,
    cashRetained,
    stockLost,
    coatLost,
    state: {
      ...state,
      cash: cashRetained,
      debt,
      inventory: stripCoat ? emptyInventory() : state.inventory,
      capacity: stripCoat ? COAT_CAPACITIES[0] : state.capacity,
      loanRate: debt === 0 ? LOAN_DAILY_RATE : state.loanRate,
      loanPremiumPressure: debt === 0 ? false : state.loanPremiumPressure,
    },
  };
}

function debtCollectionMessage(
  collection: DebtCollection,
  healthLoss: number,
): string {
  const details = ["The loan shark's enforcers beat you down."];
  if (collection.cashSeized > 0)
    details.push(`They take ${cashForLog(collection.cashSeized)}.`);
  if (collection.debtCredit > 0)
    details.push(
      `${cashForLog(collection.debtCredit)} is credited toward your debt.`,
    );
  if (collection.cashRetained > 0)
    details.push(`You keep ${cashForLog(collection.cashRetained)}.`);
  if (collection.state.debt > 0)
    details.push(
      collection.stockLost > 0 || collection.coatLost
        ? "They also take your coat and everything in it."
        : "Your debt is still outstanding.",
    );
  else details.push("Your debt is paid off.");
  details.push(`You lose ${healthLoss} health.`);
  return details.join(" ");
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
        loanGraceUntilDay: state.day + 5,
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
      const collection = collectOutstandingDebt({
        ...state,
        rng: damageRng,
        cash: cashAfterPayment,
        debt: debtAfterPayment,
      });
      const punished: GameState = {
        ...collection.state,
        health: Math.max(0, state.health - healthLoss),
      };
      const message = `The loan shark spots the cash you held back. ${debtCollectionMessage(collection, healthLoss)}`;
      if (punished.health <= 0) {
        const ended = endGame(
          punished,
          "The loan shark's enforcers killed you.",
        );
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
                  message: "",
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
  if (state.debt <= 0) return invalid(state, "you do not owe anything");
  const [damageRoll, rng] = nextRandom(state);
  const healthLoss = 10 + Math.floor(damageRoll * 21);
  const collection = collectOutstandingDebt({ ...state, rng });
  const punished: GameState = {
    ...collection.state,
    health: Math.max(0, state.health - healthLoss),
  };
  const message = debtCollectionMessage(collection, healthLoss);
  if (punished.health <= 0) {
    const ended = endGame(punished, "The loan shark's enforcers killed you.");
    const result = withOutcome(
      ended,
      "loan-shark",
      `Wrong answer, ${state.name}.`,
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
              message: "",
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
    `Wrong answer, ${state.name}.`,
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
      ...applyRawHeatExposure(state, GUN_PURCHASE_EXPOSURE),
    },
    `Bought a ${gun.name} for ${cashForLog(gun.price)}. Keep it quiet.`,
  );
}

function sellGun(state: GameState, gunId: GunId): GameState {
  if (state.phase !== "market")
    return invalid(
      state,
      "the gear contact is unavailable during an encounter",
    );
  if (state.current !== "bronx")
    return invalid(state, "guns can be sold only in The Bronx");
  const gun = GUN_CATALOG.find((candidate) => candidate.id === gunId);
  const owned = weaponIds(state);
  if (!gun || !owned.includes(gunId))
    return invalid(state, "you do not carry that gun");
  const proceeds = Math.floor(gun.price * 0.5);
  return addLog(
    {
      ...state,
      cash: state.cash + proceeds,
      guns: state.guns - 1,
      weapons: owned.filter((id) => id !== gunId),
    },
    `Sold the ${gun.name} for ${cashForLog(proceeds)}.`,
  );
}
const cashForLog = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

function fenceReferencePrice(state: GameState, id: ProductId): number {
  return (
    state.boroughs.staten.ledger.observations[id]?.price ??
    state.market.prices[id]
  );
}

export function fenceMultiplier(source: FenceSource): number {
  if (source === "coat") return 0.3;
  return source.borough === "staten" ? 0.3 * 0.7 : 0.3 * 0.5;
}

export function fenceValue(
  state: GameState,
  source: FenceSource = "coat",
): number {
  const multiplier = fenceMultiplier(source);
  if (source === "coat")
    return Math.floor(
      PRODUCTS.reduce(
        (total, item) =>
          total +
          state.inventory[item.id].quantity *
            fenceReferencePrice(state, item.id),
        0,
      ) * multiplier,
    );
  const unit = storageUnitAt(state, source.borough, source.unit);
  if (!unit?.productId || unit.quantity < 1) return 0;
  return Math.floor(
    unit.quantity * fenceReferencePrice(state, unit.productId) * multiplier,
  );
}

export function localServiceError(
  state: GameState,
  serviceId: LocalServiceId,
): string | undefined {
  if (state.phase !== "market") return "Finish the current encounter first.";
  if (serviceId === "fence") {
    if (state.current !== "staten") return "The fence is on Staten Island.";
    const stored = storedUnits(state);
    if (totalCargo(state.inventory) + stored < 1)
      return "You have no stock to fence.";
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
      heatExposure: 0,
      identityKills: 0,
      lastHeatIncreaseDay: state.day,
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
        `Plastic surgery cost ${cashForLog(offer.cost)} and ${offer.days} days. Your heat and accumulated exposure are gone.`,
      ),
    );
  }
  return state;
}

function useFence(state: GameState, source: FenceSource): GameState {
  const error = localServiceError(state, "fence");
  if (error) return invalid(state, error.toLowerCase());
  const unit =
    source === "coat"
      ? undefined
      : storageUnitAt(state, source.borough, source.unit);
  if (source !== "coat" && !unit)
    return invalid(state, "that storage unit is not active");
  if (
    source === "coat"
      ? totalCargo(state.inventory) < 1
      : !unit?.productId || unit.quantity < 1
  )
    return invalid(state, "that inventory is empty");
  const proceeds = fenceValue(state, source);
  let exposureState = state;
  const fencedStock =
    source === "coat"
      ? PRODUCTS.map((item) => ({
          id: item.id,
          quantity: state.inventory[item.id].quantity,
        }))
      : [{ id: unit!.productId!, quantity: unit!.quantity }];
  for (const item of fencedStock) {
    const quantity = item.quantity;
    if (quantity < 1) continue;
    const value = Math.floor(
      quantity * fenceReferencePrice(state, item.id) * fenceMultiplier(source),
    );
    const exposure = applyTradeExposure(
      exposureState,
      item.id,
      quantity,
      value,
    );
    exposureState = { ...exposureState, ...exposure };
  }
  const sold: GameState = {
    ...state,
    cash: state.cash + proceeds,
    heat: exposureState.heat,
    heatExposure: exposureState.heatExposure,
    lastHeatIncreaseDay: exposureState.lastHeatIncreaseDay,
    dailyTrades: exposureState.dailyTrades,
    loanPremiumPressure: exposureState.loanPremiumPressure,
  };
  const emptied: GameState =
    source === "coat"
      ? { ...sold, inventory: emptyInventory() }
      : {
          ...sold,
          storageUnits: {
            ...sold.storageUnits,
            [source.borough]: {
              units: sold.storageUnits[source.borough].units.filter(
                (candidate) => candidate.slot !== source.unit,
              ),
              lateSinceDay:
                sold.storageUnits[source.borough].units.length === 1
                  ? undefined
                  : sold.storageUnits[source.borough].lateSinceDay,
            },
          },
        };
  const sourceName =
    source === "coat"
      ? "your coat"
      : `${BOROUGHS.find((borough) => borough.id === source.borough)?.name} storage unit ${source.unit}`;
  return addLog(
    emptied,
    `The fence bought everything in ${sourceName} for ${cashForLog(proceeds)}${source === "coat" ? "." : " and ended its contract."}`,
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
  const heat =
    state.lastHeatIncreaseDay === state.day
      ? state.heat
      : heatAfterElapsedDay(
          state.heat,
          state.heatExposure,
          state.identityKills,
        );
  let next: GameState = {
    ...state,
    heat,
    bank: Math.floor(state.bank * (1 + BANK_DAILY_RATE)),
    debt: state.debt > 0 ? Math.ceil(state.debt * (1 + state.loanRate)) : 0,
  };
  for (const id of STORAGE_BOROUGHS) {
    const location = next.storageUnits[id];
    if (location.units.length < 1) continue;
    const rent = STORAGE_DAILY_RENT * location.units.length;
    const name = BOROUGHS.find((borough) => borough.id === id)?.name ?? id;
    if (location.lateSinceDay !== undefined) {
      if (next.cash >= rent) {
        next = {
          ...next,
          cash: next.cash - rent,
          storageUnits: {
            ...next.storageUnits,
            [id]: { ...location, lateSinceDay: undefined },
          },
        };
      } else {
        const lost = location.units.reduce(
          (total, unit) => total + unit.quantity,
          0,
        );
        const message = `Your ${name} storage contracts are liquidated for unpaid rent. ${lost} ${lost === 1 ? "item is" : "items are"} gone.`;
        next = addFieldNote(
          {
            ...next,
            storageUnits: {
              ...next.storageUnits,
              [id]: { units: [] },
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
    if (next.cash >= rent) {
      next = { ...next, cash: next.cash - rent };
      continue;
    }
    const message =
      `You have a voicemail from the ${name} storage location. ` +
      `Your ${cashForLog(rent)} rent is late. If you don't pay by tomorrow, your storage units will be liquidated.`;
    next = addFieldNote(
      {
        ...next,
        storageUnits: {
          ...next.storageUnits,
          [id]: { ...location, lateSinceDay: nextDay },
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
  const heatRisk = 0.005 + 0.4 * normalizedHeat ** 2;
  const cargoPressure = clamp(
    Math.log10(1 + Math.max(0, cargoWorth) / 10_000) * 0.05,
    0,
    0.2,
  );
  const context = clamp(0.75 + routePressure + cargoPressure, 0.8, 1.35);
  return clamp(heatRisk * context, 0, 0.55);
}

export function policeOfficerRange(heat: number): {
  min: number;
  max: number;
} {
  const x = clamp(Math.round(heat), 0, 100) / 100;
  const expected = Math.max(1, 15 * (3 * x ** 2 - 2 * x ** 3));
  return {
    min: clamp(Math.floor(expected), 1, 15),
    max: clamp(Math.ceil(expected), 1, 15),
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
    return invalid(state, "you cannot jet during an encounter");
  if (state.day >= 30)
    return invalid(state, "Day 30 is for settling up, not jetting");
  if (destination === state.current)
    return invalid(state, "you are already there");
  const day = state.day + 1;
  const arrival = addTravelNotice(
    arrive(
      applyInterest(state),
      destination,
      day,
      `You jetted from ${BOROUGHS.find((b) => b.id === state.current)?.name}.`,
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
      ...applyRawHeatExposure(state, FAILED_ESCAPE_EXPOSURE),
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
  const firedWeapons = weaponIds(state).slice(0, MAX_GUNS_FIRED);
  for (const weapon of firedWeapons) {
    const [roll, nextRng] = nextRandom({ ...state, rng });
    rng = nextRng;
    if (roll < gunKillChance(weapon)) kills += 1;
  }
  kills = Math.min(officers, kills);
  const remaining = officers - kills;
  const identityKills = state.identityKills + kills;
  const rawExposure = POLICE_SHOOTOUT_EXPOSURE + kills * POLICE_KILL_EXPOSURE;
  const next: GameState = {
    ...state,
    ...applyRawHeatExposure(state, rawExposure, identityKills),
    rng,
    officersKilled: state.officersKilled + kills,
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
  let rng = state.rng;
  let hitByVolley = false;
  for (let officer = 0; officer < officers; officer++) {
    const [roll, nextRng] = nextRandom({ ...state, rng });
    rng = nextRng;
    if (roll < POLICE_OFFICER_HIT_CHANCE) hitByVolley = true;
  }
  const choiceEncounter = { ...encounter, stage: "choice" as const };
  if (!hitByVolley)
    return withOutcome(
      { ...state, rng, pendingEncounter: choiceEncounter },
      "police",
      "They miss.",
      "Bullets go past you.",
      "encounter",
    );
  const [damageRoll, finalRng] = nextRandom({ ...state, rng });
  const healthLoss = 10 + Math.floor(damageRoll * 16);
  const hit: GameState = {
    ...state,
    rng: finalRng,
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
  const collection = collectOutstandingDebt({ ...state, rng });
  const next: GameState = {
    ...collection.state,
    health: Math.max(0, state.health - healthLoss),
    phase: "market",
    pendingLoanSharkEncounter: undefined,
  };
  const message = debtCollectionMessage(collection, healthLoss);
  if (next.health <= 0) {
    const ended = endGame(next, "The loan shark's enforcers beat you down.");
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
              message: "",
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
    }),
    state.current,
    state.day + 1,
    "You lay low for a day.",
    false,
  );
  return presentNotices(addLog(next, "Health recovered while you lay low."));
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
    case "buy-storage":
      return buyStorage(
        state,
        action.borough,
        action.unit,
        action.product,
        action.quantity,
      );
    case "sell":
      return sell(state, action.product, action.quantity);
    case "sell-storage":
      return sellStorage(state, action.borough, action.unit);
    case "store":
      return transferStorage(
        state,
        action.unit,
        action.product,
        action.quantity,
        "store",
      );
    case "retrieve":
      return transferStorage(
        state,
        action.unit,
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
    case "sell-gun":
      return sellGun(state, action.gun);
    case "use-local-service":
      return useLocalService(state, action.service);
    case "use-fence":
      return useFence(state, action.source);
    case "rent-storage":
      return rentStorage(state);
    case "close-storage":
      return closeStorage(state, action.unit);
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
export function storedUnits(
  state: GameState,
  id?: StorageBoroughId,
  slot?: number,
): number {
  if (id && slot !== undefined)
    return storageUnitAt(state, id, slot)?.quantity ?? 0;
  if (id)
    return state.storageUnits[id].units.reduce(
      (total, unit) => total + unit.quantity,
      0,
    );
  return STORAGE_BOROUGHS.reduce(
    (total, boroughId) =>
      total +
      state.storageUnits[boroughId].units.reduce(
        (subtotal, unit) => subtotal + unit.quantity,
        0,
      ),
    0,
  );
}

export function rentedStorageUnits(
  state: GameState,
  id?: StorageBoroughId,
): number {
  if (id) return state.storageUnits[id].units.length;
  return STORAGE_BOROUGHS.reduce(
    (total, boroughId) => total + state.storageUnits[boroughId].units.length,
    0,
  );
}
export function currentBorough(state: GameState): BoroughState {
  return state.boroughs[state.current];
}
