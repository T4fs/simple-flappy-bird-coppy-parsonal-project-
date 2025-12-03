import React from 'react';
import { GameState } from '../types';
import { Play, RotateCcw, Trophy, ShoppingBag, Coins } from 'lucide-react';

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
  unlockedSkin
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center select-none font-sans">
      
      {/* Coin Counter (Top Right) */}
      <div className="absolute top-4 right-4 pointer-events-auto bg-black/40 backdrop-blur-md text-yellow-400 px-4 py-2 rounded-full font-bold border border-yellow-500/30 flex items-center gap-2 shadow-lg z-20">
        <Coins size={20} className="fill-yellow-500" />
        {coins}
      </div>

      {/* Live Score */}
      {gameState !== GameState.START && (
        <div className="absolute top-10 text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10">
          {score}
        </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-sm mx-4 transform transition-all border-4 border-blue-400 flex flex-col gap-4">
          <div>
            <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tighter">FLAPPY<br/>GENAI</h1>
            <p className="text-gray-500 font-medium">Press Space to Fly</p>
          </div>
          
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] active:shadow-none active:translate-y-2 transition-all"
          >
            <Play size={32} className="fill-current" />
            <span className="text-2xl">PLAY</span>
          </button>

          <button
            onClick={onOpenShop}
            className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-2xl shadow-[0_4px_0_rgb(107,33,168)] hover:shadow-[0_2px_0_rgb(107,33,168)] active:shadow-none active:translate-y-1 transition-all"
          >
            <ShoppingBag size={24} />
            <span className="text-lg">AUCTION HOUSE</span>
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-md mx-4 animate-in fade-in zoom-in duration-300 border-4 border-red-400 flex flex-col gap-4">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">GAME OVER</h2>
          
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
