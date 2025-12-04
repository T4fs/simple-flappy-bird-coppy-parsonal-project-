
import React, { useState } from 'react';
import { Skin, AuctionListing } from '../types';
import { Coins, ShoppingBag, Shirt, X, Gavel, User, Tag, Gift, Send, Sparkles, Globe } from 'lucide-react';

interface AuctionHouseProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: string[];
  equippedSkinId: string;
  listings: AuctionListing[];
  skinMap: Record<string, Skin>;
  onBuyListing: (listingId: string) => void;
  onListSkin: (skinId: string, price: number) => void;
  onQuickSell: (skinId: string, price: number) => void;
  onEquip: (skinId: string) => void;
  onGift: (skinId: string, recipient: string) => void;
}

const SkinPreview: React.FC<{ skin: Skin; size?: number }> = ({ skin, size = 12 }) => {
  const sizeClasses = {
    12: 'w-12 h-12',
    16: 'w-16 h-16'
  };
  
  const getBackgroundStyle = () => {
    const { bodyColor, secondaryColor, pattern } = skin;
    
    if (pattern === 'solid') {
      return { backgroundColor: bodyColor };
    }
    
    if (pattern === 'gradient' && secondaryColor) {
      return { background: `linear-gradient(135deg, ${bodyColor} 0%, ${secondaryColor} 100%)` };
    }
    
    if (pattern === 'striped' && secondaryColor) {
      return { 
        background: `repeating-linear-gradient(90deg, ${bodyColor}, ${bodyColor} 6px, ${secondaryColor} 6px, ${secondaryColor} 12px)`
      };
    }
    
    if (pattern === 'dots' && secondaryColor) {
      return {
        backgroundColor: bodyColor,
        backgroundImage: `radial-gradient(${secondaryColor} 2px, transparent 2px)`,
        backgroundSize: '8px 8px'
      };
    }
    
    if (pattern === 'checkered' && secondaryColor) {
      return {
        backgroundColor: bodyColor,
        backgroundImage: `conic-gradient(${secondaryColor} 0.25turn, transparent 0.25turn 0.5turn, ${secondaryColor} 0.5turn 0.75turn, transparent 0.75turn)`,
        backgroundSize: '12px 12px'
      };
    }

    return { backgroundColor: bodyColor };
  };

  return (
    <div className={`${sizeClasses[size as keyof typeof sizeClasses]} rounded-full relative shadow-md`} style={{ ...getBackgroundStyle(), border: `3px solid ${skin.border}` }}>
      {/* Eye */}
      <div className="absolute w-[30%] h-[30%] rounded-full bg-white right-[15%] top-[15%] border border-black z-10 overflow-hidden" style={{ backgroundColor: skin.eyeColor }}>
        <div className="absolute w-[30%] h-[30%] bg-black rounded-full right-[20%] top-[20%]"></div>
      </div>
      {/* Wing */}
      <div className="absolute w-[50%] h-[35%] rounded-full left-[-10%] top-[40%] border border-black transform -rotate-12" style={{ backgroundColor: skin.wingColor }}></div>
      {/* Beak */}
      <div className="absolute w-[30%] h-[20%] rounded-full right-[-15%] top-[40%] border border-black z-0" style={{ backgroundColor: skin.beakColor }}></div>
    </div>
  );
};

const AuctionHouse: React.FC<AuctionHouseProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  equippedSkinId,
  listings,
  skinMap,
  onBuyListing,
  onListSkin,
  onQuickSell,
  onEquip,
  onGift
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'wardrobe' | 'mylistings'>('wardrobe');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState<string>("");
  const [giftRecipient, setGiftRecipient] = useState<string>("");
  const [showGiftModal, setShowGiftModal] = useState(false);

  const handleListForAuction = (skinId: string) => {
      const price = parseInt(listingPrice);
      if (price > 0) {
          onListSkin(skinId, price);
          setSelectedItem(null);
          setListingPrice("");
          setActiveTab('mylistings');
      }
  };

  const handleGiftSubmit = () => {
      if (selectedItem && giftRecipient.length > 0) {
          onGift(selectedItem, giftRecipient);
          setSelectedItem(null);
          setGiftRecipient("");
          setShowGiftModal(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl h-[85vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Gift Modal */}
        {showGiftModal && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
                <div className="bg-slate-800 border border-purple-500 rounded-2xl p-6 w-full max-w-sm">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <Gift className="text-purple-400" /> Gift Skin
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Send <span className="text-white font-bold">{selectedItem && skinMap[selectedItem] ? skinMap[selectedItem].name : 'Item'}</span> to a friend?
                        This action cannot be undone.
                    </p>
                    <input 
                        type="text" 
                        value={giftRecipient}
                        onChange={(e) => setGiftRecipient(e.target.value)}
                        placeholder="Recipient Username"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowGiftModal(false)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGiftSubmit}
                            disabled={!giftRecipient}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                            <Send size={16} /> Send
                        </button>
                    </div>
                </div>
            </div>
        )}

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
        <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 min-w-[100px] py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'wardrobe' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Shirt size={18} /> <span className="hidden sm:inline">Wardrobe</span>
          </button>
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 min-w-[100px] py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'buy' ? 'text-green-400 border-b-2 border-green-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <ShoppingBag size={18} /> <span className="hidden sm:inline">Market</span>
          </button>
          <button 
            onClick={() => setActiveTab('sell')}
            className={`flex-1 min-w-[100px] py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'sell' ? 'text-red-400 border-b-2 border-red-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Tag size={18} /> <span className="hidden sm:inline">Sell</span>
          </button>
          <button 
            onClick={() => setActiveTab('mylistings')}
            className={`flex-1 min-w-[100px] py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'mylistings' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Gavel size={18} /> <span className="hidden sm:inline">My Listings</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 custom-scrollbar">
          
          {/* WARDROBE TAB */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.map(skinId => {
                const skin = skinMap[skinId];
                if (!skin) return null;
                const isEquipped = equippedSkinId === skinId;
                const isSelected = selectedItem === skinId;

                return (
                  <div key={skinId} className={`relative p-4 rounded-xl border-2 transition-all ${isEquipped ? 'border-green-500 bg-green-500/10' : isSelected ? 'border-purple-500 bg-slate-800' : 'border-slate-700 bg-slate-800 hover:border-slate-500'} ${skin.isUnique ? 'shadow-[0_0_15px_rgba(255,215,0,0.3)]' : ''}`}>
                    <div className="flex justify-center mb-4 cursor-pointer" onClick={() => setSelectedItem(skinId)}>
                      <SkinPreview skin={skin} size={16} />
                    </div>
                    {skin.isUnique && (
                         <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                             <Sparkles size={10} /> 1-of-1
                         </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-white font-bold text-sm truncate">{skin.name}</h3>
                      <p className={`text-[10px] uppercase font-bold mt-1 ${skin.rarity === 'legendary' ? 'text-yellow-400' : skin.rarity === 'epic' ? 'text-purple-400' : skin.rarity === 'rare' ? 'text-blue-400' : skin.rarity === 'unique' ? 'text-pink-400' : 'text-slate-400'}`}>
                        {skin.rarity}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {isEquipped ? (
                             <button className="col-span-2 bg-green-600 text-white text-xs font-bold py-1 rounded cursor-default">EQUIPPED</button>
                        ) : (
                             <button onClick={() => onEquip(skinId)} className="bg-slate-700 hover:bg-blue-600 text-white text-xs font-bold py-1 rounded transition-colors">EQUIP</button>
                        )}
                        {!isEquipped && skinId !== 'default' && (
                             <button 
                                onClick={() => { setSelectedItem(skinId); setShowGiftModal(true); }}
                                className="bg-slate-700 hover:bg-purple-600 text-white text-xs font-bold py-1 rounded transition-colors flex items-center justify-center gap-1"
                             >
                                <Gift size={12} /> Gift
                             </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MARKET TAB */}
          {activeTab === 'buy' && (
            <div className="space-y-3">
              {listings.filter(l => !l.isUserListing).length === 0 && (
                <div className="text-center text-slate-500 mt-10">No items on the market.</div>
              )}
              {listings.filter(l => !l.isUserListing).map(listing => {
                const skin = skinMap[listing.skinId];
                if (!skin) return null;
                const alreadyOwned = inventory.includes(listing.skinId);
                const canAfford = coins >= listing.price;

                return (
                  <div key={listing.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800">
                         <SkinPreview skin={skin} size={12} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{skin.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <User size={12} /> {listing.sellerName}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-1.5 rounded ${skin.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' : skin.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' : skin.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                           {skin.rarity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {alreadyOwned ? (
                         <span className="text-slate-500 font-bold px-4 py-2 bg-slate-700/50 rounded-lg text-sm">OWNED</span>
                      ) : (
                        <button 
                          onClick={() => canAfford && onBuyListing(listing.id)}
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
                </div>
              )}
              {inventory.filter(id => id !== 'default').map(skinId => {
                const skin = skinMap[skinId];
                if (!skin) return null;
                const isEquipped = equippedSkinId === skinId;
                const quickSellPrice = Math.floor(skin.price * 0.5);
                const isSelected = selectedItem === skinId;

                return (
                  <div key={skinId} className={`bg-slate-800 p-3 rounded-xl border transition-all ${isSelected ? 'border-blue-500 bg-slate-800/80' : 'border-slate-700'}`}>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800">
                              <SkinPreview skin={skin} size={12} />
                           </div>
                           <div>
                             <h4 className="text-white font-bold">{skin.name}</h4>
                             <p className="text-xs text-slate-400 mt-1">Value: <span className="text-yellow-400">{skin.price}</span></p>
                           </div>
                         </div>
                         
                         {isEquipped ? (
                             <span className="text-xs text-yellow-500 font-bold border border-yellow-500/30 px-3 py-1 rounded bg-yellow-500/10">UNEQUIP TO SELL</span>
                         ) : (
                             !isSelected ? (
                                <button 
                                    onClick={() => { setSelectedItem(skinId); setListingPrice(skin.price.toString()); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Select
                                </button>
                             ) : (
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                             )
                         )}
                     </div>

                     {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <h5 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-1"><User size={12}/> NPC Quick Sell</h5>
                                <p className="text-xs text-slate-500 mb-2">Sell instantly for quick cash.</p>
                                <button 
                                    onClick={() => onQuickSell(skinId, quickSellPrice)}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Coins size={14} className="text-yellow-400" /> +{quickSellPrice}
                                </button>
                            </div>
                            
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                                <h5 className="text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-1"><Globe size={12}/> Player Auction</h5>
                                <p className="text-xs text-slate-500 mb-2">List for real players to buy.</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={listingPrice}
                                        onChange={(e) => setListingPrice(e.target.value)}
                                        className="w-20 bg-black text-white px-2 py-1 rounded border border-slate-600 text-sm"
                                        placeholder="Price"
                                    />
                                    <button 
                                        onClick={() => handleListForAuction(skinId)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-1"
                                    >
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
          )}

          {/* MY LISTINGS TAB */}
          {activeTab === 'mylistings' && (
             <div className="space-y-3">
                 {listings.filter(l => l.isUserListing).length === 0 && (
                    <div className="text-center text-slate-500 mt-10">You have no active listings.</div>
                 )}
                 {listings.filter(l => l.isUserListing).map(listing => {
                     const skin = skinMap[listing.skinId];
                     return (
                         <div key={listing.id} className="bg-slate-800 p-3 rounded-xl border border-blue-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800">
                                    <SkinPreview skin={skin} size={12} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{skin.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-blue-400 mt-1 animate-pulse">
                                        <Globe size={12} /> Listed for: <span className="text-yellow-400 font-bold">{listing.price}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Waiting for player...</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 block mb-1">Open Market</span>
                            </div>
                         </div>
                     )
                 })}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuctionHouse;
