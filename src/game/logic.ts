import { DECK_SIZE } from './config';
import type { GameState, HistoryEntry, Player, RoundEntries } from './types';

// Maximum aantal kaarten per ronde: naar beneden afgerond, de rest van het
// kaartspel (DECK_SIZE mod aantal spelers) wordt die sessie niet gedeeld.
export function maxCardsForPlayers(playerCount: number): number {
  return Math.floor(DECK_SIZE / playerCount);
}

export function leftoverCards(playerCount: number): number {
  return DECK_SIZE % playerCount;
}

// Rondeschema: loopt op van 1 kaart naar het maximum, en weer af naar 1
// kaart (de piek komt maar één keer voor). Totaal dus 2*max - 1 rondes.
export function computeRoundSchedule(playerCount: number): number[] {
  const max = maxCardsForPlayers(playerCount);
  const up = Array.from({ length: max }, (_, i) => i + 1);
  const down = Array.from({ length: max - 1 }, (_, i) => max - 1 - i);
  return [...up, ...down];
}

export function totalRounds(state: GameState): number {
  return computeRoundSchedule(state.players.length).length;
}

export function cardsInRound(state: GameState, roundIndex: number): number {
  return computeRoundSchedule(state.players.length)[roundIndex];
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

// Totaalscore per speler na `roundsCompleted` afgeronde rondes (0 = nog niets ingevuld).
export function totalsThroughRound(state: GameState, roundsCompleted: number): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of state.players) totals[player.id] = 0;
  for (let i = 0; i < roundsCompleted; i++) {
    const entries = state.rounds[i];
    if (!entries) continue;
    for (const [playerId, entry] of Object.entries(entries)) {
      totals[playerId] = (totals[playerId] ?? 0) + calculatePoints(entry.predicted, entry.taken);
    }
  }
  return totals;
}

export function cumulativeScores(state: GameState): Record<string, number> {
  return totalsThroughRound(state, state.currentRoundIndex);
}

// 1-based klassementspositie per speler na `roundsCompleted` afgeronde rondes.
export function rankingThroughRound(state: GameState, roundsCompleted: number): Map<string, number> {
  const totals = totalsThroughRound(state, roundsCompleted);
  const ordered = [...state.players].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0));
  const rankMap = new Map<string, number>();
  ordered.forEach((p, i) => rankMap.set(p.id, i + 1));
  return rankMap;
}

// Positieve delta = gestegen (rangnummer omlaag) t.o.v. de vorige afgeronde ronde.
export function rankDeltas(state: GameState): Map<string, number> {
  const n = state.currentRoundIndex;
  const deltas = new Map<string, number>();
  if (n < 2) return deltas;
  const prevRank = rankingThroughRound(state, n - 1);
  const currRank = rankingThroughRound(state, n);
  for (const player of state.players) {
    deltas.set(player.id, (prevRank.get(player.id) ?? 0) - (currRank.get(player.id) ?? 0));
  }
  return deltas;
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

function streakForPlayer(state: GameState, playerId: string, uptoRoundIndex: number): number {
  let streak = 0;
  for (let i = uptoRoundIndex; i >= 0; i--) {
    const entry = state.rounds[i]?.[playerId];
    if (!entry || entry.predicted !== entry.taken) break;
    streak++;
  }
  return streak;
}

export interface RoundStatsResult {
  bestPrediction: Player[];
  worstPrediction: Player[];
  roundKing: Player[];
  riser: { player: Player; delta: number } | null;
  streaks: { player: Player; length: number }[];
}

// Statistieken voor de "ronde-wrapped": alleen zinvol voor een ronde die al is ingevuld.
export function roundStats(state: GameState, roundIndex: number): RoundStatsResult {
  const entries = state.rounds[roundIndex];
  if (!entries) {
    return { bestPrediction: [], worstPrediction: [], roundKing: [], riser: null, streaks: [] };
  }

  const rows = state.players.map((player) => {
    const entry = entries[player.id] ?? { predicted: 0, taken: 0 };
    return {
      player,
      diff: Math.abs(entry.predicted - entry.taken),
      points: calculatePoints(entry.predicted, entry.taken),
    };
  });

  const minDiff = Math.min(...rows.map((r) => r.diff));
  const maxDiff = Math.max(...rows.map((r) => r.diff));
  const maxPoints = Math.max(...rows.map((r) => r.points));

  const bestPrediction = rows.filter((r) => r.diff === minDiff).map((r) => r.player);
  // Alleen tonen als er ook echt verschil is — anders is het geen "miskleun", maar de norm.
  const worstPrediction = maxDiff > minDiff ? rows.filter((r) => r.diff === maxDiff).map((r) => r.player) : [];
  const roundKing = rows.filter((r) => r.points === maxPoints).map((r) => r.player);

  let riser: RoundStatsResult['riser'] = null;
  if (roundIndex > 0) {
    const before = rankingThroughRound(state, roundIndex);
    const after = rankingThroughRound(state, roundIndex + 1);
    for (const player of state.players) {
      const delta = (before.get(player.id) ?? 0) - (after.get(player.id) ?? 0);
      if (delta > 0 && (!riser || delta > riser.delta)) {
        riser = { player, delta };
      }
    }
  }

  const streaks = state.players
    .map((player) => ({ player, length: streakForPlayer(state, player.id, roundIndex) }))
    .filter((s) => s.length >= 2);

  return { bestPrediction, worstPrediction, roundKing, riser, streaks };
}

export interface SessionWrappedResult {
  nostradamus: { player: Player; exactCount: number }[];
  boldestGuess: { player: Player; roundIndex: number; predicted: number; cards: number } | null;
  comeback: { player: Player; roundIndex: number; delta: number } | null;
  ironNerves: { player: Player; roundIndex: number; cards: number } | null;
}

// Statistieken voor de "eind-wrapped": over de hele afgeronde sessie.
export function sessionWrappedStats(state: GameState): SessionWrappedResult {
  const totalR = totalRounds(state);
  const schedule = computeRoundSchedule(state.players.length);
  const maxCards = Math.max(...schedule);

  const exactCounts = new Map<string, number>();
  for (const player of state.players) exactCounts.set(player.id, 0);

  let boldestGuess: SessionWrappedResult['boldestGuess'] = null;
  let bestRatio = -1;

  let comeback: SessionWrappedResult['comeback'] = null;

  const manyCardsThreshold = Math.ceil(maxCards * 0.6);
  let ironNerves: SessionWrappedResult['ironNerves'] = null;

  for (let r = 0; r < totalR; r++) {
    const entries = state.rounds[r];
    if (!entries) continue;
    const cards = schedule[r];

    for (const player of state.players) {
      const entry = entries[player.id];
      if (!entry) continue;
      const isExact = entry.predicted === entry.taken;

      if (isExact) {
        exactCounts.set(player.id, (exactCounts.get(player.id) ?? 0) + 1);
        if (entry.predicted > 0) {
          const ratio = entry.predicted / cards;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            boldestGuess = { player, roundIndex: r, predicted: entry.predicted, cards };
          }
        }
      }

      if (entry.predicted === 0 && entry.taken === 0 && cards >= manyCardsThreshold) {
        if (!ironNerves || cards > ironNerves.cards) {
          ironNerves = { player, roundIndex: r, cards };
        }
      }
    }

    if (r >= 1) {
      const before = rankingThroughRound(state, r);
      const after = rankingThroughRound(state, r + 1);
      for (const player of state.players) {
        const delta = (before.get(player.id) ?? 0) - (after.get(player.id) ?? 0);
        if (delta > 0 && (!comeback || delta > comeback.delta)) {
          comeback = { player, roundIndex: r, delta };
        }
      }
    }
  }

  const maxExact = Math.max(0, ...exactCounts.values());
  const nostradamus = maxExact > 0
    ? state.players
        .filter((p) => exactCounts.get(p.id) === maxExact)
        .map((player) => ({ player, exactCount: maxExact }))
    : [];

  return { nostradamus, boldestGuess, comeback, ironNerves };
}

export function buildHistoryEntry(state: GameState): HistoryEntry {
  const standings = rankedStandings(state);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    players: standings.map(({ player, total }) => ({
      name: player.name,
      avatar: player.avatar,
      total,
    })),
    winnerName: standings[0]?.player.name ?? '',
    roundCount: totalRounds(state),
  };
}
