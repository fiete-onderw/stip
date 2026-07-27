import { useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS, TRUMP_SUIT, TRUMP_SYMBOL } from '../game/config';
import { generateId } from '../game/id';
import { totalRounds } from '../game/logic';
import type { Player } from '../game/types';
import { Stepper } from './Stepper';

interface PlayerSetupProps {
  savedNames: string[] | null;
  onStart: (players: Player[], firstDealerIndex: number) => void;
}

export function PlayerSetup({ savedNames, onStart }: PlayerSetupProps) {
  const initialCount = savedNames?.length ?? 4;
  const [count, setCount] = useState(
    Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, initialCount)),
  );
  const [names, setNames] = useState<string[]>(() => {
    const base = Array.from({ length: MAX_PLAYERS }, (_, i) => savedNames?.[i] ?? '');
    return base;
  });
  const [firstDealerIndex, setFirstDealerIndex] = useState(0);

  const activeNames = names.slice(0, count);
  const canStart = activeNames.every((name) => name.trim().length > 0);

  const updateName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    const players: Player[] = activeNames.map((name) => ({
      id: generateId(),
      name: name.trim(),
    }));
    onStart(players, Math.min(firstDealerIndex, players.length - 1));
  };

  return (
    <div className="screen player-setup">
      <h1>Boerenbridge</h1>
      <p className="subtitle">
        Troef: {TRUMP_SUIT} {TRUMP_SYMBOL} &middot; {totalRounds()} rondes
      </p>

      <Stepper
        label="Aantal spelers"
        value={count}
        min={MIN_PLAYERS}
        max={MAX_PLAYERS}
        onChange={setCount}
      />

      <div className="player-name-list">
        {Array.from({ length: count }, (_, i) => (
          <label key={i} className="player-name-field">
            <span>Speler {i + 1}</span>
            <input
              type="text"
              value={names[i] ?? ''}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Naam speler ${i + 1}`}
              maxLength={20}
            />
          </label>
        ))}
      </div>

      {count > 1 && (
        <label className="first-dealer-select">
          <span>Wie deelt de eerste ronde?</span>
          <select
            value={firstDealerIndex}
            onChange={(e) => setFirstDealerIndex(Number(e.target.value))}
          >
            {Array.from({ length: count }, (_, i) => (
              <option key={i} value={i}>
                {names[i]?.trim() || `Speler ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        className="primary-btn"
        disabled={!canStart}
        onClick={handleStart}
      >
        Start spel
      </button>
    </div>
  );
}
