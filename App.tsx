import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import AuctionHouse from './components/AuctionHouse';
import { GameState } from './types';
import { getGameOverMessage } from './services/geminiService';
import { SKINS, THEMES } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [gameTrigger, setGameTrigger] = useState<number>(0);

  // Economy & Customization State
  const [coins, setCoins] = useState<number>(0);
  const [inventory, setInventory] = useState<string[]>(['default']);
  const [equippedSkinId, setEquippedSkinId] = useState<string>('default');
  const [currentThemeId, setCurrentThemeId] = useState<string>('day');
  
  // UI State
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUnlockedSkinName, setLastUnlockedSkinName] = useState<string | null>(null);

  // Load Persisted Data
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappy-genai-highscore');
    const savedCoins = localStorage.getItem('flappy-genai-coins');
    const savedInventory = localStorage.getItem('flappy-genai-inventory');
    const savedSkin = localStorage.getItem('flappy-genai-skin');

    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    if (savedCoins) setCoins(parseInt(savedCoins, 10));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedSkin && SKINS[savedSkin]) setEquippedSkinId(savedSkin);
  }, []);

  // Save Persisted Data
  useEffect(() => {
    localStorage.setItem('flappy-genai-coins', coins.toString());
    localStorage.setItem('flappy-genai-inventory', JSON.stringify(inventory));
    localStorage.setItem('flappy-genai-skin', equippedSkinId);
  }, [coins, inventory, equippedSkinId]);

  const handleStart = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage("");
    setLastUnlockedSkinName(null);
    setCurrentThemeId('day'); // Reset theme on start
  }, []);

  const handleGameOver = useCallback(async () => {
    if (gameState === GameState.GAME_OVER) return;

    setGameState(GameState.GAME_OVER);
    
    // Add Coins (1 coin per point)
    setCoins(prev => prev + score);

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
    setCurrentThemeId('day');
  }, []);

  const handleThemeChange = useCallback((themeId: string) => {
    setCurrentThemeId(themeId);
    
    // Handle Skin Unlocks based on milestones (Simulated drop logic)
    // Score 10 -> Unlock Red
    // Score 20 -> Unlock Blue
    let newUnlock = null;
    if (themeId === 'sunset' && !inventory.includes('red')) {
        newUnlock = 'red';
    } else if (themeId === 'night' && !inventory.includes('blue')) {
        newUnlock = 'blue';
    }

    if (newUnlock) {
        setInventory(prev => [...prev, newUnlock]);
        setLastUnlockedSkinName(SKINS[newUnlock].name);
    }

  }, [inventory]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  // Shop Actions
  const handleBuySkin = (skinId: string, price: number) => {
    if (coins >= price && !inventory.includes(skinId)) {
        setCoins(prev => prev - price);
        setInventory(prev => [...prev, skinId]);
    }
  };

  const handleSellSkin = (skinId: string, price: number) => {
      if (skinId === 'default') return; // Cannot sell default
      if (inventory.includes(skinId)) {
          setCoins(prev => prev + price);
          setInventory(prev => prev.filter(id => id !== skinId));
          if (equippedSkinId === skinId) {
              setEquippedSkinId('default');
          }
      }
  };

  const handleEquipSkin = (skinId: string) => {
      if (inventory.includes(skinId)) {
          setEquippedSkinId(skinId);
      }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900 relative select-none">
      <GameCanvas 
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
        onThemeChange={handleThemeChange}
        gameTrigger={gameTrigger}
        currentSkin={SKINS[equippedSkinId]}
        currentTheme={THEMES[currentThemeId]}
      />
      
      {!isShopOpen && (
        <UIOverlay 
            gameState={gameState}
            score={score}
            highScore={highScore}
            aiMessage={aiMessage}
            coins={coins}
            onStart={handleStart}
            onRestart={handleRestart}
            onOpenShop={() => setIsShopOpen(true)}
            isLoadingAi={isLoadingAi}
            unlockedSkin={lastUnlockedSkinName}
        />
      )}

      <AuctionHouse 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        inventory={inventory}
        equippedSkinId={equippedSkinId}
        onBuy={handleBuySkin}
        onSell={handleSellSkin}
        onEquip={handleEquipSkin}
      />
      
      <div className="absolute bottom-2 right-4 text-white/30 text-xs font-mono pointer-events-none z-10">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default App;
