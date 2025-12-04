
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import AuctionHouse from './components/AuctionHouse';
import { GameState, PlayerProfile, AuctionListing, Notification, DuelState, Skin } from './types';
import { getGameOverMessage, generateUniqueSkin } from './services/geminiService';
import { audioService } from './services/audioService';
import { getStoredUsername, setStoredUsername, syncToGoogleDrive } from './services/playerService';
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
  const [customSkins, setCustomSkins] = useState<Record<string, Skin>>({});
  
  // Market & Multiplayer State
  const [marketListings, setMarketListings] = useState<AuctionListing[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Duel State
  const [duelState, setDuelState] = useState<DuelState>({
      isActive: false,
      opponentName: '',
      opponentScore: 0,
      status: 'pending'
  });
  
  // UI State
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUnlockedSkinName, setLastUnlockedSkinName] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Refs for Intervals
  const duelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- MERGED SKINS ---
  const allSkins = useMemo(() => {
    return { ...SKINS, ...customSkins };
  }, [customSkins]);

  // --- HELPERS ---

  const addNotification = (message: string, type: 'success' | 'info' | 'error') => {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  };

  const generateRandomListing = (): AuctionListing => {
    // Only bot listings from standard skins
    const skinKeys = Object.keys(SKINS).filter(k => k !== 'default');
    const randomSkinKey = skinKeys[Math.floor(Math.random() * skinKeys.length)];
    const skin = SKINS[randomSkinKey];
    const randomPrice = Math.floor(skin.price * (0.8 + Math.random() * 0.7));
    const randomUsernames = ['FlapMaster', 'Birdy88', 'SkyHigh', 'WingMan', 'DrFlap', 'PixelBird', 'CloudWalker'];
    
    return {
        id: `listing-${Date.now()}-${Math.random()}`,
        skinId: randomSkinKey,
        price: randomPrice,
        sellerName: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
        expiresAt: Date.now() + 60000 + Math.random() * 300000,
        isUserListing: false
    };
  };

  // --- INIT & PERSISTENCE ---

  useEffect(() => {
    // 1. Initialize Player Profile (Username)
    const storedUsername = getStoredUsername();
    if (storedUsername) {
        setPlayerProfile({
            username: storedUsername,
            isSyncing: false,
            lastSyncedAt: null
        });
    }

    // 2. Init Audio Context
    audioService.initialize();

    // 3. Populate Market initially if empty
    setMarketListings(prev => {
        if (prev.length === 0) {
            return Array.from({ length: 8 }).map(generateRandomListing);
        }
        return prev;
    });

  }, []);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappy-genai-highscore');
    const savedCoins = localStorage.getItem('flappy-genai-coins');
    const savedInventory = localStorage.getItem('flappy-genai-inventory');
    const savedSkin = localStorage.getItem('flappy-genai-skin');
    const savedCustomSkins = localStorage.getItem('flappy-genai-custom-skins');

    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    if (savedCoins) setCoins(parseInt(savedCoins, 10));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedCustomSkins) setCustomSkins(JSON.parse(savedCustomSkins));
    
    // Defer equipped skin check until after custom skins load (useEffect dep)
    if (savedSkin) setEquippedSkinId(savedSkin);

  }, []);

  // --- AUTO SAVE ---
  const saveGameData = useCallback(async () => {
      // Local Storage
      localStorage.setItem('flappy-genai-coins', coins.toString());
      localStorage.setItem('flappy-genai-inventory', JSON.stringify(inventory));
      localStorage.setItem('flappy-genai-skin', equippedSkinId);
      localStorage.setItem('flappy-genai-custom-skins', JSON.stringify(customSkins));
      
      // Cloud Sync (Auto)
      if (playerProfile) {
          setPlayerProfile(p => p ? ({ ...p, isSyncing: true }) : null);
          const gameData = { coins, inventory, highScore, equippedSkinId, customSkins };
          await syncToGoogleDrive(gameData);
          setPlayerProfile(p => p ? ({ ...p, isSyncing: false, lastSyncedAt: Date.now() }) : null);
      }
  }, [coins, inventory, equippedSkinId, customSkins, highScore, playerProfile?.username]);

  // Trigger auto-save on major state changes
  useEffect(() => {
      const timer = setTimeout(() => {
          saveGameData();
      }, 2000); // Debounce saves
      return () => clearTimeout(timer);
  }, [coins, inventory, equippedSkinId, customSkins, highScore]);


  // --- ECONOMY SIMULATION ENGINE (Player vs NPC) ---
  
  useEffect(() => {
    const interval = setInterval(() => {
        setMarketListings(currentListings => {
            const now = Date.now();
            let newListings = [...currentListings];

            // 1. Remove expired listings
            newListings = newListings.filter(l => l.expiresAt > now);

            // 2. Simulate "Real Players" buying User Listings
            // Note: NPC Quick Sells happen instantly. This logic handles the "Auction House".
            // Since there is no real backend, we simulate other players buying your items.
            // Expensive items sell slower.
            const userListings = newListings.filter(l => l.isUserListing);
            
            if (userListings.length > 0) {
                userListings.forEach(listing => {
                    const skin = allSkins[listing.skinId];
                    if (!skin) return;

                    // Probability Calculation:
                    // Cheaper items sell faster. Expensive items sell slower.
                    // Base chance per 3s tick = 2%
                    let sellChance = 0.02;
                    if (listing.price < 500) sellChance = 0.15; // 15%
                    else if (listing.price < 2000) sellChance = 0.08; // 8%
                    else if (listing.price > 10000) sellChance = 0.005; // 0.5% (Very rare for players to have this much cash)

                    if (Math.random() < sellChance) {
                        newListings = newListings.filter(l => l.id !== listing.id);
                        setCoins(c => c + listing.price);
                        
                        // Generate a fake buyer name
                        const buyers = ['xX_Slayer_Xx', 'CryptoKing', 'LunaLove', 'SpeedRunner01', 'RichieRich', 'Collector99'];
                        const buyer = buyers[Math.floor(Math.random() * buyers.length)];
                        
                        addNotification(`Player ${buyer} bought your ${skin.name}!`, 'success');
                        audioService.playScore();
                    }
                });
            }

            // 3. Add new Bot listings if market is low
            if (newListings.length < 12 && Math.random() < 0.3) {
                newListings.push(generateRandomListing());
            }

            return newListings;
        });
    }, 3000); // Run simulation every 3 seconds

    return () => clearInterval(interval);
  }, [allSkins]);

  // --- DUEL LOGIC ---
  useEffect(() => {
      if (gameState === GameState.PLAYING && duelState.isActive && duelState.status === 'active') {
          duelIntervalRef.current = setInterval(() => {
              if (Math.random() > 0.4) {
                  setDuelState(prev => ({
                      ...prev,
                      opponentScore: prev.opponentScore + 1
                  }));
              }
          }, 1500);
      } else {
          if (duelIntervalRef.current) clearInterval(duelIntervalRef.current);
      }

      return () => {
          if (duelIntervalRef.current) clearInterval(duelIntervalRef.current);
      }
  }, [gameState, duelState.isActive, duelState.status]);


  // --- GAME HANDLERS ---

  const handleSetUsername = (name: string) => {
      setStoredUsername(name);
      setPlayerProfile({
          username: name,
          isSyncing: false,
          lastSyncedAt: null
      });
  };

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
        const next = !prev;
        audioService.toggleMute(!next);
        return next;
    });
  }, []);

  const handleStart = useCallback(() => {
    audioService.initialize();
    audioService.playJump();
    
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage("");
    setLastUnlockedSkinName(null);
    setCurrentThemeId('day'); 
    
    if (duelState.isActive && duelState.status === 'accepted') {
        setDuelState(prev => ({ ...prev, status: 'active', opponentScore: 0 }));
    } else {
        setDuelState({ isActive: false, opponentName: '', opponentScore: 0, status: 'pending' });
    }

  }, [duelState.isActive, duelState.status]);

  const handleStartDuel = (opponentName: string) => {
      addNotification(`Sending duel request to ${opponentName}...`, 'info');
      setTimeout(() => {
          addNotification(`${opponentName} accepted the duel!`, 'success');
          setDuelState({
              isActive: true,
              opponentName: opponentName,
              opponentScore: 0,
              status: 'accepted'
          });
      }, 2000);
  };

  const handleGameOver = useCallback(async () => {
    if (gameState === GameState.GAME_OVER) return;

    audioService.playDie();
    setGameState(GameState.GAME_OVER);
    
    setCoins(prev => prev + score);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappy-genai-highscore', score.toString());
    }

    setIsLoadingAi(true);

    // 1. Check for Exclusive Skin Unlock (Score > 100)
    if (score > 100) {
        setAiMessage("Wait... YOU PASSED 100? Generating a 1-of-1 Mythic Skin...");
        
        // Generate Unique Skin
        const newSkin = await generateUniqueSkin(score);
        
        if (newSkin) {
            setCustomSkins(prev => ({ ...prev, [newSkin.id]: newSkin }));
            setInventory(prev => [...prev, newSkin.id]);
            setLastUnlockedSkinName(newSkin.name);
            setAiMessage(`UNBELIEVABLE! You unlocked a world-unique skin: ${newSkin.name}`);
            addNotification("Exclusive 1-of-1 Skin Generated!", 'success');
            setIsLoadingAi(false);
            return; // Exit early so we don't overwrite the message
        }
    }

    // 2. Standard AI Message
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
    
    let newUnlock = null;
    if (themeId === 'sunset' && !inventory.includes('red')) {
        newUnlock = 'red';
    } else if (themeId === 'night' && !inventory.includes('blue')) {
        newUnlock = 'blue';
    }

    if (newUnlock) {
        setInventory(prev => [...prev, newUnlock]);
        setLastUnlockedSkinName(SKINS[newUnlock].name);
        audioService.playScore(); 
    }

  }, [inventory]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore > 0) audioService.playScore();
  }, []);

  // --- SHOP HANDLERS ---

  const handleBuyListing = (listingId: string) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;
    const skinName = allSkins[listing.skinId]?.name || "Item";

    if (coins >= listing.price) {
        setCoins(prev => prev - listing.price);
        if (!inventory.includes(listing.skinId)) {
            setInventory(prev => [...prev, listing.skinId]);
        }
        setMarketListings(prev => prev.filter(l => l.id !== listingId));
        audioService.playScore();
        addNotification(`Bought ${skinName}!`, 'success');
    }
  };

  const handleListSkin = (skinId: string, price: number) => {
      if (!inventory.includes(skinId)) return;
      
      const skinName = allSkins[skinId]?.name || "Item";

      // Remove from inventory
      setInventory(prev => prev.filter(id => id !== skinId));
      if (equippedSkinId === skinId) setEquippedSkinId('default');

      // Add to market (Simulated Online Market)
      const newListing: AuctionListing = {
          id: `user-${Date.now()}`,
          skinId,
          price,
          sellerName: playerProfile?.username || 'You',
          expiresAt: Date.now() + 1000 * 60 * 10, // 10 mins
          isUserListing: true
      };
      
      setMarketListings(prev => [newListing, ...prev]);
      addNotification(`Listed ${skinName} for ${price}`, 'info');
  };

  const handleQuickSell = (skinId: string, price: number) => {
      if (skinId === 'default') return;
      if (inventory.includes(skinId)) {
          // Instant NPC sale
          setCoins(prev => prev + price);
          setInventory(prev => prev.filter(id => id !== skinId));
          if (equippedSkinId === skinId) setEquippedSkinId('default');
          
          const skinName = allSkins[skinId]?.name || "Item";
          audioService.playScore();
          addNotification(`Sold ${skinName} to NPC for ${price}`, 'success');
      }
  };

  const handleEquipSkin = (skinId: string) => {
      if (inventory.includes(skinId)) {
          setEquippedSkinId(skinId);
      }
  };

  const handleGiftSkin = (skinId: string, recipient: string) => {
      if (inventory.includes(skinId)) {
          setInventory(prev => prev.filter(id => id !== skinId));
          if (equippedSkinId === skinId) setEquippedSkinId('default');
          
          const skinName = allSkins[skinId]?.name || "Item";
          audioService.playScore();
          addNotification(`Sent ${skinName} to ${recipient}!`, 'success');
      }
  };

  // --- SYNC ---
  const handleSyncToDrive = async () => {
      saveGameData();
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900 relative select-none">
      <GameCanvas 
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
        onThemeChange={handleThemeChange}
        gameTrigger={gameTrigger}
        currentSkin={allSkins[equippedSkinId] || SKINS['default']}
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
            notifications={notifications}
            onSetUsername={handleSetUsername}
            onStartDuel={handleStartDuel}
            duelState={duelState}
        />
      )}

      <AuctionHouse 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        inventory={inventory}
        equippedSkinId={equippedSkinId}
        listings={marketListings}
        skinMap={allSkins}
        onBuyListing={handleBuyListing}
        onListSkin={handleListSkin}
        onQuickSell={handleQuickSell}
        onEquip={handleEquipSkin}
        onGift={handleGiftSkin}
      />
      
      <div className="absolute bottom-2 right-4 text-white/30 text-xs font-mono pointer-events-none z-10 flex flex-col items-end">
        <span>Powered by Gemini 2.5 Flash</span>
      </div>
    </div>
  );
};

export default App;
