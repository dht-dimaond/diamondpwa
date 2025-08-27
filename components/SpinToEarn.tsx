'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trophy, Coins, Sparkles, Gift, Zap } from 'lucide-react';

interface SpinResult {
  reward: number;
  message: string;
}

export default function SpinToEarn() {
  const { user, isLoaded } = useUser();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);

  // Wheel segments with colors and rewards
  const segments = [
    { reward: 0, color: '#ef4444', icon: '💔', label: 'Try Again' },
    { reward: 10, color: '#f59e0b', icon: '🪙', label: '10 Tokens' },
    { reward: 20, color: '#10b981', icon: '💰', label: '20 Tokens' },
    { reward: 50, color: '#3b82f6', icon: '💎', label: '50 Tokens' },
    { reward: 100, color: '#8b5cf6', icon: '🎁', label: '100 Tokens' },
    { reward: 200, color: '#f97316', icon: '🏆', label: '200 Tokens' },
  ];

  useEffect(() => {
    if (result && result.reward > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [result]);

  const handleSpin = async () => {
    if (!canSpin || spinning) return;
    
    setSpinning(true);
    setResult(null);
    setError(null);
    setCanSpin(false);

    // Generate random rotation (multiple full rotations + random position)
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + (spins * 360);
    setRotation(finalRotation);

    try {
      const res = await fetch('/api/spin', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Spin failed');
      }

      // Delay result to match animation
      setTimeout(() => {
        setResult({ reward: data.reward, message: data.message });
        setSpinning(false);
        
        // Reset spin availability after 24 hours (for demo, using 1 minute)
        setTimeout(() => setCanSpin(true), 60000);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
      setSpinning(false);
      setCanSpin(true);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl  mx-auto overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 rounded-2xl">
          <div className="text-center text-white animate-bounce">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-lg">You won {result?.reward} tokens!</p>
          </div>
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Daily Spin
          </h2>
          <Zap className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Spin the wheel for a chance to win tokens!
        </p>
      </div>

      {/* Spin Wheel Container */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white shadow-lg"></div>
        </div>

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-pulse opacity-50 scale-110"></div>

        {/* Wheel */}
        <div
          className="relative w-48 h-48 rounded-full border-8 border-white dark:border-gray-700 shadow-2xl transition-transform duration-[3000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${segments
              .map((segment, index) => {
                const startAngle = (index * 60);
                const endAngle = ((index + 1) * 60);
                return `${segment.color} ${startAngle}deg ${endAngle}deg`;
              })
              .join(', ')})`,
          }}
        >
          {/* Center Hub */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-lg">
              {spinning ? (
                <div className="animate-spin">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
              ) : (
                <Gift className="w-6 h-6 text-purple-500" />
              )}
            </div>
          </div>

          {/* Segment Labels */}
          {segments.map((segment, index) => {
            const angle = (index * 60) + 30; // Center of each segment
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * 65;
            const y = Math.sin(radian) * 65;
            
            return (
              <div
                key={index}
                className="absolute text-white font-bold text-xs text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">{segment.icon}</span>
                  <span className="text-[10px] leading-tight">{segment.reward}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className={`relative px-8 py-4 rounded-full font-bold text-white text-lg transition-all duration-300 transform ${
          spinning || !canSpin
            ? 'bg-gray-400 cursor-not-allowed scale-95'
            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95'
        }`}
      >
        <div className="flex items-center gap-2">
          {spinning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Spinning...
            </>
          ) : !canSpin ? (
            <>
              <Trophy className="w-5 h-5" />
              Come Back Tomorrow
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Spin Now!
            </>
          )}
        </div>
        
        {!spinning && canSpin && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 text-center">
          <div className={`p-4 rounded-lg ${result.reward > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {result.reward > 0 ? (
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              )}
              <p className={`font-semibold ${result.reward > 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                {result.message}
              </p>
            </div>
            {result.reward > 0 && (
              <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                <Coins className="w-4 h-4" />
                <span>+{result.reward} tokens added to your balance</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
          <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {error.includes('limit reached') ? 'Come back tomorrow for another spin!' : 'Please try again later'}
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>• One spin per day • Rewards added instantly •</p>
      </div>
    </div>
  );
}