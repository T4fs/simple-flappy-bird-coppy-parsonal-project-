
import React, { useState } from 'react';
import { GameState, PlayerProfile, Notification, DuelState } from '../types';
import { Play, RotateCcw, Trophy, ShoppingBag, Coins, Volume2, VolumeX, Cloud, Check, Bell, Swords, User } from 'lucide-react';
import { getLeaderboard } from '../services/playerService';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  aiMessage: string;
  coins: number;
  onStart: () => void;
  onRestart: () => void;
  onOpenShop: () => void;
  isLoadingAi: boolean;
  unlockedSkin: string | null;
  playerProfile: PlayerProfile | null;
  onSync: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notifications: Notification[];
  onSetUsername: (name: string) => void;
  onStartDuel: (opponentName: string) => void;
  duelState: DuelState;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  highScore,
  aiMessage,
  coins,
  onStart,
  onRestart,
  onOpenShop,
  isLoadingAi,
  unlockedSkin,
  playerProfile,
  onSync,
  soundEnabled,
  onToggleSound,
  notifications,
  onSetUsername,
  onStartDuel,
  duelState
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [duelInput, setDuelInput] = useState('');
  const [showDuelModal, setShowDuelModal] = useState(false);

  const leaderboard = playerProfile ? getLeaderboard(playerProfile.username, highScore) : [];

  const handleUsernameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (usernameInput.trim().length > 2) {
          onSetUsername(usernameInput.trim());
      }
  };

  const handleDuelSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (duelInput.trim().length > 0) {
          onStartDuel(duelInput.trim());
          setShowDuelModal(false);
      }
  };

  // 1. Username Registration Modal
  if (!playerProfile?.username) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <User size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Who are you?</h2>
                <p className="text-slate-500 mb-6">Choose a unique username to compete, trade, and duel.</p>
                <form onSubmit={handleUsernameSubmit}>
                    <input 
                        type="text" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Enter username..."
                        className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-lg font-bold text-center mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={12}
                    />
                    <button 
                        type="submit"
                        disabled={usernameInput.length < 3}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        START JOURNEY
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center select-none font-sans">
      
      {/* Notifications Area */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-50 pointer-events-none">
        {notifications.map(notif => (
            <div key={notif.id} className="bg-slate-800/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-slate-600 animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 min-w-[250px]">
                <div className={`p-2 rounded-full ${notif.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {notif.type === 'success' ? <Coins size={16} /> : <Bell size={16} />}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">{notif.type === 'success' ? 'Success' : 'Info'}</p>
                    <p className="text-sm font-semibold">{notif.message}</p>
                </div>
            </div>
        ))}
      </div>

      {/* HUD: Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-auto z-20">
        
        {/* Player ID & Sync */}
        <div className="flex flex-col gap-2 items-start">
            <div className="bg-black/40 backdrop-blur-md text-white/80 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {playerProfile.username}
            </div>
            
            <button 
                onClick={onSync}
                disabled={playerProfile?.isSyncing}
                className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
                {playerProfile?.isSyncing ? (
                    <>
                        <Cloud size={12} className="animate-bounce" /> Syncing...
                    </>
                ) : (
                    <>
                         <Cloud size={12} /> Cloud Save
                    </>
                )}
            </button>
        </div>

        {/* Duel Score HUD */}
        {duelState.isActive && gameState === GameState.PLAYING && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-red-500/50 flex items-center gap-4 text-white font-bold">
                 <span className="text-blue-400">YOU: {score}</span>
                 <span className="text-slate-400 text-xs">VS</span>
                 <span className="text-red-400">{duelState.opponentName}: {duelState.opponentScore}</span>
            </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2 items-end">
            <div className="bg-black/40 backdrop-blur-md text-yellow-400 px-4 py-2 rounded-full font-bold border border-yellow-500/30 flex items-center gap-2 shadow-lg">
                <Coins size={20} className="fill-yellow-500" />
                {coins}
            </div>
            
            <button 
                onClick={onToggleSound}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-white/10 transition-colors"
            >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </div>
      </div>

      {/* Live Score (Hidden during Duel if HUD is enough, but keeping it for clarity) */}
      {gameState !== GameState.START && (
        <div className="absolute top-20 text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10">
          {score}
        </div>
      )}

      {/* Duel Request Modal */}
      {showDuelModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
              <div className="bg-slate-900 border border-red-500 rounded-2xl p-6 w-80 shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                          <Swords className="text-red-500" /> Challenge Player
                      </h3>
                      <button onClick={() => setShowDuelModal(false)} className="text-slate-400 hover:text-white"><User size={20} /></button>
                  </div>
                  <form onSubmit={handleDuelSubmit}>
                      <input 
                          autoFocus
                          type="text" 
                          value={duelInput} 
                          onChange={(e) => setDuelInput(e.target.value)}
                          placeholder="Opponent Username"
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg">
                          SEND DUEL REQUEST
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && !showDuelModal && (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-sm mx-4 transform transition-all border-4 border-blue-400 flex flex-col gap-4">
          <div>
            <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tighter">FLAPPY<br/>GENAI</h1>
            <p className="text-gray-500 font-medium">Press Space to Fly</p>
          </div>
          
          <div className="flex gap-2">
            <button
                onClick={onStart}
                className="flex-1 group relative flex items-center justify-center gap-2 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] active:shadow-none active:translate-y-2 transition-all"
            >
                <Play size={24} className="fill-current" />
                <span className="text-xl">PLAY</span>
            </button>
            <button
                onClick={() => setShowDuelModal(true)}
                className="w-16 group relative flex items-center justify-center bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] hover:shadow-[0_3px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 transition-all"
            >
                <Swords size={24} />
            </button>
          </div>

          <button
            onClick={onOpenShop}
            className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-2xl shadow-[0_4px_0_rgb(107,33,168)] hover:shadow-[0_2px_0_rgb(107,33,168)] active:shadow-none active:translate-y-1 transition-all"
          >
            <ShoppingBag size={24} />
            <span className="text-lg">AUCTION HOUSE</span>
          </button>
          
          {/* Simulated Multiplayer Leaderboard */}
          <div className="mt-4 bg-slate-100 rounded-xl p-3 border border-slate-200">
             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2 border-b border-slate-200 pb-1">
                 <Trophy size={12} /> Global Leaderboard
             </div>
             <div className="space-y-1">
                 {leaderboard.map((entry, idx) => (
                     <div key={idx} className={`flex justify-between text-sm ${entry.name === playerProfile?.username ? 'text-blue-600 font-bold bg-blue-50 rounded px-1' : 'text-slate-600'}`}>
                         <span>#{idx + 1} {entry.name}</span>
                         <span>{entry.score}</span>
                     </div>
                 ))}
             </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-md mx-4 animate-in fade-in zoom-in duration-300 border-4 border-red-400 flex flex-col gap-4">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">GAME OVER</h2>
          
          {duelState.isActive && (
              <div className={`p-4 rounded-xl border-4 ${score > duelState.opponentScore ? 'bg-green-100 border-green-400 text-green-700' : score < duelState.opponentScore ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-100 border-gray-400 text-gray-700'}`}>
                  <h3 className="text-2xl font-black uppercase">
                      {score > duelState.opponentScore ? 'YOU WON!' : score < duelState.opponentScore ? 'YOU LOST!' : 'DRAW!'}
                  </h3>
                  <p className="text-sm font-bold opacity-75">
                      {score} vs {duelState.opponentScore} ({duelState.opponentName})
                  </p>
              </div>
          )}
          
          {unlockedSkin && (
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-100 p-3 rounded-xl border-2 border-yellow-400 animate-bounce">
                <p className="text-yellow-800 font-bold uppercase text-xs">New Unlock!</p>
                <p className="text-yellow-900 font-black text-lg">{unlockedSkin}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <div className="bg-orange-100 p-4 rounded-xl border-2 border-orange-200 flex-1">
              <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Score</p>
              <p className="text-4xl font-black text-orange-500">{score}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-200 flex-1">
              <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider mb-1">Best</p>
              <p className="text-4xl font-black text-yellow-500">{highScore}</p>
            </div>
          </div>

          <div className="min-h-[40px] flex items-center justify-center">
            {isLoadingAi ? (
                <div className="flex gap-2 justify-center items-center text-blue-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
            ) : (
                <p className="text-slate-600 italic font-medium leading-relaxed text-sm">"{aiMessage}"</p>
            )}
          </div>

          <div className="flex gap-3">
             <button
                onClick={onRestart}
                className="flex-1 group flex items-center justify-center gap-2 bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] hover:shadow-[0_3px_0_rgb(29,78,216)] active:shadow-none active:translate-y-2 transition-all"
            >
                <RotateCcw size={24} />
                <span className="text-xl">RETRY</span>
            </button>
            
            <button
                onClick={onOpenShop}
                className="group flex items-center justify-center gap-2 bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-bold py-4 px-4 rounded-2xl shadow-[0_6px_0_rgb(30,41,59)] hover:shadow-[0_3px_0_rgb(30,41,59)] active:shadow-none active:translate-y-2 transition-all"
            >
                <ShoppingBag size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
