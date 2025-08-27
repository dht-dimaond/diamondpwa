'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import StreakModal from './StreakModal';

type StreakData = {
  currentStreak: number;
  highestStreak: number;
  currentRank: string;
  unclaimedMilestones: Array<{ days: number; rank: string; reward: number }>;
  nextMilestone?: { days: number; rank: string; reward: number };
};

export default function StreakCounter() {
  const { user, isLoaded } = useUser();
  const [streak, setStreak] = useState<StreakData>({ 
    currentStreak: 0, 
    highestStreak: 0, 
    currentRank: 'Bronze', 
    unclaimedMilestones: [] 
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/streak');
      if (!response.ok) throw new Error('Failed to fetch streak');
      const data = await response.json();
      setStreak(data);
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchStreak();
  }, [isLoaded, user]);

  const handleClaimRewards = async () => {
    setClaiming(true);
    try {
      const response = await fetch('/api/streak/claim', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to claim rewards');
      
      const result = await response.json();
      
      // Refresh streak data
      await fetchStreak();
      
      // Show success message or handle UI update
      console.log('Claimed rewards:', result);
      
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setClaiming(false);
    }
  };

  const getRankEmoji = (rank: string) => {
    switch (rank) {
      case 'Bronze': return '🥉';
      case 'Gold': return '🥇';
      case 'Emerald': return '💚';
      case 'Diamond': return '💎';
      case 'Universal Ambassador': return '🌟';
      default: return '🥉';
    }
  };

  const getProgressToNext = () => {
    if (!streak.nextMilestone) return 100;
    const progress = (streak.currentStreak / streak.nextMilestone.days) * 100;
    return Math.min(progress, 100);
  };

  if (!isLoaded || !user) return null;
  
  if (loading) {
    return (
      <div className="flex-1">
        <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="animate-pulse flex space-x-3">
              <div className="rounded-full bg-blue-400 h-8 w-8"></div>
              <div className="space-y-2">
                <div className="h-4 bg-blue-400 rounded w-16"></div>
                <div className="h-3 bg-blue-400 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div 
        className="w-full relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg overflow-hidden cursor-pointer transition-all duration-200"
        onClick={() => setShowModal(true)}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-4 text-4xl animate-pulse">⚡</div>
          <div className="absolute bottom-2 left-4 text-2xl animate-bounce delay-500">💎</div>
        </div>
        
        <div className="relative z-10 flex items-stretch justify-between gap-4">
          {/* Mining streak section */}
          <div className="flex-1 flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
              <span className="text-2xl animate-pulse">⛏️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {streak.currentStreak}
              </div>
              <div className="text-blue-100 text-sm font-medium">
                Mining Days
              </div>
            </div>
          </div>

          {/* Rank and status */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end space-x-2">
              <span className="text-2xl">{getRankEmoji(streak.currentRank)}</span>
              <div>
                <div className="text-white font-bold text-lg">
                  {streak.currentRank}
                </div>
                <div className="text-blue-100 text-xs">
                  Best: {streak.highestStreak} days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to next milestone */}
        {streak.nextMilestone && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
              <span>Next: {streak.nextMilestone.rank}</span>
              <span>{streak.currentStreak}/{streak.nextMilestone.days} days</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressToNext()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Bottom status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-100">
            <div className={`w-2 h-2 rounded-full ${streak.currentStreak > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-medium">
              {streak.currentStreak > 0 ? 'Mining Active' : 'Mining Inactive'}
            </span>
          </div>
          
          {/* Click hint or claim button */}
          {streak.unclaimedMilestones.length > 0 ? (
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
              🎁 Click to Claim!
            </div>
          ) : (
            <div className="text-blue-100 text-xs opacity-75">
              👆 Click for details
            </div>
          )}
        </div>
      </div>

      <StreakModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentStreak={streak.currentStreak}
        currentRank={streak.currentRank}
        unclaimedMilestones={streak.unclaimedMilestones}
        onClaimRewards={handleClaimRewards}
        claiming={claiming}
      />
    </div>
  );
}