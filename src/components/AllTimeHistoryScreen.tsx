import { useMemo, useState } from 'react';
import { clearHistory, loadHistory } from '../game/storage';
import type { HistoryEntry } from '../game/types';

interface AllTimeHistoryScreenProps {
  onClose: () => void;
}

interface AggregatedPlayer {
  key: string;
  name: string;
  avatar?: string;
  sessions: number;
  wins: number;
  totalScore: number;
  bestScore: number;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function aggregate(history: HistoryEntry[]): AggregatedPlayer[] {
  const map = new Map<string, AggregatedPlayer>();
  for (const entry of history) {
    const winnerKey = normalizeName(entry.winnerName);
    for (const p of entry.players) {
      const key = normalizeName(p.name);
      const existing = map.get(key) ?? {
        key,
        name: p.name,
        avatar: p.avatar,
        sessions: 0,
        wins: 0,
        totalScore: 0,
        bestScore: -Infinity,
      };
      existing.name = p.name;
      existing.avatar = p.avatar ?? existing.avatar;
      existing.sessions += 1;
      existing.totalScore += p.total;
      existing.bestScore = Math.max(existing.bestScore, p.total);
      if (key === winnerKey) existing.wins += 1;
      map.set(key, existing);
    }
  }
  return [...map.values()].sort((a, b) => b.wins - a.wins || b.totalScore / b.sessions - a.totalScore / a.sessions);
}

export function AllTimeHistoryScreen({ onClose }: AllTimeHistoryScreenProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const players = useMemo(() => aggregate(history), [history]);
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  const headToHead = useMemo(() => {
    if (!playerA || !playerB || playerA === playerB) return null;
    let aWins = 0;
    let bWins = 0;
    let ties = 0;
    let aTotal = 0;
    let bTotal = 0;
    let shared = 0;
    for (const entry of history) {
      const a = entry.players.find((p) => normalizeName(p.name) === playerA);
      const b = entry.players.find((p) => normalizeName(p.name) === playerB);
      if (!a || !b) continue;
      shared++;
      aTotal += a.total;
      bTotal += b.total;
      if (a.total > b.total) aWins++;
      else if (b.total > a.total) bWins++;
      else ties++;
    }
    if (shared === 0) return null;
    return { aWins, bWins, ties, shared, aAvg: aTotal / shared, bAvg: bTotal / shared };
  }, [playerA, playerB, history]);

  const handleClear = () => {
    if (!window.confirm('Weet je zeker dat je de hele all-time geschiedenis wilt wissen?')) return;
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="screen">
      <button type="button" className="link-btn" onClick={onClose}>
        &larr; Terug
      </button>
      <h2>All-time klassement</h2>
      <p className="subtitle">Over {history.length} eerdere speelavond{history.length === 1 ? '' : 'en'}</p>

      {players.length === 0 ? (
        <p className="chart-empty">Nog geen afgeronde sessies. Speel een potje uit om hier te verschijnen.</p>
      ) : (
        <>
          <table className="standings-table">
            <thead>
              <tr>
                <th></th>
                <th>Speler</th>
                <th>Gespeeld</th>
                <th>Gewonnen</th>
                <th>Gem. score</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.key}>
                  <td className="rank-cell">{i + 1}</td>
                  <td className="name-cell">
                    {p.avatar} {p.name}
                  </td>
                  <td>{p.sessions}</td>
                  <td>{p.wins}</td>
                  <td>{Math.round((p.totalScore / p.sessions) * 10) / 10}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Hoofd-tegen-hoofd</h2>
          <div className="h2h-pickers">
            <select value={playerA} onChange={(e) => setPlayerA(e.target.value)}>
              <option value="">Speler A</option>
              {players.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
            <select value={playerB} onChange={(e) => setPlayerB(e.target.value)}>
              <option value="">Speler B</option>
              {players.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {playerA && playerB && playerA === playerB && (
            <p className="chart-empty">Kies twee verschillende spelers.</p>
          )}

          {headToHead && (
            <div className="h2h-result">
              <p>
                {headToHead.shared} gedeelde sessie{headToHead.shared === 1 ? '' : 's'} &middot;{' '}
                {headToHead.aWins} - {headToHead.bWins}
                {headToHead.ties > 0 ? ` (${headToHead.ties} gelijk)` : ''}
              </p>
              <p>
                Gem. score: {Math.round(headToHead.aAvg * 10) / 10} vs {Math.round(headToHead.bAvg * 10) / 10}
              </p>
            </div>
          )}

          <button type="button" className="danger-btn" onClick={handleClear}>
            Wis geschiedenis
          </button>
        </>
      )}
    </div>
  );
}
