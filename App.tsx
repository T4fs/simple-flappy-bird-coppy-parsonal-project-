import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState } from './types';
import { getGameOverMessage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  
  // A trigger to force game reset even if state is same (mostly for restarts)
  const [gameTrigger, setGameTrigger] = useState<number>(0);

  // Load High Score from local storage
  useEffect(() => {
    const saved = localStorage.getItem('flappy-genai-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleStart = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage("");
  }, []);

  const handleGameOver = useCallback(async () => {
    // Prevent multiple game over calls
    if (gameState === GameState.GAME_OVER) return;

    setGameState(GameState.GAME_OVER);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappy-genai-highscore', score.toString());
    }

    setIsLoadingAi(true);
    const message = await getGameOverMessage(score);
    setAiMessage(message);
    setIsLoadingAi(false);
  }, [score, highScore, gameState]);

  const handleRestart = useCallback(() => {
    setGameTrigger(prev => prev + 1);
    setGameState(GameState.START);
    // Automatically transition to playing if preferred, but usually START screen is better for mental reset.
    // For quick restart feel, we could go straight to PLAYING, but let's stick to START for better UX flow.
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900 relative select-none">
      <GameCanvas 
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
        gameTrigger={gameTrigger}
      />
      <UIOverlay 
        gameState={gameState}
        score={score}
        highScore={highScore}
        aiMessage={aiMessage}
        onStart={handleStart}
        onRestart={handleRestart}
        isLoadingAi={isLoadingAi}
      />
      
      {/* Footer / Credits */}
      <div className="absolute bottom-2 right-4 text-white/30 text-xs font-mono pointer-events-none">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default App;
