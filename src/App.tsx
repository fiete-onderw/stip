import { useEffect, useState } from 'react';
import './App.css';
import { AllTimeHistoryScreen } from './components/AllTimeHistoryScreen';
import { EindWrapped } from './components/EindWrapped';
import { PlayerSetup } from './components/PlayerSetup';
import { RoundHistoryScreen } from './components/RoundHistoryScreen';
import { RoundScreen } from './components/RoundScreen';
import { RoundWrapped } from './components/RoundWrapped';
import { Standings } from './components/Standings';
import { buildHistoryEntry, totalRounds } from './game/logic';
import {
  appendHistoryEntry,
  clearGameState,
  loadGameState,
  loadSavedPlayerNames,
  saveGameState,
  saveSavedPlayerNames,
} from './game/storage';
import type { GameState, Player, RoundEntries } from './game/types';

type View =
  | 'setup'
  | 'round'
  | 'standings'
  | 'round-history'
  | 'round-wrapped'
  | 'eind-wrapped'
  | 'all-time';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('setup');
  const [savedNames, setSavedNames] = useState<string[] | null>(null);
  const [wrappedRoundIndex, setWrappedRoundIndex] = useState(0);
  const [historyReturnView, setHistoryReturnView] = useState<View>('setup');

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
      setView(saved.finished ? 'eind-wrapped' : 'round');
    }
    setSavedNames(loadSavedPlayerNames());
  }, []);

  const handleStart = (players: Player[], firstDealerIndex: number, bidTimerSeconds: number) => {
    const newState: GameState = {
      players,
      currentRoundIndex: 0,
      rounds: {},
      firstDealerIndex,
      finished: false,
      bidTimerSeconds,
    };
    saveGameState(newState);
    saveSavedPlayerNames(players.map((p) => p.name));
    setGameState(newState);
    setView('round');
  };

  const handleSubmitRound = (entries: RoundEntries) => {
    if (!gameState) return;
    const completedRoundIndex = gameState.currentRoundIndex;
    const nextRoundIndex = completedRoundIndex + 1;
    const nextState: GameState = {
      ...gameState,
      rounds: { ...gameState.rounds, [completedRoundIndex]: entries },
      currentRoundIndex: nextRoundIndex,
      finished: false,
    };
    const finished = nextRoundIndex >= totalRounds(nextState);
    nextState.finished = finished;

    saveGameState(nextState);
    setGameState(nextState);
    if (finished) {
      appendHistoryEntry(buildHistoryEntry(nextState));
    }
    setWrappedRoundIndex(completedRoundIndex);
    setView('round-wrapped');
  };

  const handleNewGame = () => {
    if (view !== 'eind-wrapped' && !window.confirm('Huidige sessie stoppen en een nieuw spel starten?')) {
      return;
    }
    clearGameState();
    setGameState(null);
    setView('setup');
  };

  const openHistory = (from: View) => {
    setHistoryReturnView(from);
    setView('all-time');
  };

  if (view === 'setup' || !gameState) {
    return (
      <PlayerSetup
        savedNames={savedNames}
        onStart={handleStart}
        onViewHistory={() => openHistory('setup')}
      />
    );
  }

  if (view === 'all-time') {
    return <AllTimeHistoryScreen onClose={() => setView(historyReturnView)} />;
  }

  if (view === 'eind-wrapped') {
    return (
      <EindWrapped
        state={gameState}
        onNewGame={handleNewGame}
        onViewHistory={() => openHistory('eind-wrapped')}
      />
    );
  }

  if (view === 'round-wrapped') {
    return (
      <RoundWrapped
        state={gameState}
        roundIndex={wrappedRoundIndex}
        onContinue={() => setView(gameState.finished ? 'eind-wrapped' : 'round')}
      />
    );
  }

  if (view === 'standings') {
    return <Standings state={gameState} onClose={() => setView('round')} />;
  }

  if (view === 'round-history') {
    return <RoundHistoryScreen state={gameState} onClose={() => setView('round')} />;
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
        onShowHistory={() => setView('round-history')}
      />
    </>
  );
}

export default App;
