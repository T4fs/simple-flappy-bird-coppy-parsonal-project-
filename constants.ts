import { Skin, Theme } from './types';

export const GRAVITY = 0.5;
export const JUMP_STRENGTH = -8;
export const PIPE_SPEED = 3;
export const PIPE_SPAWN_RATE = 100; // Frames between spawns
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 170;
export const BIRD_RADIUS = 18; // Hitbox radius
export const GROUND_HEIGHT = 100;

export const SKINS: Record<string, Skin> = {
  default: {
    id: 'default',
    name: 'Classic Yellow',
    bodyColor: '#eab308',
    wingColor: '#fef08a',
    eyeColor: '#ffffff',
    beakColor: '#f97316',
    border: '#a16207',
    rarity: 'common',
    price: 50
  },
  red: {
    id: 'red',
    name: 'Ruby Red',
    bodyColor: '#ef4444',
    wingColor: '#fca5a5',
    eyeColor: '#ffffff',
    beakColor: '#fcd34d',
    border: '#991b1b',
    rarity: 'common',
    price: 75
  },
  blue: {
    id: 'blue',
    name: 'Azure Sky',
    bodyColor: '#3b82f6',
    wingColor: '#93c5fd',
    eyeColor: '#ffffff',
    beakColor: '#fbbf24',
    border: '#1e40af',
    rarity: 'rare',
    price: 150
  },
  green: {
    id: 'green',
    name: 'Toxic Green',
    bodyColor: '#22c55e',
    wingColor: '#86efac',
    eyeColor: '#fee2e2', // red tint eyes
    beakColor: '#1e293b',
    border: '#14532d',
    rarity: 'rare',
    price: 150
  },
  purple: {
    id: 'purple',
    name: 'Void Walker',
    bodyColor: '#9333ea',
    wingColor: '#d8b4fe',
    eyeColor: '#a855f7',
    beakColor: '#4c1d95',
    border: '#581c87',
    rarity: 'epic',
    price: 300
  },
  robot: {
    id: 'robot',
    name: 'Mecha-Bird',
    bodyColor: '#94a3b8',
    wingColor: '#cbd5e1',
    eyeColor: '#ef4444', // Red laser eye
    beakColor: '#475569',
    border: '#334155',
    rarity: 'legendary',
    price: 800
  },
  gold: {
    id: 'gold',
    name: 'Midas Touch',
    bodyColor: '#fcd34d',
    wingColor: '#fffbeb',
    eyeColor: '#451a03',
    beakColor: '#f59e0b',
    border: '#b45309',
    rarity: 'legendary',
    price: 1000
  }
};

export const THEMES: Record<string, Theme> = {
  day: {
    id: 'day',
    name: 'Daylight',
    skyGradient: ['#60a5fa', '#dbeafe'],
    pipeColor: '#22c55e',
    pipeBorder: '#15803d',
    groundColor: '#d1d5db',
    groundStripes: '#9ca3af',
    unlockScore: 0
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Blvd',
    skyGradient: ['#c026d3', '#fb923c'],
    pipeColor: '#ea580c',
    pipeBorder: '#9a3412',
    groundColor: '#fed7aa',
    groundStripes: '#fdba74',
    unlockScore: 10
  },
  night: {
    id: 'night',
    name: 'Midnight City',
    skyGradient: ['#0f172a', '#312e81'],
    pipeColor: '#1e293b',
    pipeBorder: '#020617',
    groundColor: '#1e293b',
    groundStripes: '#334155',
    unlockScore: 20
  },
  matrix: {
    id: 'matrix',
    name: 'The Grid',
    skyGradient: ['#000000', '#022c22'],
    pipeColor: '#000000',
    pipeBorder: '#22c55e',
    groundColor: '#000000',
    groundStripes: '#14532d',
    unlockScore: 40
  }
};
