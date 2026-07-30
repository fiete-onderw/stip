import { useState } from 'react';
import {
  AVATAR_OPTIONS,
  BID_TIMER_OPTIONS,
  DEFAULT_BID_TIMER_SECONDS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  TRUMP_SUIT,
  TRUMP_SYMBOL,
} from '../game/config';
import { generateId } from '../game/id';
import { computeRoundSchedule, leftoverCards, maxCardsForPlayers } from '../game/logic';
import type { Player } from '../game/types';
import { AvatarPicker } from './AvatarPicker';
import { Stepper } from './Stepper';

interface PlayerSetupProps {
  savedNames: string[] | null;
  onStart: (players: Player[], firstDealerIndex: number, bidTimerSeconds: number) => void;
  onViewHistory: () => void;
}

export function PlayerSetup({ savedNames, onStart, onViewHistory }: PlayerSetupProps) {
  const initialCount = savedNames?.length ?? 4;
  const [count, setCount] = useState(
    Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, initialCount)),
  );
  const [names, setNames] = useState<string[]>(() => {
    const base = Array.from({ length: MAX_PLAYERS }, (_, i) => savedNames?.[i] ?? '');
    return base;
  });
  const [avatars, setAvatars] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, (_, i) => AVATAR_OPTIONS[i % AVATAR_OPTIONS.length]),
  );
  const [firstDealerIndex, setFirstDealerIndex] = useState(0);
  const [bidTimerEnabled, setBidTimerEnabled] = useState(false);
  const [bidTimerSeconds, setBidTimerSeconds] = useState<number>(DEFAULT_BID_TIMER_SECONDS);

  const activeNames = names.slice(0, count);
  const canStart = activeNames.every((name) => name.trim().length > 0);

  const maxCards = maxCardsForPlayers(count);
  const totalRoundsPreview = computeRoundSchedule(count).length;
  const leftover = leftoverCards(count);

  const updateName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateAvatar = (index: number, avatar: string) => {
    setAvatars((prev) => {
      const next = [...prev];
      next[index] = avatar;
      return next;
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    const players: Player[] = activeNames.map((name, i) => ({
      id: generateId(),
      name: name.trim(),
      avatar: avatars[i],
    }));
    onStart(players, Math.min(firstDealerIndex, players.length - 1), bidTimerEnabled ? bidTimerSeconds : 0);
  };

  return (
    <div className="screen player-setup">
      <h1>Boerenbridge</h1>
      <p className="suit-divider">
        <span>♠</span>
        <span className="suit-hearts">♥</span>
        <span>♦</span>
        <span>♣</span>
      </p>
      <p className="subtitle">
        Troef: {TRUMP_SUIT} {TRUMP_SYMBOL}
      </p>
      <p className="subtitle round-schedule-preview">
        Max {maxCards} kaarten per ronde &middot; {totalRoundsPreview} rondes totaal
        {leftover > 0 ? ` · ${leftover} kaart${leftover === 1 ? '' : 'en'} blijft/blijven ongebruikt` : ''}
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
          <div key={i} className="player-name-field">
            <span>Speler {i + 1}</span>
            <div className="player-name-row">
              <AvatarPicker value={avatars[i]} onChange={(a) => updateAvatar(i, a)} />
              <input
                type="text"
                value={names[i] ?? ''}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Naam speler ${i + 1}`}
                maxLength={20}
              />
            </div>
          </div>
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

      <div className="bid-timer-setting">
        <label className="bid-timer-toggle">
          <input
            type="checkbox"
            checked={bidTimerEnabled}
            onChange={(e) => setBidTimerEnabled(e.target.checked)}
          />
          <span>Biedtimer inschakelen (optioneel)</span>
        </label>
        {bidTimerEnabled && (
          <div className="bid-timer-options">
            {BID_TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                className={`bid-timer-option ${bidTimerSeconds === sec ? 'selected' : ''}`}
                onClick={() => setBidTimerSeconds(sec)}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="primary-btn"
        disabled={!canStart}
        onClick={handleStart}
      >
        Start spel
      </button>

      <button type="button" className="link-btn" onClick={onViewHistory}>
        Bekijk all-time klassement
      </button>
    </div>
  );
}
