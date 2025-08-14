import React, { useState, useEffect } from 'react';
import { ArrowUpRight, X, Wallet, Shield, Zap, Flame, Coins, Calendar, Gift, ChevronRight } from 'lucide-react';

const DHWalletAd: React.FC<{ setShowAd: (show: boolean) => void }> = ({ setShowAd }) => {
  const [animationState, setAnimationState] = useState(0);
  const [activeTab, setActiveTab] = useState('main'); 
  
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationState(prev => (prev + 1) % 4);
    }, 1500);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-300 overflow-auto">
      
      <div className="bg-gradient-to-br from-blue-950 to-indigo-950 rounded-2xl shadow-2xl w-full h-3/4 relative border border-indigo-500/50 overflow-auto">
        {/* Close button */}
        <button
          onClick={() => setShowAd(false)}
          className="fixed top-12 right-3 md:absolute p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-10 bg-black/30 md:bg-transparent"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        {/* Top accent bar with animated shimmer effect */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 w-1/2 bg-white/30 blur-sm" 
               style={{animation: 'shimmer 3s infinite', left: '-50%'}}></div>
        </div>
        
        {/* Tab Navigation - sticky */}
        <div className="flex border-b border-indigo-800/50 sticky top-2 z-10 bg-gradient-to-br from-blue-950 to-indigo-950">
          <button 
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === 'main' 
                ? 'text-white bg-indigo-800/30 border-b-2 border-cyan-400' 
                : 'text-blue-300 hover:bg-indigo-800/20'
            }`}
          >
            DHT Wallet
          </button>
          <button 
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === 'streaks' 
                ? 'text-white bg-amber-900/30 border-b-2 border-amber-400' 
                : 'text-blue-300 hover:bg-indigo-800/20'
            }`}
          >
            Streak Rewards
          </button>
        </div>
        
        {/* Main Ad Content */}
        {activeTab === 'main' && (
          <div className="p-6 md:p-8 overflow-y-auto">
            {/* Logo and title with subtle float animation */}
            <div className="flex items-center space-x-4 mb-8" style={{animation: 'float 4s ease-in-out infinite'}}>
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-0.5">
                <div className="h-full w-full rounded-full bg-indigo-950 flex items-center justify-center">
                  <Wallet size={24} className="text-blue-300" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">DHT Wallet</h3>
                <div className="flex items-center">
                  <span className="text-blue-300 mr-2">Coming Soon</span>
                  <span className="inline-block h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                </div>
                <p className="text-amber-300 font-semibold mt-1">Swap Your $DHT Tokens</p>
              </div>
            </div>
            
            {/* Main message with gradient text */}
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 inline-block text-transparent bg-clip-text">
              The Future of Digital Finance
            </h2>
            
            <p className="text-blue-100 mb-8 text-lg">
              Experience next-generation crypto management with unparalleled security and blazing speed.
            </p>
            
            {/* Features in cards with hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 group hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-indigo-900/40 ${animationState === 0 ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 scale-105' : 'bg-white/5'}`}>
                <div className="p-2 rounded-lg bg-cyan-900/50 group-hover:bg-cyan-800/70 transition-colors">
                  <Shield size={22} className="text-cyan-400" />
                </div>
                <div>
                  <span className="text-white font-medium block">Military-grade Security</span>
                  <span className="text-blue-300 text-sm">Advanced encryption protocols</span>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 group hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-indigo-900/40 ${animationState === 1 ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 scale-105' : 'bg-white/5'}`}>
                <div className="p-2 rounded-lg bg-yellow-900/50 group-hover:bg-yellow-800/70 transition-colors">
                  <Zap size={22} className="text-yellow-400" />
                </div>
                <div>
                  <span className="text-white font-medium block">Lightning Transactions</span>
                  <span className="text-blue-300 text-sm">Sub-second confirmation</span>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 group hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-indigo-900/40 ${animationState === 2 ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 scale-105' : 'bg-white/5'}`}>
                <div className="p-2 rounded-lg bg-green-900/50 group-hover:bg-green-800/70 transition-colors">
                  <ArrowUpRight size={22} className="text-green-400" />
                </div>
                <div>
                  <span className="text-white font-medium block">Minimal Transaction Fees</span>
                  <span className="text-blue-300 text-sm">Save on every transfer</span>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 group hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-indigo-900/40 ${animationState === 3 ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 scale-105' : 'bg-white/5'}`}>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold">
                  DHT
                </div>
                <div>
                  <span className="text-white font-medium block">Full DHT Token Support</span>
                  <span className="text-blue-300 text-sm">Native integration</span>
                </div>
              </div>
            </div>
            
            {/* CTA section with glowing button */}
            <div className="text-center mb-6">
              <div className="mt-4 flex items-center justify-center">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400 border border-indigo-900"></div>
                  <div className="w-6 h-6 rounded-full bg-indigo-400 border border-indigo-900"></div>
                  <div className="w-6 h-6 rounded-full bg-purple-400 border border-indigo-900"></div>
                </div>
                <span className="ml-3 text-blue-200 text-sm">Secure • Fast • Seamless</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Streaks Content Tab */}
        {activeTab === 'streaks' && (
          <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-950 to-blue-950 overflow-y-auto">
            {/* Streak Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                <Flame size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-100">Daily Streak Rewards</h3>
                <p className="text-blue-300/80">Consistency powers your boost</p>
              </div>
            </div>
            
            {/* Explanation */}
            <p className="text-blue-100 mb-6 bg-black/20 p-4 rounded-lg border-l-4 border-indigo-500">
              Log in and mine DHT every day to maintain your streak. The longer your streak, the more your rewards! 
            </p>
            
            {/* Reward Tiers with Enhanced Details */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-medium text-blue-200 flex items-center">
                <Calendar size={18} className="mr-2" />
                Neuro-Milestones
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 7 Day Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-blue-950/60 rounded-xl border border-indigo-700/30 hover:border-indigo-500/50 transition-all hover:shadow-md hover:shadow-indigo-600/20">
                  <div className="text-center mb-2">
                    <div className="inline-block">
                      <span className="text-xl font-bold text-cyan-400">7 DAYS</span>
                    </div>
                    <h5 className="text-lg font-bold text-blue-200">Weekly Streak</h5>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300/80">Reward:</span>
                      <span className="text-cyan-400 font-bold">+50 DHT</span>
                    </div>
                  </div>
                </div>
                
                {/* 30 Day Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-blue-950/60 rounded-xl border border-indigo-700/30 hover:border-indigo-500/50 transition-all hover:shadow-md hover:shadow-indigo-600/20">
                  <div className="text-center mb-2">
                    <div className="inline-block">
                      <span className="text-xl font-bold text-cyan-400">30 DAYS</span>
                    </div>
                    <h5 className="text-lg font-bold text-blue-200">Monthly Streak</h5>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300/80">Reward:</span>
                      <span className="text-cyan-400 font-bold">+250 DHT</span>
                    </div>
                  </div>
                </div>
                
                {/* 90 Day Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-blue-950/60 rounded-xl border border-indigo-700/30 hover:border-indigo-500/50 transition-all hover:shadow-md hover:shadow-indigo-600/20">
                  <div className="text-center mb-2">
                    <div className="inline-block">
                      <span className="text-xl font-bold text-cyan-400">90 DAYS</span>
                    </div>
                    <h5 className="text-lg font-bold text-blue-200">Grand Streak</h5>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300/80">Reward:</span>
                      <span className="text-cyan-400 font-bold">+1000 DHT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Streak Benefits */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-blue-200 flex items-center mb-4">
                <Gift size={18} className="mr-2" />
                Boosts and More
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
                  <Coins className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <span className="text-blue-100 font-medium">Mining Boost</span>
                    <p className="text-blue-200/70 text-sm">Each consecutive day adds +1.5% Mning boost</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
                  <ChevronRight className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <span className="text-blue-100 font-medium">Streak Protection</span>
                    <p className="text-blue-200/70 text-sm">24-hour one-time protection activated after logging in for 14 consecutive days</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to action */}
            <div className="text-center">
              <p className="text-blue-200/80 text-sm mt-2">Log in Daily to save your streak</p>
            </div>
          </div>
        )}
       
        
        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 relative overflow-hidden">
          <div className="absolute inset-0 w-1/2 bg-white/30 blur-sm" 
               style={{animation: 'shimmer 3s infinite', left: '-50%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default DHWalletAd;