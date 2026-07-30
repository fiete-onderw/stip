interface RankArrowProps {
  // Positief = gestegen t.o.v. de vorige ronde, negatief = gedaald, 0 = geen wijziging/onbekend.
  delta: number;
}

export function RankArrow({ delta }: RankArrowProps) {
  if (delta === 0) return null;
  const up = delta > 0;
  return (
    <span
      className={`rank-arrow ${up ? 'rank-up' : 'rank-down'}`}
      aria-label={up ? `${delta} plaats(en) gestegen` : `${Math.abs(delta)} plaats(en) gedaald`}
    >
      {up ? '↑' : '↓'}
      {Math.abs(delta) > 1 ? Math.abs(delta) : ''}
    </span>
  );
}
