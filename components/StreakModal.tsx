'use client';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  currentRank: string;
  unclaimedMilestones: Array<{ days: number; rank: string; reward: number }>;
  onClaimRewards: () => void;
  claiming: boolean;
}

const MILESTONES = [
  { days: 7, rank: 'Bronze', reward: 10, emoji: '🥉' },
  { days: 14, rank: 'Gold', reward: 50, emoji: '🥇' },
  { days: 21, rank: 'Emerald', reward: 100, emoji: '💚' },
  { days: 30, rank: 'Diamond', reward: 500, emoji: '💎' },
  { days: 60, rank: 'Universal Ambassador', reward: 1000, emoji: '🌟' },
];

export default function StreakModal({ 
  isOpen, 
  onClose, 
  currentStreak, 
  currentRank,
  unclaimedMilestones,
  onClaimRewards,
  claiming 
}: StreakModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Mining Streak Milestones
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Current Streak</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {currentStreak} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-400">Current Rank</p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {currentRank}
              </p>
            </div>
          </div>
        </div>

        {/* Unclaimed Rewards */}
        {unclaimedMilestones.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              🎉 Unclaimed Rewards Available!
            </h3>
            <div className="space-y-2">
              {unclaimedMilestones.map((milestone) => (
                <div key={milestone.days} className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-400">
                    {milestone.rank} ({milestone.days} days)
                  </span>
                  <span className="font-bold text-green-800 dark:text-green-300">
                    +{milestone.reward} DHT
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClaimRewards}
              disabled={claiming}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {claiming ? 'Claiming...' : `Claim ${unclaimedMilestones.reduce((sum, m) => sum + m.reward, 0)} DHT`}
            </button>
          </div>
        )}

        {/* Milestones List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            All Milestones & Rewards:
          </h3>
          {MILESTONES.map((milestone) => {
            const isAchieved = currentStreak >= milestone.days;
            const isClaimed = unclaimedMilestones.find(m => m.days === milestone.days) === undefined && isAchieved;
            
            return (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isAchieved 
                    ? isClaimed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div>
                    <p className={`font-medium ${
                      isAchieved ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {milestone.rank}
                    </p>
                    <p className={`text-sm ${
                      isAchieved ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {milestone.days} days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    isAchieved ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {milestone.reward} DHT
                  </p>
                  {isAchieved && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {isClaimed ? '✅ Claimed' : '🎁 Ready!'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            💡 Keep your daily mining streak alive to unlock higher ranks and earn more DHT rewards!
            Missing a day will reset your streak to 1.
          </p>
        </div>
      </div>
    </div>
  );
}