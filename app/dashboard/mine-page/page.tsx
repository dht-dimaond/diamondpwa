'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import UpgradeButton from '@/components/UpgradeButton';
import ClaimButton from '@/components/ClaimButton';
import { 
  ArrowLeft, Zap, Activity, Settings, Award, Play, Pause, Timer
} from 'lucide-react';

import {
  UserMiningData,
  MiningCalculation,
  fetchUserMiningData,
  calculateMiningState,
  toggleMiningSession,
  claimMiningRewards,
  getMiningStatusText,
  formatHashrate,
  formatTokenAmount,
} from '@/lib/mining-utils';

const MiningPage = () => {
  const router = useRouter();
  const { user } = useUser();
  
  const [userData, setUserData] = useState<UserMiningData>({
    balance: 0,
    hashrate: 100,
    miningStartTime: null,
    isMining: false
  });
  const [miningState, setMiningState] = useState<MiningCalculation>({
    simulatedAmount: 0,
    miningProgress: 0,
    timeRemaining: '00:00:00',
    isClaimable: false,
    expectedReward: 0
  });
  const [loading, setLoading] = useState(false);

  // Update mining display using utilities
  const updateMiningDisplay = useCallback(() => {
    const newMiningState = calculateMiningState(userData);
    setMiningState(newMiningState);

    // If mining completed, update backend
    if (newMiningState.isClaimable && userData.isMining && user?.id) {
      toggleMiningSession(user.id, true); // Stop mining on backend
      setUserData(prev => ({ ...prev, isMining: false }));
    }
  }, [userData, user?.id]);

  // Fetch user data using utility
  const loadUserData = async () => {
    const data = await fetchUserMiningData();
    if (data) {
      setUserData(data);
    }
  };

  // Start/Stop mining using utility
  const handleToggleMining = async () => {
    if (loading || !user?.id || miningState.isClaimable) return;
    
    setLoading(true);
    try {
      const result = await toggleMiningSession(user.id, userData.isMining);
      
      if (result.success) {
        const newMiningState = !userData.isMining;
        setUserData(prev => ({
          ...prev,
          miningStartTime: newMiningState ? new Date().toISOString() : null,
          isMining: newMiningState
        }));
        
        if (!newMiningState) {
          // Reset display when stopping
          setMiningState({
            simulatedAmount: 0,
            miningProgress: 0,
            timeRemaining: '00:00:00',
            isClaimable: false,
            expectedReward: miningState.expectedReward
          });
        }
      } else {
        alert(result.error || 'Failed to toggle mining');
      }
    } catch (error) {
      console.error('Error toggling mining:', error);
      alert('Failed to start/stop mining');
    } finally {
      setLoading(false);
    }
  };

  // Claim tokens using utility
  const handleClaimTokens = async () => {
    if (!miningState.isClaimable || loading || !user?.id) return;
    
    setLoading(true);
    try {
      const result = await claimMiningRewards(user.id, miningState.simulatedAmount);
      
      if (result.success) {
        setUserData(prev => ({
          ...prev,
          balance: result.newBalance || prev.balance,
          miningStartTime: null,
          isMining: false,
          lastClaimTime: new Date().toISOString()
        }));
        
        setMiningState({
          simulatedAmount: 0,
          miningProgress: 0,
          timeRemaining: '00:00:00',
          isClaimable: false,
          expectedReward: miningState.expectedReward
        });
        
        alert(`Successfully claimed ${formatTokenAmount(miningState.simulatedAmount)} DHT!\nNew Balance: ${formatTokenAmount(result.newBalance || 0, 2)} DHT`);
      } else {
        alert(result.error || 'Failed to claim tokens');
      }
    } catch (error) {
      console.error('Error claiming tokens:', error);
      alert('Failed to claim tokens');
    } finally {
      setLoading(false);
    }
  };

  // Get status info using utility
  const statusInfo = getMiningStatusText(userData, miningState.isClaimable);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  // Update display every second
  useEffect(() => {
    const interval = setInterval(updateMiningDisplay, 1000);
    return () => clearInterval(interval);
  }, [updateMiningDisplay]);

  // Initial display update
  useEffect(() => {
    updateMiningDisplay();
  }, [userData, updateMiningDisplay]);

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
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full"></div>
              </div>
              
              <div className="relative z-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${
                      statusInfo.color === 'green' ? 'bg-green-500' : 
                      statusInfo.color === 'amber' ? 'bg-amber-500' : 'bg-gray-500'
                    }`}>
                      {userData.isMining ? <Play className="w-6 h-6" /> : 
                       miningState.isClaimable ? <Award className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Mining Status</p>
                      <p className="font-semibold">{statusInfo.status}</p>
                    </div>
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full ${
                    statusInfo.color === 'green' ? 'bg-green-400 animate-pulse' : 
                    statusInfo.color === 'amber' ? 'bg-amber-400 animate-bounce' : 'bg-gray-400'
                  }`}></div>
                </div>

                {/* Timer Display */}
                {(userData.isMining || miningState.isClaimable) && (
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Timer className="w-5 h-5 text-amber-300" />
                      <span className="text-sm opacity-90">
                        {userData.isMining ? 'Time Remaining' : 'Session Completed'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold font-mono">
                      {userData.isMining ? miningState.timeRemaining : '00:00:00'}
                    </p>
                  </div>
                )}

                {/* Animated Coins */}
                <div className="mb-6">
                </div>

                {/* Current Mining Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold mb-2">
                      {formatTokenAmount(miningState.simulatedAmount, 8)}
                      <span className="text-2xl text-amber-300 ml-2">DHT</span>
                    </p>
                    <p className="text-sm opacity-90">
                      {miningState.isClaimable ? 'Ready to Claim' : 'Current Session Mined'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>{formatHashrate(userData.hashrate)}</span>
                    </div>
                    <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-300" />
                      <span>{miningState.miningProgress.toFixed(1)}% Complete</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {(userData.isMining || miningState.isClaimable) && (
                  <div className="mb-6">
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          miningState.isClaimable ? 'bg-amber-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min(miningState.miningProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-2 opacity-75">
                      24-Hour Mining Cycle Progress
                    </p>
                  </div>
                )}

                {/* Mining Control Button */}
                <button
                  onClick={handleToggleMining}
                  disabled={loading || miningState.isClaimable}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    userData.isMining
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20'
                      : miningState.isClaimable
                      ? 'bg-gray-500 cursor-not-allowed text-white'
                      : 'bg-white hover:bg-gray-100 text-blue-700 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : userData.isMining ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Stop Mining</span>
                      </>
                    ) : miningState.isClaimable ? (
                      <>
                        <Award className="w-5 h-5" />
                        <span>Claim Tokens First</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Start 24h Mining</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <ClaimButton
                onClick={handleClaimTokens}
                text="Claim Tokens"
                disabled={!miningState.isClaimable || loading}
              />
              <UpgradeButton
                text="Upgrade Miner"
                href="/upgrade"
              />
            </div>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Session Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokenAmount(userData.balance, 2)} DHT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hash Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatHashrate(userData.hashrate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expected Profit</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokenAmount(miningState.expectedReward)} DHT
                  </span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">How It Works</h3>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
                  </div>
                  <p>Start a 24-hour mining session with one click</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">2</span>
                  </div>
                  <p>Tokens are automatically mined based on your hashrate</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">3</span>
                  </div>
                  <p>Claim your rewards after 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningPage;