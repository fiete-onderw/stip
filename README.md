# Boerenbridge Scorebijhouder

Mobielvriendelijke PWA om de score bij te houden tijdens het spelen van
Boerenbridge. React + TypeScript + Vite.

## Huisregels

- 3 tot 8 spelers, namen instelbaar bij de start.
- Troef ligt vast op Harten voor de hele sessie.
- Rondeschema (aantal kaarten per ronde): 10,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10
  — 20 rondes, inclusief de dubbele ronde van 1 kaart. Instelbaar via
  `ROUND_SCHEDULE` in `src/game/config.ts`.
- Puntentelling: juiste voorspelling = 5 + behaalde slagen; foute voorspelling
  = min het verschil tussen voorspeld en behaald.

Zie `src/game/config.ts` voor alle instelbare parameters (rondeschema,
min/max aantal spelers, troefkleur).

## Ontwikkelen

```bash
npm install
npm run dev       # dev server
npm run build     # productie build + PWA service worker
npm run preview   # productie build lokaal bekijken
npm run lint
```

Spelstand wordt opgeslagen in localStorage, zodat een sessie een paginaverversing overleeft.

## Stretch goal: sync tussen meerdere telefoons

Nog niet geïmplementeerd. Kan later via Supabase realtime (players/rounds
tabellen + subscriptions) worden toegevoegd zodat iedereen op zijn eigen
scherm meekijkt.
