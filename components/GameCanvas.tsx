import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, PipeData } from '../types';
import { 
  GRAVITY, JUMP_STRENGTH, PIPE_SPEED, PIPE_SPAWN_RATE, 
  PIPE_WIDTH, PIPE_GAP, BIRD_RADIUS, COLORS, GROUND_HEIGHT 
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  gameTrigger: number; // Used to trigger restart
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onScoreUpdate, 
  onGameOver,
  gameTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // Game Entities Refs (mutable for performance loop)
  const birdY = useRef<number>(300);
  const birdVelocity = useRef<number>(0);
  const pipes = useRef<PipeData[]>([]);
  const score = useRef<number>(0);

  // Initialize Game State
  const resetGame = useCallback(() => {
    if (canvasRef.current) {
      birdY.current = canvasRef.current.height / 2;
    } else {
        birdY.current = 300;
    }
    birdVelocity.current = 0;
    pipes.current = [];
    score.current = 0;
    frameCountRef.current = 0;
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (gameState === GameState.START) {
        resetGame();
    }
  }, [gameState, gameTrigger, resetGame]);

  // Jump Action
  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      birdVelocity.current = JUMP_STRENGTH;
    }
  }, [gameState]);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        jump();
    }

    const handleClick = () => {
        jump();
    }

    window.addEventListener('keydown', handleKeyDown);
    // Bind to canvas for touch/click to avoid bubbling issues
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.addEventListener('touchstart', handleTouch, { passive: false });
        canvas.addEventListener('mousedown', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('mousedown', handleClick);
      }
    };
  }, [jump]);

  // The Main Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const playAreaHeight = height - GROUND_HEIGHT;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // --- Draw Background ---
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#60a5fa'); // Light blue
    gradient.addColorStop(1, '#dbeafe'); // Very light blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // --- Update Physics (Only if Playing) ---
    if (gameState === GameState.PLAYING) {
      // Bird Physics
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      // Pipe Spawning
      frameCountRef.current++;
      if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = playAreaHeight - PIPE_GAP - minPipeHeight;
        const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
        
        pipes.current.push({
          x: width,
          topHeight: randomHeight,
          passed: false
        });
      }

      // Pipe Movement & Collision
      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Collision Logic
        // 1. Horizontal Hit
        const birdLeft = width / 2 - BIRD_RADIUS;
        const birdRight = width / 2 + BIRD_RADIUS;
        const birdTop = birdY.current - BIRD_RADIUS;
        const birdBottom = birdY.current + BIRD_RADIUS;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
           // Inside pipe horizontal area
           if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
             onGameOver();
           }
        }

        // Score Update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          score.current += 1;
          onScoreUpdate(score.current);
        }
      });

      // Remove off-screen pipes
      pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > -50);

      // Ground/Ceiling Collision
      if (birdY.current + BIRD_RADIUS >= playAreaHeight || birdY.current - BIRD_RADIUS <= 0) {
        onGameOver();
      }
    }

    // --- Draw Pipes ---
    pipes.current.forEach(pipe => {
      ctx.fillStyle = COLORS.pipe;
      ctx.strokeStyle = COLORS.pipeBorder;
      ctx.lineWidth = 2;

      // Top Pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

      // Bottom Pipe
      const bottomPipeY = pipe.topHeight + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, height - bottomPipeY - GROUND_HEIGHT);
      ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, height - bottomPipeY - GROUND_HEIGHT);
      
      // Pipe Cap Details
      ctx.fillStyle = '#4ade80'; // lighter green highlight
      ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight); // Top highlight
      ctx.fillRect(pipe.x + 5, bottomPipeY, 10, height - bottomPipeY - GROUND_HEIGHT); // Bottom highlight
    });

    // --- Draw Ground ---
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, playAreaHeight, width, GROUND_HEIGHT);
    // Ground stripes for movement illusion
    ctx.fillStyle = COLORS.groundStripes;
    const stripeWidth = 20;
    let offset = 0;
    if (gameState === GameState.PLAYING) {
        // Move stripes based on frame count
        offset = (frameCountRef.current * PIPE_SPEED) % (stripeWidth * 2);
    }
    for (let i = -20; i < width + 20; i += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(i - offset + 10, playAreaHeight);
      ctx.lineTo(i - offset - 10 + stripeWidth, height);
      ctx.lineTo(i - offset + stripeWidth, height);
      ctx.lineTo(i - offset + 20, playAreaHeight);
      ctx.fill();
    }
    // Top border of ground
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, playAreaHeight, width, 4);


    // --- Draw Bird ---
    ctx.save();
    ctx.translate(width / 2, birdY.current);
    // Rotate bird based on velocity
    const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (birdVelocity.current * 0.1)));
    if (gameState === GameState.PLAYING) {
        ctx.rotate(rotation);
    }
    
    // Bird Body
    ctx.fillStyle = COLORS.bird;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.birdBorder;
    ctx.stroke();

    // Bird Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(6, -6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(8, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bird Wing
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-6, 4, 10, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bird Beak
    ctx.fillStyle = '#f97316'; // Orange
    ctx.beginPath();
    ctx.moveTo(10, 2);
    ctx.lineTo(24, 8);
    ctx.lineTo(10, 14);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, onGameOver, onScoreUpdate]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
            canvasRef.current.width = parent.clientWidth;
            canvasRef.current.height = parent.clientHeight;
            // Re-center bird visually if resizing during start
            if (gameState === GameState.START) {
                birdY.current = parent.clientHeight / 2;
            }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  // Start/Stop Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none cursor-pointer"
    />
  );
};

export default GameCanvas;
