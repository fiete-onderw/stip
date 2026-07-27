// Categorische kleuren, gekoppeld aan de vaste volgorde van spelers (niet aan
// hun klassement) — zo houdt elke speler zijn eigen kleur door de hele sessie.
const SERIES_VARS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
];

export function seriesColor(playerIndex: number): string {
  return SERIES_VARS[playerIndex % SERIES_VARS.length];
}
