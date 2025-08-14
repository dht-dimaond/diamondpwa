"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Clerk authentication

interface StreakDisplayProps {
  onMilestoneReached?: (reward: number) => void;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ onMilestoneReached }) => {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMilestone, setShowMilestone] = useState<boolean>(false);
  const [milestoneReward, setMilestoneReward] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const { user } = useUser(); // Clerk user object
  
  const milestones = [
    { days: 7, reward: 50 },
    { days: 30, reward: 250 },
    { days: 90, reward: 1000 }
  ];

  // Find next milestone
  const getNextMilestone = () => {
    for (const milestone of milestones) {
      if (currentStreak < milestone.days) {
        return milestone;
      }
    }
    return null;
  };
  
  const nextMilestone = getNextMilestone();

  useEffect(() => {
    const initializeStreak = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Call API endpoint to update/fetch streak
        const response = await fetch('/api/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to fetch streak');
        
        const streakData = await response.json();
        
        setCurrentStreak(streakData.currentStreak);
        setHighestStreak(streakData.highestStreak);
        setStartDate(streakData.streakStart);

        // Handle milestones
        if (streakData.newMilestoneReward) {
          setMilestoneReward(streakData.newMilestoneReward);
          setShowMilestone(true);
          onMilestoneReached?.(streakData.newMilestoneReward);
        }
      } catch (error) {
        console.error('Error initializing streak:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeStreak();
  }, [user, onMilestoneReached]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const calculateProgress = () => {
    if (!nextMilestone) return 100;
    
    const lastMilestone = milestones.find(m => m.days < nextMilestone.days) || { days: 0 };
    const progressRange = nextMilestone.days - lastMilestone.days;
    const userProgress = currentStreak - lastMilestone.days;
    
    return Math.floor((userProgress / progressRange) * 100);
  };
  
  return (
    <div className="flex flex-col">
      <div className=" rounded-lg shadow-lg overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-900/20 to-black/60 px-4 py-3 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-400 mr-2"
              >
                <path d="M12 2c.8 0 1.5.5 1.8 1.2l2.1 5.2c.3.7 1 1.2 1.8 1.2h5.1c1.5 0 2.1 1.9 1 3l-4.2 3c-.7.5-1 1.3-.7 2.1l2 5c.5 1.3-.9 2.5-2 1.7l-4.1-3c-.7-.5-1.5-.5-2.1 0l-4.1 3c-1.2.8-2.5-.4-2-1.7l2-5c.2-.7 0-1.6-.7-2.1l-4.2-3c-1.2-1-.5-3 1-3h5.1c.8 0 1.5-.5 1.8-1.2l2.1-5.2c.3-.7 1-1.2 1.8-1.2Z"></path>
              </svg>
              <h3 className="font-bold">Your Daily Streak</h3>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-green-400">{currentStreak}</span>
              <span className="ml-1 text-sm opacity-80">days</span>
            </div>
          </div>
        </div>
        
        {/* Streak Details */}
        <div className="p-4 bg-gray-800 text-green-400">
          {/* Streak calendar - Shows last 7 days */}
          <div className="flex justify-between mb-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const day = 7 - index;
              const isActive = currentStreak >= day;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center 
                    ${isActive ? 'bg-blue-700 text-gray-200' : 'bg-gray-700 text-green-400'}`}
                  >
                    {day}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {day === 1 ? 'Today' : day === 2 ? 'Yesterday' : `Day ${day}`}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Progress to next milestone */}
          {nextMilestone && (
            <div className="mt-2 mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Next milestone: {nextMilestone.days} days</span>
                <span className="text-green-400 font-medium">+{nextMilestone.reward} tokens</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Streak stats */}
          <div className="flex justify-between text-sm text-gray-400 mt-3 pt-3 border-t border-gray-700">
            <div>
              <span className="text-gray-500">Started: </span>
              <span className="font-medium text-gray-300">{formatDate(startDate)}</span>
            </div>
            <div>
              <span className="text-gray-500">Best: </span>
              <span className="font-medium text-gray-300">{highestStreak} days</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Milestone notification */}
      {showMilestone && milestoneReward && (
        <div className="mt-3 bg-gray-800 border border-yellow-400 text-gray-200 px-4 py-3 rounded-md flex items-center justify-between animate-pulse">
          <div className="flex items-center">
            <div className="bg-blue-900 p-2 rounded-full mr-3 border border-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-400"
              >
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-yellow-400">Milestone Reached: {currentStreak} Days!</p>
              <p className="text-xs text-gray-300">You earned {milestoneReward} tokens</p>
            </div>
          </div>
          <button
            onClick={() => setShowMilestone(false)}
            className="text-gray-400 hover:text-gray-200 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;