import { useEffect, useState } from 'react';
import './App.css';
import { FinalScreen } from './components/FinalScreen';
import { PlayerSetup } from './components/PlayerSetup';
import { RoundScreen } from './components/RoundScreen';
import { Standings } from './components/Standings';
import { totalRounds } from './game/logic';
import {
  clearGameState,
  loadGameState,
  loadSavedPlayerNames,
  saveGameState,
  saveSavedPlayerNames,
} from './game/storage';
import type { GameState, Player, RoundEntries } from './game/types';

type View = 'setup' | 'round' | 'standings' | 'final';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('setup');
  const [savedNames, setSavedNames] = useState<string[] | null>(null);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
      setView(saved.finished ? 'final' : 'round');
    }
    setSavedNames(loadSavedPlayerNames());
  }, []);

  const handleStart = (players: Player[], firstDealerIndex: number) => {
    const newState: GameState = {
      players,
      currentRoundIndex: 0,
      rounds: {},
      firstDealerIndex,
      finished: false,
    };
    saveGameState(newState);
    saveSavedPlayerNames(players.map((p) => p.name));
    setGameState(newState);
    setView('round');
  };

  const handleSubmitRound = (entries: RoundEntries) => {
    if (!gameState) return;
    const nextRoundIndex = gameState.currentRoundIndex + 1;
    const finished = nextRoundIndex >= totalRounds();
    const nextState: GameState = {
      ...gameState,
      rounds: { ...gameState.rounds, [gameState.currentRoundIndex]: entries },
      currentRoundIndex: nextRoundIndex,
      finished,
    };
    saveGameState(nextState);
    setGameState(nextState);
    setView(finished ? 'final' : 'round');
  };

  const handleNewGame = () => {
    if (view !== 'final' && !window.confirm('Huidige sessie stoppen en een nieuw spel starten?')) {
      return;
    }
    clearGameState();
    setGameState(null);
    setView('setup');
  };

  if (view === 'setup' || !gameState) {
    return <PlayerSetup savedNames={savedNames} onStart={handleStart} />;
  }

  if (view === 'final') {
    return <FinalScreen state={gameState} onNewGame={handleNewGame} />;
  }

  if (view === 'standings') {
    return <Standings state={gameState} onClose={() => setView('round')} />;
  }

  return (
    <>
      <div className="top-bar">
        <span className="top-bar-title">Boerenbridge</span>
        <button type="button" className="link-btn" onClick={handleNewGame}>
          Nieuw spel
        </button>
      </div>
      <RoundScreen
        state={gameState}
        onSubmitRound={handleSubmitRound}
        onShowStandings={() => setView('standings')}
      />
    </>
  );
}

export default App;
