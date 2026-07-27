export interface Player {
  id: string;
  name: string;
}

// Eén ingevulde regel: wat een speler voorspelde en behaalde in een ronde.
export interface RoundEntry {
  predicted: number;
  taken: number;
}

// Alle ingevulde regels van één ronde, per speler-id.
export type RoundEntries = Record<string, RoundEntry>;

export interface GameState {
  players: Player[];
  // Index in ROUND_SCHEDULE van de ronde die nu gespeeld/ingevuld wordt.
  currentRoundIndex: number;
  // Per ronde-index de ingevulde scores, alleen aanwezig voor afgeronde rondes.
  rounds: Record<number, RoundEntries>;
  // Index van de speler die ronde 0 deelt; roteert daarna met de klok mee.
  firstDealerIndex: number;
  finished: boolean;
}
