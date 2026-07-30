import { useEffect } from 'react';
import { seriesColor } from '../game/colors';
import { burstConfetti } from '../game/confetti';
import { cardsInRound, rankedStandings, sessionWrappedStats } from '../game/logic';
import { playSuccessChime } from '../game/sound';
import type { GameState } from '../game/types';
import { ScoreChart } from './ScoreChart';

interface EindWrappedProps {
  state: GameState;
  onNewGame: () => void;
  onViewHistory: () => void;
}

export function EindWrapped({ state, onNewGame, onViewHistory }: EindWrappedProps) {
  const standings = rankedStandings(state);
  const winner = standings[0];
  const playerIndexById = new Map(state.players.map((p, i) => [p.id, i]));
  const wrapped = sessionWrappedStats(state);

  useEffect(() => {
    burstConfetti(40);
    playSuccessChime();
  }, []);

  return (
    <div className="screen final-screen heart-pattern-bg">
      <div className="winner-banner">
        <span className="trophy" aria-hidden="true">
          🏆
        </span>
        <span>Winnaar</span>
        <span className="winner-name">
          {winner?.player.avatar} {winner?.player.name}
        </span>
        <span>{winner?.total} punten</span>
      </div>

      <h2>Eindstand</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th></th>
            <th>Speler</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(({ player, total }, rank) => (
            <tr key={player.id}>
              <td className="rank-cell">{rank + 1}</td>
              <td className="name-cell">
                <span
                  className="series-dot"
                  style={{ background: seriesColor(playerIndexById.get(player.id) ?? 0) }}
                />
                {player.avatar} {player.name}
              </td>
              <td>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Sessie-wrapped</h2>
      <div className="wrapped-cards">
        {wrapped.nostradamus.length > 0 && (
          <WrappedCard
            emoji="🔮"
            title="Meest Nostradamus"
            body={`${wrapped.nostradamus
              .map((n) => `${n.player.avatar ?? ''} ${n.player.name}`.trim())
              .join(', ')} — ${wrapped.nostradamus[0].exactCount}× exact`}
          />
        )}
        {wrapped.boldestGuess && (
          <WrappedCard
            emoji="🎲"
            title="Grootste gok"
            body={`${wrapped.boldestGuess.player.avatar ?? ''} ${wrapped.boldestGuess.player.name} voorspelde ${wrapped.boldestGuess.predicted} van de ${wrapped.boldestGuess.cards} slagen (ronde ${wrapped.boldestGuess.roundIndex + 1}) en raakte raak`}
          />
        )}
        {wrapped.comeback && (
          <WrappedCard
            emoji="📈"
            title="Comeback van de avond"
            body={`${wrapped.comeback.player.avatar ?? ''} ${wrapped.comeback.player.name} steeg ${wrapped.comeback.delta} plaats${wrapped.comeback.delta === 1 ? '' : 'en'} in ronde ${wrapped.comeback.roundIndex + 1}`}
          />
        )}
        {wrapped.ironNerves && (
          <WrappedCard
            emoji="🧊"
            title="IJzeren zenuwen"
            body={`${wrapped.ironNerves.player.avatar ?? ''} ${wrapped.ironNerves.player.name} voorspelde 0 en haalde 0 in ronde ${wrapped.ironNerves.roundIndex + 1} (${cardsInRound(state, wrapped.ironNerves.roundIndex)} kaarten)`}
          />
        )}
      </div>

      <ScoreChart state={state} />

      <div className="button-row">
        <button type="button" className="primary-btn" onClick={onNewGame}>
          Nieuw spel
        </button>
        <button type="button" className="link-btn" onClick={onViewHistory}>
          Bekijk all-time klassement
        </button>
      </div>
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
