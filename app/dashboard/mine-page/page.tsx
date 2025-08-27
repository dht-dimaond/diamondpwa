'use client';

import { useRouter } from 'next/navigation';
import UpgradeButton from '@/components/UpgradeButton';
import ClaimButton from '@/components/ClaimButton';
import AnimatedCoins from '@/components/AnimatedCoins';
import TokenDetails from '@/components/TokenDetails';
import { useMining } from '@/context/MiningContext';
import Tokenomics from '@/components/Tokennomics';
import { 
  ArrowLeft,
  Zap, 
  Activity, 
  Settings, 
  TrendingUp,
  Clock,
  Target,
  Award,
  Play,
  Pause
} from 'lucide-react';

const MiningPage = () => {
  const router = useRouter();
  const {
    isMining,
    minedAmount,
    toggleMining,
    claimDHT,
    formattedHashRate,
    isClaimable,
  } = useMining();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Mining Hub</h1>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="max-w-md mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Mining Status Hero */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full"></div>
              </div>
              
              <div className="relative z-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${isMining ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {isMining ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Mining Status</p>
                      <p className="font-semibold">{isMining ? 'Active Mining' : 'Mining Stopped'}</p>
                    </div>
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full ${isMining ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>

                {/* Animated Coins */}
                <div className="mb-6">
                  <AnimatedCoins isMining={isMining} />
                </div>

                {/* Current Mining Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold mb-2">
                      {minedAmount.toFixed(6)}
                      <span className="text-2xl text-amber-300 ml-2">DHT</span>
                    </p>
                    <p className="text-sm opacity-90">Current Session Mined</p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>{formattedHashRate}</span>
                    </div>
                    <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-300" />
                      <span>98.5% Efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Mining Control Button */}
                <button
                  onClick={toggleMining}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    isMining
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-white hover:bg-gray-100 text-blue-700 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isMining ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mining in Progress...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Start Mining Now</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Mining Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">24h Mined</p>
                    <p className="font-semibold text-gray-900 dark:text-white">12.45 DHT</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Mining Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">8h 24m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <ClaimButton
                onClick={claimDHT}
                text="Claim Tokens"
                disabled={!isClaimable}
              />
              <UpgradeButton
                text="Upgrade Miner"
                href="/upgrade"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mining Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Daily Progress</h3>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Daily Goal</span>
                    <span className="font-medium text-gray-900 dark:text-white">12.45 / 15.00 DHT</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '83%'}}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">83% completed</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Weekly Goal</span>
                    <span className="font-medium text-gray-900 dark:text-white">78.90 / 100.00 DHT</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{width: '79%'}}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">79% completed</p>
                </div>
              </div>
            </div>

            {/* Mining Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Achievements</h3>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Mining Streak</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">7 consecutive days</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Power Miner</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">1000+ DHT mined total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Information - Full Width on Large Screens */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="lg:flex">
            <div className="lg:flex-1">
              <Tokenomics />
            </div>
            <div className="lg:flex-1">
              <TokenDetails
                name="Diamond Heist"
                symbol="$DHT"
                totalSupply="1000,000,000.00"
                price="0.80"
                softCap="5,000,000,000.00"
                hardCap="20,000,000,000.00"
              />
            </div>
          </div>
        </div>

        <div className="pb-6"></div>
      </div>
    </div>
  );
};

export default MiningPage;