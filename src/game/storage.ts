import { HISTORY_STORAGE_KEY, PLAYER_NAMES_STORAGE_KEY, STORAGE_KEY } from './config';
import type { GameState, HistoryEntry } from './types';

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadSavedPlayerNames(): string[] | null {
  try {
    const raw = localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

export function saveSavedPlayerNames(names: string[]): void {
  localStorage.setItem(PLAYER_NAMES_STORAGE_KEY, JSON.stringify(names));
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function appendHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory();
  history.push(entry);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
