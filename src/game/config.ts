/**
 * Alle huisregel-parameters staan hier bij elkaar, zodat je ze makkelijk kunt
 * aanpassen zonder de rest van de code te hoeven doorspitten.
 */

// Aantal kaarten per ronde, in speelvolgorde.
//
// Zoals expliciet opgegeven: 10,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10
// (20 rondes — let op de dubbele ronde van 1 kaart in het midden, dit wijkt
// af van de "kale" 19-ronde variant 10..1..10 die in de oorspronkelijke
// prompt als interpretatie werd genoemd). Pas dit array aan als het
// rondeschema ooit moet veranderen.
export const ROUND_SCHEDULE: number[] = [
  10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;

// Troef ligt vast voor de hele sessie.
export const TRUMP_SUIT = 'Harten';
export const TRUMP_SYMBOL = '♥';

export const STORAGE_KEY = 'boerenbridge-game-state-v1';
export const PLAYER_NAMES_STORAGE_KEY = 'boerenbridge-player-names-v1';
