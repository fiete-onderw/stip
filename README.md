# Boerenbridge Scorebijhouder

Mobielvriendelijke PWA om de score bij te houden tijdens het spelen van
Boerenbridge. React + TypeScript + Vite.

## Huisregels

- 3 tot 8 spelers, namen en avatar instelbaar bij de start.
- Troef ligt vast op Harten voor de hele sessie.
- Rondeschema (aantal kaarten per ronde): dynamisch berekend uit het
  aantal spelers — maximum = `floor(52 / aantal spelers)`, rondes lopen op
  van 1 kaart naar dat maximum en weer af naar 1 kaart (de piek komt maar
  één keer voor). De kaarten die overblijven (`52 mod aantal spelers`)
  worden die sessie bewust niet gedeeld. Zie `computeRoundSchedule()` in
  `src/game/logic.ts`.
- Puntentelling: juiste voorspelling = 5 + behaalde slagen; foute voorspelling
  = min het verschil tussen voorspeld en behaald.

Zie `src/game/config.ts` voor alle instelbare parameters (min/max aantal
spelers, troefkleur, avatarkeuzes, biedtimer-opties).

## Features

- Score invullen per ronde met +/- steppers, bied-/uitkomvolgorde, deler.
- Tussenstand met lijngrafiek en rangorde-pijltjes (↑/↓ t.o.v. vorige ronde).
- Eerdere rondes terugkijken binnen de sessie.
- Ronde-wrapped na elke ronde (beste voorspelling, grootste miskleun,
  ronde-koning, stijger van de ronde, streak) met confetti/geluid bij een
  exacte voorspelling.
- Eind-wrapped na de laatste ronde (Meest Nostradamus, Grootste gok,
  Comeback van de avond, IJzeren zenuwen, volledige scoregrafiek).
- All-time klassement over meerdere speelavonden + hoofd-tegen-hoofd
  vergelijking tussen twee spelers (`src/components/AllTimeHistoryScreen.tsx`).
- Optionele passieve biedtimer (15-20s, puur informatief).

## Ontwikkelen

```bash
npm install
npm run dev       # dev server
npm run build     # productie build + PWA service worker
npm run preview   # productie build lokaal bekijken
npm run lint
```

Spelstand wordt opgeslagen in localStorage, zodat een sessie een
paginaverversing overleeft. Afgeronde sessies worden ook bewaard voor het
all-time klassement (`boerenbridge-history-v1`).

De map `docs/` bevat een kant-en-klare build (relatieve asset-paths) zodat
de app direct — zonder GitHub Pages-instellingen — bereikbaar is via een
raw-file CDN zoals raw.githack.com. Na een codewijziging: `npm run build`
en de inhoud van `dist/` naar `docs/` kopiëren.

## Stretch goal: sync tussen meerdere telefoons

Nog niet geïmplementeerd. Kan later via Supabase realtime (players/rounds
tabellen + subscriptions) worden toegevoegd zodat iedereen op zijn eigen
scherm meekijkt.
