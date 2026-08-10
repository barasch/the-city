import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Score, startGame } from "../game/engine";
import {
  loadGame,
  loadRunnerName,
  loadScores,
  RUNNER_NAME_KEY,
  SAVE_KEY,
  saveGame,
  saveRunnerName,
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

  it("invalidates version-one runs while retaining their runner name", () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, name: "Old Runner" }),
    );
    expect(loadGame()).toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(loadRunnerName()).toBe("Old Runner");
    expect(localStorage.getItem(RUNNER_NAME_KEY)).toBe("Old Runner");
  });

  it("normalizes and retains the runner name independently", () => {
    expect(loadRunnerName()).toBe("Runner");
    expect(saveRunnerName("  Bell  ")).toBe("Bell");
    expect(loadRunnerName()).toBe("Bell");
    expect(saveRunnerName("   ")).toBe("Runner");
  });

  it("sorts personal scores and keeps the best twenty", () => {
    for (let value = 1; value <= 25; value++) {
      const score: Score = {
        name: `Runner ${value}`,
        value,
        day: 30,
        reason: "Thirty days complete.",
        date: `Run ${value}`,
        home: "brooklyn",
        officersKilled: value,
      };
      saveScore(score);
    }

    const scores = loadScores();
    expect(scores).toHaveLength(20);
    expect(scores[0].value).toBe(25);
    expect(scores.at(-1)?.value).toBe(6);
  });
});
