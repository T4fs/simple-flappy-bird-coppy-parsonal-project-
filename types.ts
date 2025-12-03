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

export interface Skin {
  id: string;
  name: string;
  bodyColor: string;
  wingColor: string;
  eyeColor: string;
  beakColor: string;
  border: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number; // Base value
}

export interface Theme {
  id: string;
  name: string;
  skyGradient: [string, string];
  pipeColor: string;
  pipeBorder: string;
  groundColor: string;
  groundStripes: string;
  unlockScore: number;
}

export interface AuctionListing {
  id: string;
  skinId: string;
  price: number;
  sellerName: string;
  expiresAt: number;
}
