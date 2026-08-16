import { GameState, PRODUCTS, Score, STORAGE_CAPACITY } from "./engine";

export const SAVE_KEY = "the-city:save";
export const SCORES_KEY = "the-city:scores";
export const RUNNER_NAME_KEY = "the-city:runner-name";

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function hasCurrentStorageShape(parsed: Partial<GameState>): boolean {
  const storage = parsed.storageUnits as unknown;
  if (!storage || typeof storage !== "object") return false;
  const productIds = new Set<string>(PRODUCTS.map((product) => product.id));
  return ["brooklyn", "queens", "staten"].every((borough) => {
    const location = (storage as Record<string, unknown>)[borough];
    if (!location || typeof location !== "object") return false;
    const units = (location as { units?: unknown }).units;
    if (!Array.isArray(units) || units.length > 3) return false;
    const slots = new Set<number>();
    return units.every((unit) => {
      if (!unit || typeof unit !== "object") return false;
      const candidate = unit as Record<string, unknown>;
      const slot = candidate.slot;
      const quantity = candidate.quantity;
      const avgCost = candidate.avgCost;
      const productId = candidate.productId;
      if (
        typeof slot !== "number" ||
        !Number.isInteger(slot) ||
        slot < 1 ||
        slot > 3 ||
        slots.has(slot) ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 0 ||
        quantity > STORAGE_CAPACITY ||
        typeof avgCost !== "number" ||
        !Number.isFinite(avgCost) ||
        avgCost < 0
      )
        return false;
      if (
        productId !== undefined &&
        (typeof productId !== "string" || !productIds.has(productId))
      )
        return false;
      if (quantity > 0 !== (productId !== undefined)) return false;
      slots.add(slot);
      return true;
    });
  });
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (
      typeof parsed.name === "string" &&
      !localStorage.getItem(RUNNER_NAME_KEY)
    )
      saveRunnerName(parsed.name);
    if (parsed.version === 3 && hasCurrentStorageShape(parsed))
      return parsed as GameState;
    localStorage.removeItem(SAVE_KEY);
    return null;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}
export function loadRunnerName(): string {
  return localStorage.getItem(RUNNER_NAME_KEY)?.trim().slice(0, 24) || "Runner";
}
export function saveRunnerName(name: string): string {
  const clean = name.trim().slice(0, 24) || "Runner";
  localStorage.setItem(RUNNER_NAME_KEY, clean);
  return clean;
}
export function saveScore(score: Score): void {
  const scores = loadScores();
  scores.push({
    ...score,
    date:
      score.date ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  });
  scores.sort((a, b) => b.value - a.value);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 20)));
}
export function loadScores(): Score[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? (JSON.parse(raw) as Score[]) : [];
  } catch {
    return [];
  }
}
