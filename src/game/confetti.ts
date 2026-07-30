const COLORS = [
  'var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
  'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)',
];

// Klein confetti-buitje van CSS-gedreven deeltjes, opgeruimd na de animatie.
// Geen canvas/externe library nodig — puur voor een feestelijk momentje bij
// een exacte voorspelling of de ronde-/eindwinnaar.
export function burstConfetti(pieceCount = 24): void {
  if (typeof document === 'undefined') return;

  const overlay = document.createElement('div');
  overlay.className = 'confetti-overlay';

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const left = Math.random() * 100;
    const delay = Math.random() * 0.15;
    const duration = 1.1 + Math.random() * 0.6;
    const drift = (Math.random() - 0.5) * 80;
    const rotate = Math.random() * 360;
    const color = COLORS[i % COLORS.length];
    piece.style.left = `${left}%`;
    piece.style.background = color;
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.setProperty('--drift', `${drift}px`);
    piece.style.setProperty('--rotate', `${rotate}deg`);
    overlay.appendChild(piece);
  }

  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 2000);
}
