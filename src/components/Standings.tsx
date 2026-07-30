import { seriesColor } from '../game/colors';
import { rankDeltas, rankedStandings, totalRounds } from '../game/logic';
import type { GameState } from '../game/types';
import { RankArrow } from './RankArrow';
import { ScoreChart } from './ScoreChart';

interface StandingsProps {
  state: GameState;
  onClose: () => void;
}

export function Standings({ state, onClose }: StandingsProps) {
  const standings = rankedStandings(state);
  const playerIndexById = new Map(state.players.map((p, i) => [p.id, i]));
  const deltas = rankDeltas(state);

  return (
    <div className="screen">
      <button type="button" className="link-btn" onClick={onClose}>
        &larr; Terug naar ronde
      </button>
      <h2>Tussenstand</h2>
      <p className="subtitle">
        Na ronde {state.currentRoundIndex} van {totalRounds(state)}
      </p>

      <ScoreChart state={state} />

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
                <RankArrow delta={deltas.get(player.id) ?? 0} />
              </td>
              <td>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
