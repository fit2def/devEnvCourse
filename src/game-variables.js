'use strict';


let vars = {
  const TILE_SIZE = 64;
  const PLAYER_TEAM = 'Green';
  const ENEMY_TEAM = 'Red';
  OVERVIEW : 0,
  MOVEUNIT : 0,
  WAITFIRE = 2,
  ENEMIES_TURN = 3,
  state = OVERVIEW,
  moveStart = undefed,
  instructLabel = undefined,
  activeBoard = undefined
}
let OVERVIEW = 0;
let MOVEUNIT = 1;
let WAITFIRE = 2;
let ENEMIES_TURN = 3;
let state = OVERVIEW;
let moveStart = undefined;
let instructLabel = undefined;
let activeBoard = undefined;

export function(){
  return state;
};
