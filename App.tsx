import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import AuctionHouse from './components/AuctionHouse';
import { GameState, PlayerProfile } from './types';
import { getGameOverMessage } from './services/geminiService';
import { audioService } from './services/audioService';
import { getPlayerIP, syncToGoogleDrive } from './services/playerService';
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
  
  // Player & System State
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // UI State
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUnlockedSkinName, setLastUnlockedSkinName] = useState<string | null>(null);

  // Initialize Services
  useEffect(() => {
    // 1. Fetch IP for "Multiplayer Registration"
    getPlayerIP().then(ip => {
      setPlayerProfile({
        ip,
        username: ip, // Use IP as username per request
        isSyncing: false,
        lastSyncedAt: null
      });
    });

    // 2. Init Audio Context (Requires user interaction usually, handled in handleStart)
    audioService.initialize();
  }, []);

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

  // Handle Audio Mute Toggle
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
        const next = !prev;
        audioService.toggleMute(!next);
        return next;
    });
  }, []);

  const handleStart = useCallback(() => {
    audioService.initialize(); // Ensure audio context is ready
    audioService.playJump(); // Feedback
    // Music logic could go here, but prompt asked for bg sound, maybe simple ambience
    // audioService.startMusic(); 
    
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage("");
    setLastUnlockedSkinName(null);
    setCurrentThemeId('day'); 
  }, []);

  const handleGameOver = useCallback(async () => {
    if (gameState === GameState.GAME_OVER) return;

    audioService.playDie();
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
    
    // Handle Skin Unlocks
    let newUnlock = null;
    if (themeId === 'sunset' && !inventory.includes('red')) {
        newUnlock = 'red';
    } else if (themeId === 'night' && !inventory.includes('blue')) {
        newUnlock = 'blue';
    }

    if (newUnlock) {
        setInventory(prev => [...prev, newUnlock]);
        setLastUnlockedSkinName(SKINS[newUnlock].name);
        audioService.playScore(); // Reuse score sound for unlock joy
    }

  }, [inventory]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore > 0) audioService.playScore(); // Play sound on point
  }, []);

  // Shop Actions
  const handleBuySkin = (skinId: string, price: number) => {
    if (coins >= price && !inventory.includes(skinId)) {
        setCoins(prev => prev - price);
        setInventory(prev => [...prev, skinId]);
        audioService.playScore();
    }
  };

  const handleSellSkin = (skinId: string, price: number) => {
      if (skinId === 'default') return;
      if (inventory.includes(skinId)) {
          setCoins(prev => prev + price);
          setInventory(prev => prev.filter(id => id !== skinId));
          if (equippedSkinId === skinId) {
              setEquippedSkinId('default');
          }
          audioService.playScore();
      }
  };

  const handleEquipSkin = (skinId: string) => {
      if (inventory.includes(skinId)) {
          setEquippedSkinId(skinId);
      }
  };

  // Google Drive Sync Handler
  const handleSyncToDrive = async () => {
      if (!playerProfile) return;
      
      setPlayerProfile(prev => prev ? ({ ...prev, isSyncing: true }) : null);
      
      const gameData = {
          coins,
          inventory,
          highScore,
          equippedSkinId
      };

      const success = await syncToGoogleDrive(gameData);
      
      setPlayerProfile(prev => prev ? ({ 
          ...prev, 
          isSyncing: false,
          lastSyncedAt: success ? Date.now() : prev.lastSyncedAt
      }) : null);
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
            playerProfile={playerProfile}
            onSync={handleSyncToDrive}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
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
      
      <div className="absolute bottom-2 right-4 text-white/30 text-xs font-mono pointer-events-none z-10 flex flex-col items-end">
        <span>Powered by Gemini 2.5 Flash</span>
      </div>
    </div>
  );
};

export default App;