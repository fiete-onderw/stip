import { useEffect } from 'react';
import { burstConfetti } from '../game/confetti';
import { cardsInRound, roundStats } from '../game/logic';
import { playMissBlip, playSuccessChime } from '../game/sound';
import type { GameState } from '../game/types';

interface RoundWrappedProps {
  state: GameState;
  roundIndex: number;
  onContinue: () => void;
}

export function RoundWrapped({ state, roundIndex, onContinue }: RoundWrappedProps) {
  const stats = roundStats(state, roundIndex);
  const cards = cardsInRound(state, roundIndex);
  const entries = state.rounds[roundIndex] ?? {};
  const hasExactHit = state.players.some((p) => {
    const e = entries[p.id];
    return e && e.predicted === e.taken;
  });

  useEffect(() => {
    if (hasExactHit) {
      burstConfetti();
      playSuccessChime();
    } else {
      playMissBlip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  const names = (players: { name: string; avatar?: string }[]) =>
    players.map((p) => `${p.avatar ?? ''} ${p.name}`.trim()).join(', ');

  return (
    <div className="screen wrapped-screen heart-pattern-bg">
      <h2>
        Ronde {roundIndex + 1} samengevat — {cards} {cards === 1 ? 'kaart' : 'kaarten'}
      </h2>

      <div className="wrapped-cards">
        {stats.bestPrediction.length > 0 && (
          <WrappedCard
            emoji="🎯"
            title="Beste voorspelling"
            body={names(stats.bestPrediction)}
          />
        )}
        {stats.worstPrediction.length > 0 && (
          <WrappedCard
            emoji="📉"
            title="Grootste miskleun"
            body={names(stats.worstPrediction)}
          />
        )}
        {stats.roundKing.length > 0 && (
          <WrappedCard emoji="👑" title="Ronde-koning" body={names(stats.roundKing)} />
        )}
        {stats.riser && (
          <WrappedCard
            emoji="🚀"
            title="Stijger van de ronde"
            body={`${stats.riser.player.avatar ?? ''} ${stats.riser.player.name} (+${stats.riser.delta} plaats${stats.riser.delta === 1 ? '' : 'en'})`}
          />
        )}
        {stats.streaks.map((s) => (
          <WrappedCard
            key={s.player.id}
            emoji="🔥"
            title="Streak"
            body={`${s.player.avatar ?? ''} ${s.player.name} zit ${s.length} rondes op rij goed`}
          />
        ))}
      </div>

      <button type="button" className="primary-btn" onClick={onContinue}>
        {state.finished ? 'Bekijk eindstand' : 'Volgende ronde'}
      </button>
    </div>
  );
}

function WrappedCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="wrapped-card">
      <span className="wrapped-card-emoji" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <div className="wrapped-card-title">{title}</div>
        <div className="wrapped-card-body">{body}</div>
      </div>
    </div>
  );
}
