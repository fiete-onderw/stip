import { useEffect, useState } from 'react';
import type { Player } from '../game/types';

interface BidTimerProps {
  order: Player[];
  seconds: number;
  roundKey: number;
}

// Puur informatief: telt per speler (in biedvolgorde) af en schuift daarna
// door naar de volgende. Blokkeert niets — de scoreformulieren blijven
// altijd gewoon invulbaar, dit is alleen een ritmehulpje aan tafel.
export function BidTimer({ order, seconds, roundKey }: BidTimerProps) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [remaining, setRemaining] = useState(seconds);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setTurnIndex(0);
    setRemaining(seconds);
    setDone(false);
  }, [roundKey, seconds]);

  useEffect(() => {
    if (done) return;
    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) return prev - 1;
        setTurnIndex((idx) => {
          if (idx + 1 >= order.length) {
            setDone(true);
            return idx;
          }
          return idx + 1;
        });
        return seconds;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [done, order.length, seconds]);

  const restart = () => {
    setTurnIndex(0);
    setRemaining(seconds);
    setDone(false);
  };

  if (done) {
    return (
      <div className="bid-timer">
        <span>⏱ Iedereen heeft geboden</span>
        <button type="button" className="link-btn bid-timer-restart" onClick={restart}>
          Herstart
        </button>
      </div>
    );
  }

  const current = order[turnIndex];
  if (!current) return null;

  return (
    <div className="bid-timer">
      <span>
        ⏱ Aan de beurt: <strong>{current.name}</strong>
      </span>
      <span className="bid-timer-count">{remaining}s</span>
    </div>
  );
}
