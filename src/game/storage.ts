import { GameState, Score } from "./engine";

export const SAVE_KEY = "the-city:save";
export const SCORES_KEY = "the-city:scores";

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}
export function saveScore(score: Score): void {
  const scores = loadScores();
  scores.push(score);
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
