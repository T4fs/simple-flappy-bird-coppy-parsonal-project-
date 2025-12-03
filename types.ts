export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface PipeData {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GameDimensions {
  width: number;
  height: number;
}
