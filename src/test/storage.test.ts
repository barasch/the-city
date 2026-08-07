import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Score, startGame } from "../game/engine";
import {
  loadGame,
  loadScores,
  SAVE_KEY,
  saveGame,
  saveScore,
} from "../game/storage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("local persistence", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("round-trips a complete serializable run and tolerates corrupt data", () => {
    const state = startGame("Saved Runner", "queens", 1042);
    saveGame(state);
    expect(loadGame()).toEqual(state);

    localStorage.setItem(SAVE_KEY, "{not json");
    expect(loadGame()).toBeNull();
  });

  it("sorts personal scores and keeps the best twenty", () => {
    for (let value = 1; value <= 25; value++) {
      const score: Score = {
        name: `Runner ${value}`,
        value,
        day: 30,
        reason: "Thirty days complete.",
        date: `Run ${value}`,
      };
      saveScore(score);
    }

    const scores = loadScores();
    expect(scores).toHaveLength(20);
    expect(scores[0].value).toBe(25);
    expect(scores.at(-1)?.value).toBe(6);
  });
});
