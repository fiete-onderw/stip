import { seriesColor } from '../game/colors';
import { rankedStandings } from '../game/logic';
import type { GameState } from '../game/types';
import { ScoreChart } from './ScoreChart';

interface FinalScreenProps {
  state: GameState;
  onNewGame: () => void;
}

export function FinalScreen({ state, onNewGame }: FinalScreenProps) {
  const standings = rankedStandings(state);
  const winner = standings[0];
  const playerIndexById = new Map(state.players.map((p, i) => [p.id, i]));

  return (
    <div className="screen final-screen">
      <div className="winner-banner">
        <span className="trophy" aria-hidden="true">
          🏆
        </span>
        <span>Winnaar</span>
        <span className="winner-name">{winner?.player.name}</span>
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
                {player.name}
              </td>
              <td>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ScoreChart state={state} />

      <div className="button-row">
        <button type="button" className="primary-btn" onClick={onNewGame}>
          Nieuw spel
        </button>
      </div>
    </div>
  );
}
