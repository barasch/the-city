import { GameState, Score } from "./engine";

export const SAVE_KEY = "the-city:save";
export const SCORES_KEY = "the-city:scores";
export const RUNNER_NAME_KEY = "the-city:runner-name";

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
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
    if (parsed.version === 2) return parsed as GameState;
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
