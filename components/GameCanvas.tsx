import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, PipeData, Skin, Theme } from '../types';
import { 
  GRAVITY, JUMP_STRENGTH, PIPE_SPEED, PIPE_SPAWN_RATE, 
  PIPE_WIDTH, PIPE_GAP, BIRD_RADIUS, GROUND_HEIGHT, THEMES
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  onThemeChange: (themeId: string) => void;
  gameTrigger: number;
  currentSkin: Skin;
  currentTheme: Theme;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onScoreUpdate, 
  onGameOver,
  onThemeChange,
  gameTrigger,
  currentSkin,
  currentTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef<number>(0);
  const animationFrameId = useRef<number>(0);
  
  // Game Entities Refs
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
        e.preventDefault();
        jump();
    }

    const handleClick = () => {
        jump();
    }

    window.addEventListener('keydown', handleKeyDown);
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
    gradient.addColorStop(0, currentTheme.skyGradient[0]); 
    gradient.addColorStop(1, currentTheme.skyGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // --- Update Physics (Only if Playing) ---
    if (gameState === GameState.PLAYING) {
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

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

      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Collision Logic
        const birdLeft = width / 2 - BIRD_RADIUS;
        const birdRight = width / 2 + BIRD_RADIUS;
        const birdTop = birdY.current - BIRD_RADIUS;
        const birdBottom = birdY.current + BIRD_RADIUS;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
           if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
             onGameOver();
           }
        }

        // Score Update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          score.current += 1;
          onScoreUpdate(score.current);
          
          // Check for dynamic theme changes
          Object.values(THEMES).forEach(theme => {
            if (theme.unlockScore === score.current && theme.id !== currentTheme.id) {
                onThemeChange(theme.id);
            }
          });
        }
      });

      pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > -50);

      if (birdY.current + BIRD_RADIUS >= playAreaHeight || birdY.current - BIRD_RADIUS <= 0) {
        onGameOver();
      }
    }

    // --- Draw Pipes ---
    pipes.current.forEach(pipe => {
      ctx.fillStyle = currentTheme.pipeColor;
      ctx.strokeStyle = currentTheme.pipeBorder;
      ctx.lineWidth = 2;

      // Top
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

      // Bottom
      const bottomPipeY = pipe.topHeight + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, height - bottomPipeY - GROUND_HEIGHT);
      ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, height - bottomPipeY - GROUND_HEIGHT);
      
      // Highlights
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight); 
      ctx.fillRect(pipe.x + 5, bottomPipeY, 10, height - bottomPipeY - GROUND_HEIGHT);
    });

    // --- Draw Ground ---
    ctx.fillStyle = currentTheme.groundColor;
    ctx.fillRect(0, playAreaHeight, width, GROUND_HEIGHT);
    
    ctx.fillStyle = currentTheme.groundStripes;
    const stripeWidth = 20;
    let offset = 0;
    if (gameState === GameState.PLAYING) {
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
    
    ctx.fillStyle = currentTheme.pipeBorder; // Dark border on ground
    ctx.fillRect(0, playAreaHeight, width, 4);


    // --- Draw Bird (Dynamic Skin) ---
    ctx.save();
    ctx.translate(width / 2, birdY.current);
    const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (birdVelocity.current * 0.1)));
    if (gameState === GameState.PLAYING) {
        ctx.rotate(rotation);
    }
    
    // Draw Body with Texture/Pattern
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.save();
    ctx.clip(); // Clip everything to the bird's circle

    // Base Color
    ctx.fillStyle = currentSkin.bodyColor;
    ctx.fillRect(-BIRD_RADIUS, -BIRD_RADIUS, BIRD_RADIUS * 2, BIRD_RADIUS * 2);

    // Apply Pattern
    if (currentSkin.pattern === 'gradient' && currentSkin.secondaryColor) {
        const grad = ctx.createLinearGradient(-BIRD_RADIUS, -BIRD_RADIUS, BIRD_RADIUS, BIRD_RADIUS);
        grad.addColorStop(0, currentSkin.bodyColor);
        grad.addColorStop(1, currentSkin.secondaryColor);
        ctx.fillStyle = grad;
        ctx.fillRect(-BIRD_RADIUS, -BIRD_RADIUS, BIRD_RADIUS * 2, BIRD_RADIUS * 2);
    } 
    else if (currentSkin.pattern === 'striped' && currentSkin.secondaryColor) {
        ctx.fillStyle = currentSkin.secondaryColor;
        const stripeSize = 6;
        for (let i = -BIRD_RADIUS; i < BIRD_RADIUS * 2; i += stripeSize * 2) {
            ctx.fillRect(i - BIRD_RADIUS, -BIRD_RADIUS, stripeSize, BIRD_RADIUS * 2);
        }
    }
    else if (currentSkin.pattern === 'dots' && currentSkin.secondaryColor) {
        ctx.fillStyle = currentSkin.secondaryColor;
        const dotSize = 3;
        const spacing = 8;
        for(let x = -BIRD_RADIUS; x < BIRD_RADIUS; x+= spacing) {
            for(let y = -BIRD_RADIUS; y < BIRD_RADIUS; y+= spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
    else if (currentSkin.pattern === 'checkered' && currentSkin.secondaryColor) {
        ctx.fillStyle = currentSkin.secondaryColor;
        const checkSize = 8;
        for(let x = -BIRD_RADIUS; x < BIRD_RADIUS; x+= checkSize) {
            for(let y = -BIRD_RADIUS; y < BIRD_RADIUS; y+= checkSize) {
                 if (((x + BIRD_RADIUS) / checkSize + (y + BIRD_RADIUS) / checkSize) % 2 === 0) {
                     ctx.fillRect(x, y, checkSize, checkSize);
                 }
            }
        }
    }

    ctx.restore(); // Remove clipping

    // Border
    ctx.strokeStyle = currentSkin.border;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eye
    ctx.fillStyle = currentSkin.eyeColor;
    ctx.beginPath();
    ctx.arc(6, -6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(8, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = currentSkin.beakColor;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(18, 6);
    ctx.lineTo(8, 10);
    ctx.fill();
    ctx.stroke();

    // Wing
    ctx.fillStyle = currentSkin.wingColor;
    ctx.beginPath();
    ctx.ellipse(-6, 4, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    animationFrameId.current = requestAnimationFrame(loop);
  }, [gameState, currentTheme, currentSkin, onGameOver, onScoreUpdate, onThemeChange]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [loop]);

  return (
    <canvas 
      ref={canvasRef}
      width={window.innerWidth > 480 ? 480 : window.innerWidth}
      height={window.innerHeight}
      className="block mx-auto max-w-full touch-none"
    />
  );
};

export default GameCanvas;