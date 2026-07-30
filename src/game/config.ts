/**
 * Alle huisregel-parameters staan hier bij elkaar, zodat je ze makkelijk kunt
 * aanpassen zonder de rest van de code te hoeven doorspitten.
 */

// Standaard kaartspel: 52 kaarten.
export const DECK_SIZE = 52;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;

// Troef ligt vast voor de hele sessie.
export const TRUMP_SUIT = 'Harten';
export const TRUMP_SYMBOL = '♥';

// Het rondeschema wordt dynamisch berekend uit het aantal spelers, zie
// computeRoundSchedule() in logic.ts. DECK_SIZE hierboven is de enige knop
// die dat schema stuurt.

export const AVATAR_OPTIONS: string[] = [
  '😀', '😎', '🤠', '🥳', '🤓', '😇', '🥸', '🤡',
  '👻', '🤖', '🐶', '🐱', '🦁', '🐼', '🦊', '🐸',
  '🐵', '🦄', '🐙', '🦋',
];

export const BID_TIMER_OPTIONS = [15, 20] as const;
export const DEFAULT_BID_TIMER_SECONDS = 20;

export const STORAGE_KEY = 'boerenbridge-game-state-v1';
export const PLAYER_NAMES_STORAGE_KEY = 'boerenbridge-player-names-v1';
export const HISTORY_STORAGE_KEY = 'boerenbridge-history-v1';
