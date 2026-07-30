import { cardsInRound, calculatePoints } from '../game/logic';
import type { GameState } from '../game/types';

interface RoundHistoryScreenProps {
  state: GameState;
  onClose: () => void;
}

export function RoundHistoryScreen({ state, onClose }: RoundHistoryScreenProps) {
  const roundIndices = Object.keys(state.rounds)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="screen">
      <button type="button" className="link-btn" onClick={onClose}>
        &larr; Terug naar ronde
      </button>
      <h2>Eerdere rondes</h2>

      {roundIndices.length === 0 && (
        <p className="chart-empty">Nog geen rondes afgerond deze sessie.</p>
      )}

      <div className="round-history-list">
        {roundIndices.map((roundIndex) => {
          const entries = state.rounds[roundIndex];
          const cards = cardsInRound(state, roundIndex);
          return (
            <div key={roundIndex} className="round-history-card">
              <div className="round-history-card-title">
                Ronde {roundIndex + 1} — {cards} {cards === 1 ? 'kaart' : 'kaarten'}
              </div>
              <table className="round-history-table">
                <thead>
                  <tr>
                    <th>Speler</th>
                    <th>Voorsp.</th>
                    <th>Slagen</th>
                    <th>Punten</th>
                  </tr>
                </thead>
                <tbody>
                  {state.players.map((player) => {
                    const entry = entries[player.id] ?? { predicted: 0, taken: 0 };
                    const points = calculatePoints(entry.predicted, entry.taken);
                    return (
                      <tr key={player.id}>
                        <td>
                          {player.avatar} {player.name}
                        </td>
                        <td>{entry.predicted}</td>
                        <td>{entry.taken}</td>
                        <td className={points >= 0 ? 'positive' : 'negative'}>
                          {points >= 0 ? '+' : ''}
                          {points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
