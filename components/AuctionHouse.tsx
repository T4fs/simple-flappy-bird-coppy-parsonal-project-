import React, { useState, useEffect, useMemo } from 'react';
import { Skin, AuctionListing } from '../types';
import { SKINS } from '../constants';
import { Coins, ShoppingBag, Shirt, X, Gavel, User } from 'lucide-react';

interface AuctionHouseProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: string[];
  equippedSkinId: string;
  onBuy: (skinId: string, price: number) => void;
  onSell: (skinId: string, price: number) => void;
  onEquip: (skinId: string) => void;
}

const AuctionHouse: React.FC<AuctionHouseProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  equippedSkinId,
  onBuy,
  onSell,
  onEquip
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'wardrobe'>('wardrobe');
  const [marketListings, setMarketListings] = useState<AuctionListing[]>([]);
  const [sellingId, setSellingId] = useState<string | null>(null);

  // Generate fake market data when opened
  useEffect(() => {
    if (isOpen) {
      const listings: AuctionListing[] = [];
      const skinKeys = Object.keys(SKINS).filter(k => k !== 'default');
      
      // Create 5 random listings
      for (let i = 0; i < 5; i++) {
        const randomSkinKey = skinKeys[Math.floor(Math.random() * skinKeys.length)];
        const skin = SKINS[randomSkinKey];
        // Price fluctuates between 80% and 150% of base price
        const randomPrice = Math.floor(skin.price * (0.8 + Math.random() * 0.7));
        
        listings.push({
          id: `listing-${Date.now()}-${i}`,
          skinId: randomSkinKey,
          price: randomPrice,
          sellerName: `User${Math.floor(Math.random() * 9000) + 1000}`,
          expiresAt: Date.now() + 600000
        });
      }
      setMarketListings(listings);
    }
  }, [isOpen]);

  const handleSell = (skinId: string) => {
    setSellingId(skinId);
    setTimeout(() => {
      const skin = SKINS[skinId];
      // Sell for 70% of base value
      const sellPrice = Math.floor(skin.price * 0.7);
      onSell(skinId, sellPrice);
      setSellingId(null);
    }, 1500); // Fake network delay
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Gavel className="text-yellow-500" /> 
              AUCTION HOUSE
            </h2>
            <div className="flex items-center gap-2 text-yellow-400 font-mono mt-1">
              <Coins size={16} />
              <span className="font-bold text-lg">{coins} Coins</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'wardrobe' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Shirt size={18} /> Wardrobe
          </button>
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'buy' ? 'text-green-400 border-b-2 border-green-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <ShoppingBag size={18} /> Buy Skins
          </button>
          <button 
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'sell' ? 'text-red-400 border-b-2 border-red-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Gavel size={18} /> Sell Skins
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          
          {/* WARDROBE TAB */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.map(skinId => {
                const skin = SKINS[skinId];
                const isEquipped = equippedSkinId === skinId;
                return (
                  <div key={skinId} className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${isEquipped ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                    onClick={() => onEquip(skinId)}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full" style={{ backgroundColor: skin.bodyColor, border: `3px solid ${skin.border}` }}>
                         <div className="absolute w-4 h-4 rounded-full bg-white ml-8 mt-1 border border-black">
                            <div className="w-1.5 h-1.5 bg-black rounded-full ml-1.5 mt-1.5"></div>
                         </div>
                         <div className="absolute w-6 h-4 bg-orange-500 rounded-full ml-8 mt-4 border border-black transform rotate-12"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-bold text-sm">{skin.name}</h3>
                      <p className={`text-xs uppercase font-bold mt-1 ${skin.rarity === 'legendary' ? 'text-yellow-400' : skin.rarity === 'epic' ? 'text-purple-400' : skin.rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'}`}>
                        {skin.rarity}
                      </p>
                    </div>
                    {isEquipped && (
                      <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        EQUIPPED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* BUY TAB */}
          {activeTab === 'buy' && (
            <div className="space-y-3">
              {marketListings.length === 0 && (
                <div className="text-center text-slate-500 mt-10">No listings available. Check back later!</div>
              )}
              {marketListings.map(listing => {
                const skin = SKINS[listing.skinId];
                const alreadyOwned = inventory.includes(listing.skinId);
                const canAfford = coins >= listing.price;

                return (
                  <div key={listing.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-700 border border-slate-600">
                         <div className="w-6 h-6 rounded-full" style={{ backgroundColor: skin.bodyColor }}></div>
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{skin.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <User size={12} /> {listing.sellerName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {alreadyOwned ? (
                         <span className="text-slate-500 font-bold px-4 py-2 bg-slate-700/50 rounded-lg text-sm">OWNED</span>
                      ) : (
                        <button 
                          onClick={() => canAfford && onBuy(listing.skinId, listing.price)}
                          disabled={!canAfford}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${canAfford ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_rgb(21,128,61)] hover:shadow-[0_2px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                          <Coins size={14} />
                          {listing.price}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SELL TAB */}
          {activeTab === 'sell' && (
            <div className="grid grid-cols-1 gap-3">
              {inventory.filter(id => id !== 'default').length === 0 && (
                <div className="text-center text-slate-500 mt-10">
                    <p className="mb-2">You don't have any skins to sell.</p>
                    <p className="text-xs">The default skin cannot be sold.</p>
                </div>
              )}
              {inventory.filter(id => id !== 'default').map(skinId => {
                const skin = SKINS[skinId];
                const isEquipped = equippedSkinId === skinId;
                const estimatedValue = Math.floor(skin.price * 0.7);

                return (
                  <div key={skinId} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-700 border border-slate-600">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: skin.bodyColor }}></div>
                       </div>
                       <div>
                         <h4 className="text-white font-bold">{skin.name}</h4>
                         <p className="text-xs text-slate-400">Est. Value: {estimatedValue} Coins</p>
                       </div>
                     </div>
                     
                     {isEquipped ? (
                       <span className="text-xs text-yellow-500 font-bold border border-yellow-500/30 px-3 py-1 rounded bg-yellow-500/10">UNEQUIP TO SELL</span>
                     ) : (
                        sellingId === skinId ? (
                            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                                <Gavel size={16} /> Auctioning...
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleSell(skinId)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                SELL for {estimatedValue}
                            </button>
                        )
                     )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuctionHouse;
