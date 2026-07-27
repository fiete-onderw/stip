import { ROUND_SCHEDULE } from './config';
import type { GameState, Player, RoundEntries } from './types';

export function totalRounds(): number {
  return ROUND_SCHEDULE.length;
}

export function cardsInRound(roundIndex: number): number {
  return ROUND_SCHEDULE[roundIndex];
}

/**
 * Puntentelling volgens de huisregels:
 * - Juiste voorspelling: 5 punten + het aantal behaalde slagen.
 * - Foute voorspelling: min het verschil tussen voorspeld en behaald aantal slagen.
 */
export function calculatePoints(predicted: number, taken: number): number {
  if (predicted === taken) {
    return 5 + taken;
  }
  return -Math.abs(predicted - taken);
}

// Index (in players[]) van de deler voor een gegeven ronde. Rouleert elke
// ronde met de klok mee, te beginnen bij firstDealerIndex in ronde 0.
export function dealerIndexForRound(
  roundIndex: number,
  playerCount: number,
  firstDealerIndex: number,
): number {
  return (firstDealerIndex + roundIndex) % playerCount;
}

// Spelervolgorde voor bieden én voor uitkomen bij de eerste slag: begint bij
// de speler links van de deler, daarna met de klok mee rond.
export function biddingOrder(
  players: Player[],
  roundIndex: number,
  firstDealerIndex: number,
): Player[] {
  const n = players.length;
  const dealerIdx = dealerIndexForRound(roundIndex, n, firstDealerIndex);
  const startIdx = (dealerIdx + 1) % n;
  const order: Player[] = [];
  for (let i = 0; i < n; i++) {
    order.push(players[(startIdx + i) % n]);
  }
  return order;
}

export function dealerForRound(
  players: Player[],
  roundIndex: number,
  firstDealerIndex: number,
): Player {
  return players[dealerIndexForRound(roundIndex, players.length, firstDealerIndex)];
}

export function cumulativeScores(state: GameState): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of state.players) {
    totals[player.id] = 0;
  }
  for (const roundEntries of Object.values(state.rounds)) {
    for (const [playerId, entry] of Object.entries(roundEntries)) {
      totals[playerId] = (totals[playerId] ?? 0) + calculatePoints(entry.predicted, entry.taken);
    }
  }
  return totals;
}

// Cumulatieve score per speler, na elke afgeronde ronde (voor de grafiek).
export function cumulativeScoresByRound(state: GameState): {
  roundLabels: string[];
  seriesByPlayer: Record<string, number[]>;
} {
  const roundLabels: string[] = [];
  const seriesByPlayer: Record<string, number[]> = {};
  for (const player of state.players) {
    seriesByPlayer[player.id] = [];
  }

  const running: Record<string, number> = {};
  for (const player of state.players) {
    running[player.id] = 0;
  }

  for (let roundIndex = 0; roundIndex < state.currentRoundIndex; roundIndex++) {
    const entries = state.rounds[roundIndex];
    if (!entries) continue;
    for (const player of state.players) {
      const entry = entries[player.id];
      if (entry) {
        running[player.id] += calculatePoints(entry.predicted, entry.taken);
      }
      seriesByPlayer[player.id].push(running[player.id]);
    }
    roundLabels.push(String(roundIndex + 1));
  }

  return { roundLabels, seriesByPlayer };
}

export function rankedStandings(state: GameState): { player: Player; total: number }[] {
  const totals = cumulativeScores(state);
  return [...state.players]
    .map((player) => ({ player, total: totals[player.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);
}

export function sumTaken(entries: RoundEntries | undefined): number {
  if (!entries) return 0;
  return Object.values(entries).reduce((sum, entry) => sum + entry.taken, 0);
}
