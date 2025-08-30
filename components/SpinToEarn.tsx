'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trophy, Coins, Sparkles, Gift, Zap, Clock, AlertTriangle } from 'lucide-react';

// Import shared configuration (in real app, this would be from shared folder)
interface WheelSegment {
  reward: number;
  weight: number;
  color: string;
  icon: string;
  label: string;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { reward: 0, weight: 20, color: '#ef4444', icon: '💔', label: 'Try Again' },
  { reward: 10, weight: 30, color: '#f59e0b', icon: '🪙', label: '10 Tokens' },
  { reward: 20, weight: 25, color: '#10b981', icon: '💰', label: '20 Tokens' },
  { reward: 50, weight: 15, color: '#3b82f6', icon: '💎', label: '50 Tokens' },
  { reward: 100, weight: 8, color: '#8b5cf6', icon: '🎁', label: '100 Tokens' },
  { reward: 200, weight: 2, color: '#f97316', icon: '🏆', label: '200 Tokens' },
];

const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;

interface SpinResult {
  reward: number;
  message: string;
  newBalance?: number;
  nextSpinAvailable?: string;
}

interface SpinError {
  error: string;
  message: string;
  statusCode?: number;
}

export default function SpinToEarn() {
  const { user, isLoaded } = useUser();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<SpinError | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');
  const [rateLimitTime, setRateLimitTime] = useState<number>(0);

  // Calculate target angle for a specific reward
  const calculateTargetAngle = (reward: number): number => {
    const segmentIndex = WHEEL_SEGMENTS.findIndex(segment => segment.reward === reward);
    if (segmentIndex === -1) return 0;
    
    // Calculate the center angle of the winning segment
    const segmentCenterAngle = (segmentIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
    
    // Add multiple full rotations (5-8 spins) plus the target position
    const fullRotations = (5 + Math.random() * 3) * 360;
    
    // The pointer is at the top (0 degrees), so we need to position the winning segment there
    const targetAngle = fullRotations + (360 - segmentCenterAngle);
    
    return targetAngle;
  };

  // Update countdown timer
  useEffect(() => {
    if (!canSpin && result?.nextSpinAvailable) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const nextSpin = new Date(result.nextSpinAvailable!).getTime();
        const distance = nextSpin - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeUntilNextSpin(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeUntilNextSpin('');
          setCanSpin(true);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canSpin, result]);

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitTime > 0) {
      const interval = setInterval(() => {
        setRateLimitTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimitTime]);

  // Celebration effect
  useEffect(() => {
    if (result && result.reward > 0) {
      setShowCelebration(true);
      const timeout = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [result]);

  const handleSpin = async () => {
    if (!canSpin || spinning || rateLimitTime > 0) return;
    
    setSpinning(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/spin', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(JSON.stringify({
          error: data.error || 'UNKNOWN_ERROR',
          message: data.message || 'Spin failed',
          statusCode: res.status
        }));
      }

      // Calculate the target rotation for the actual reward
      const targetRotation = rotation + calculateTargetAngle(data.reward);
      setRotation(targetRotation);

      // Wait for the wheel animation to complete before showing results
      setTimeout(() => {
        setResult({
          reward: data.reward,
          message: data.message,
          newBalance: data.newBalance,
          nextSpinAvailable: data.nextSpinAvailable
        });
        setSpinning(false);
        
        if (data.nextSpinAvailable) {
          setCanSpin(false);
        }
      }, 4000); // Match the CSS animation duration
      //eslint-disable-next-line
    } catch (err: any) {
      setSpinning(false);
      
      try {
        const errorData = JSON.parse(err.message);
        setError({
          error: errorData.error,
          message: errorData.message,
          statusCode: errorData.statusCode
        });

        // Handle specific error types
        if (errorData.error === 'RATE_LIMITED') {
          const match = errorData.message.match(/(\d+) seconds/);
          if (match) {
            setRateLimitTime(parseInt(match[1]));
          }
        }
      } catch {
        setError({
          error: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection and try again.'
        });
      }
    }
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'RATE_LIMITED':
        return <Clock className="w-5 h-5" />;
      case 'DAILY_LIMIT_REACHED':
        return <Trophy className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'RATE_LIMITED':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'DAILY_LIMIT_REACHED':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl max-w-md mx-auto p-8">
        <div className="animate-pulse">
          <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl max-w-md mx-auto p-8 overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 rounded-2xl">
          <div className="text-center text-white animate-bounce">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-lg">You won {result?.reward} tokens!</p>
            {result?.newBalance && (
              <p className="text-sm mt-2 opacity-80">New balance: {result.newBalance} tokens</p>
            )}
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
          className="relative w-48 h-48 rounded-full border-8 border-white dark:border-gray-700 shadow-2xl transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4000ms' : '0ms',
            transitionTimingFunction: spinning ? 'cubic-bezier(0.23, 1, 0.32, 1)' : 'ease-out',
            background: `conic-gradient(${WHEEL_SEGMENTS
              .map((segment, index) => {
                const startAngle = (index * SEGMENT_ANGLE);
                const endAngle = ((index + 1) * SEGMENT_ANGLE);
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
          {WHEEL_SEGMENTS.map((segment, index) => {
            const angle = (index * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2); // Center of each segment
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
        disabled={spinning || !canSpin || rateLimitTime > 0}
        className={`relative px-8 py-4 rounded-full font-bold text-white text-lg transition-all duration-300 transform ${
          spinning || !canSpin || rateLimitTime > 0
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
          ) : rateLimitTime > 0 ? (
            <>
              <Clock className="w-5 h-5" />
              Wait {rateLimitTime}s
            </>
          ) : !canSpin ? (
            <>
              <Trophy className="w-5 h-5" />
              {timeUntilNextSpin ? `Next spin in ${timeUntilNextSpin}` : 'Come Back Tomorrow'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Spin Now!
            </>
          )}
        </div>
        
        {!spinning && canSpin && rateLimitTime === 0 && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 text-center w-full">
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
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <Coins className="w-4 h-4" />
                  <span>+{result.reward} tokens added to your balance</span>
                </div>
                {result.newBalance && (
                  <div className="text-xs text-green-500 dark:text-green-400">
                    New balance: {result.newBalance} tokens
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mt-6 w-full">
          <div className={`p-4 rounded-lg ${getErrorColor(error.error)}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {getErrorIcon(error.error)}
              <p className="font-semibold">{error.message}</p>
            </div>
            
            {error.error === 'RATE_LIMITED' && rateLimitTime > 0 && (
              <div className="text-center text-sm mt-2">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Retry in {rateLimitTime} seconds</span>
                </div>
              </div>
            )}
            
            {error.error === 'DAILY_LIMIT_REACHED' && timeUntilNextSpin && (
              <div className="text-center text-sm mt-2">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>Next spin available in {timeUntilNextSpin}</span>
                </div>
              </div>
            )}
            
            {error.error === 'USER_NOT_FOUND' && (
              <div className="text-center text-sm mt-2">
                <p>Please refresh the page and try again.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Probability Info */}
      <div className="mt-6 w-full">
        <details className="text-center">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            View Winning Chances
          </summary>
          <div className="mt-2 space-y-1">
            {WHEEL_SEGMENTS.map((segment, index) => (
              <div key={index} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span>{segment.icon}</span>
                  <span>{segment.label}</span>
                </span>
                <span>{segment.weight}% chance</span>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Info Footer */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>• One spin per day • Rewards added instantly • Fair & transparent •</p>
      </div>
    </div>
  );
}