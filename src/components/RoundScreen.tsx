import { useEffect, useState } from 'react';
import { TRUMP_SYMBOL } from '../game/config';
import {
  biddingOrder,
  calculatePoints,
  cardsInRound,
  dealerForRound,
  totalRounds,
} from '../game/logic';
import type { GameState, Player, RoundEntries } from '../game/types';
import { BidTimer } from './BidTimer';
import { Stepper } from './Stepper';

interface RoundScreenProps {
  state: GameState;
  onSubmitRound: (entries: RoundEntries) => void;
  onShowStandings: () => void;
  onShowHistory: () => void;
}

export function RoundScreen({ state, onSubmitRound, onShowStandings, onShowHistory }: RoundScreenProps) {
  const { currentRoundIndex, players, firstDealerIndex } = state;
  const cards = cardsInRound(state, currentRoundIndex);
  const dealer = dealerForRound(players, currentRoundIndex, firstDealerIndex);
  const order = biddingOrder(players, currentRoundIndex, firstDealerIndex);
  const totalR = totalRounds(state);

  const existing = state.rounds[currentRoundIndex];
  const [entries, setEntries] = useState<RoundEntries>(() => buildInitialEntries(players, existing));

  useEffect(() => {
    setEntries(buildInitialEntries(players, state.rounds[currentRoundIndex]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoundIndex]);

  const updateEntry = (playerId: string, field: 'predicted' | 'taken', value: number) => {
    setEntries((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
  };

  const totalTaken = Object.values(entries).reduce((sum, e) => sum + e.taken, 0);
  const takenMismatch = totalTaken !== cards;

  return (
    <div className="screen round-screen">
      <div className="round-header">
        <div className="round-header-links">
          <button type="button" className="link-btn" onClick={onShowStandings}>
            Tussenstand
          </button>
          <button type="button" className="link-btn" onClick={onShowHistory}>
            Eerdere rondes
          </button>
        </div>
        <h2>
          Ronde {currentRoundIndex + 1} van {totalR} — {cards}{' '}
          {cards === 1 ? 'kaart' : 'kaarten'}
        </h2>
        <p className="round-meta">
          Deler: <strong>{dealer.name}</strong> &middot; Troef {TRUMP_SYMBOL}
        </p>
        <p className="round-meta">
          Eerst bieden &amp; uitkomen: <strong>{order[0].name}</strong>
        </p>
      </div>

      {!!state.bidTimerSeconds && (
        <BidTimer order={order} seconds={state.bidTimerSeconds} roundKey={currentRoundIndex} />
      )}

      <ol className="player-order-list">
        {order.map((player) => (
          <li key={player.id}>
            {player.avatar} {player.name}
          </li>
        ))}
      </ol>

      <div className="round-forms">
        {order.map((player) => (
          <PlayerRoundForm
            key={player.id}
            player={player}
            cards={cards}
            entry={entries[player.id]}
            onChange={updateEntry}
          />
        ))}
      </div>

      {takenMismatch && (
        <p className="warning">
          Let op: totaal behaalde slagen is {totalTaken}, maar er zijn {cards}{' '}
          {cards === 1 ? 'slag' : 'slagen'} te verdelen.
        </p>
      )}

      <button
        type="button"
        className="primary-btn"
        onClick={() => onSubmitRound(entries)}
      >
        {currentRoundIndex === totalR - 1 ? 'Spel afronden' : 'Volgende ronde'}
      </button>
    </div>
  );
}

function buildInitialEntries(players: Player[], existing: RoundEntries | undefined): RoundEntries {
  const entries: RoundEntries = {};
  for (const player of players) {
    entries[player.id] = existing?.[player.id] ?? { predicted: 0, taken: 0 };
  }
  return entries;
}

interface PlayerRoundFormProps {
  player: Player;
  cards: number;
  entry: { predicted: number; taken: number };
  onChange: (playerId: string, field: 'predicted' | 'taken', value: number) => void;
}

function PlayerRoundForm({ player, cards, entry, onChange }: PlayerRoundFormProps) {
  const points = calculatePoints(entry.predicted, entry.taken);
  return (
    <div className="player-round-form">
      <div className="player-round-form-header">
        <span className="player-name">
          {player.avatar} {player.name}
        </span>
        <span className={`points-preview ${points >= 0 ? 'positive' : 'negative'}`}>
          {points >= 0 ? '+' : ''}
          {points} pt
        </span>
      </div>
      <Stepper
        label="Voorspelling"
        value={entry.predicted}
        min={0}
        max={cards}
        onChange={(v) => onChange(player.id, 'predicted', v)}
      />
      <Stepper
        label="Behaalde slagen"
        value={entry.taken}
        min={0}
        max={cards}
        onChange={(v) => onChange(player.id, 'taken', v)}
      />
    </div>
  );
}
