// /lib/mining-utils.ts
export interface UserMiningData {
    balance: number;
    hashrate: number;
    miningStartTime: string | null;
    isMining: boolean;
    lastClaimTime?: string | null;
  }
  
  export interface MiningCalculation {
    simulatedAmount: number;
    miningProgress: number;
    timeRemaining: string;
    isClaimable: boolean;
    expectedReward: number;
  }
  
  // Constants
  export const MINING_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  export const BASE_REWARD_RATE = 0.00001; // Base rate per hashrate unit
  
  /**
   * Calculate expected mining reward based on hashrate
   */
  export const calculateExpectedReward = (hashrate: number): number => {
    return hashrate * BASE_REWARD_RATE * 24;
  };
  
  /**
   * Format milliseconds to HH:MM:SS
   */
  export const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  /**
   * Generate realistic mining simulation numbers
   */
  export const generateRealisticMiningAmount = (
    progress: number, 
    targetAmount: number
  ): number => {
    // Create variance and realistic growth pattern
    const variance = 0.8 + Math.random() * 0.4; // ±20% variance
    const speedMultiplier = 1 + (progress * 0.5); // Accelerate over time
    const baseIncrement = targetAmount * progress;
    
    return Math.min(baseIncrement * variance * speedMultiplier, targetAmount);
  };
  
  /**
   * Calculate current mining state based on user data
   */
  export const calculateMiningState = (userData: UserMiningData): MiningCalculation => {
    if (!userData.miningStartTime) {
      return {
        simulatedAmount: 0,
        miningProgress: 0,
        timeRemaining: '00:00:00',
        isClaimable: false,
        expectedReward: calculateExpectedReward(userData.hashrate)
      };
    }
  
    const startTime = new Date(userData.miningStartTime).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / MINING_DURATION, 1);
    const remaining = Math.max(MINING_DURATION - elapsed, 0);
    const expectedReward = calculateExpectedReward(userData.hashrate);
    
    const isCompleted = elapsed >= MINING_DURATION;
    const simulatedAmount = isCompleted 
      ? expectedReward 
      : generateRealisticMiningAmount(progress, expectedReward);
  
    return {
      simulatedAmount,
      miningProgress: progress * 100,
      timeRemaining: formatTimeRemaining(remaining),
      isClaimable: isCompleted && !userData.isMining,
      expectedReward
    };
  };
  
  /**
   * Get mining status text based on current state
   */
  export const getMiningStatusText = (userData: UserMiningData, isClaimable: boolean): {
    status: string;
    description: string;
    color: 'green' | 'amber' | 'gray';
  } => {
    if (userData.isMining) {
      return {
        status: 'Active Mining',
        description: 'Mining in progress',
        color: 'green'
      };
    }
    
    if (isClaimable) {
      return {
        status: 'Ready to Claim',
        description: 'Tokens available',
        color: 'amber'
      };
    }
    
    return {
      status: 'Mining Stopped',
      description: 'Start mining to earn tokens',
      color: 'gray'
    };
  };
  
  /**
   * Format hashrate for display
   */
  export const formatHashrate = (hashrate: number): string => {
    if (hashrate >= 1000000) {
      return `${(hashrate / 1000000).toFixed(1)}M GH/s`;
    }
    if (hashrate >= 1000) {
      return `${(hashrate / 1000).toFixed(1)}K GH/s`;
    }
    return `${hashrate.toLocaleString()} GH/s`;
  };
  
  /**
   * Format token amount for display
   */
  export const formatTokenAmount = (amount: number, decimals: number = 6): string => {
    return amount.toFixed(decimals);
  };
  
  /**
   * Check if user can start mining (not already mining and no claimable rewards)
   */
  export const canStartMining = (userData: UserMiningData): boolean => {
    const miningState = calculateMiningState(userData);
    return !userData.isMining && !miningState.isClaimable;
  };
  
  /**
   * Get time until next mining session can start
   */
  export const getNextMiningAvailability = (lastClaimTime: string | null): {
    canMineNow: boolean;
    timeUntilNext: string;
  } => {
    if (!lastClaimTime) {
      return { canMineNow: true, timeUntilNext: '00:00:00' };
    }
    
    const lastClaim = new Date(lastClaimTime).getTime();
    const now = Date.now();
    const cooldown = 0; // No cooldown in your system, but ready for future use
    const timeUntilNext = Math.max(cooldown - (now - lastClaim), 0);
    
    return {
      canMineNow: timeUntilNext === 0,
      timeUntilNext: formatTimeRemaining(timeUntilNext)
    };
  };
  
  // API Helper Functions
  /**
   * Fetch user mining data from API
   */
  export const fetchUserMiningData = async (): Promise<UserMiningData | null> => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  
  /**
   * Start or stop mining session
   */
  export const toggleMiningSession = async (
    userId: string, 
    currentlyMining: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const startTime = currentlyMining ? null : Date.now();
      
      const response = await fetch(`/api/user/${userId}/mining-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          miningStartTime: startTime ? new Date(startTime).toISOString() : null,
          isMining: !currentlyMining
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle mining');
      }
  
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  /**
   * Claim mining rewards
   */
  export const claimMiningRewards = async (
    userId: string, 
    claimAmount: number
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
    try {
      const response = await fetch(`/api/user/${userId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimAmount })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim rewards');
      }
  
      const result = await response.json();
      return { success: true, newBalance: result.newBalance };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  /**
   * Get mining statistics for dashboard/profile
   */
  export const getMiningStats = async (): Promise<{
    totalEarned: number;
    totalSessions: number;
    currentStreak: number;
    expectedDailyReward: number;
  } | null> => {
    try {
      const response = await fetch('/api/mining-stats');
      if (!response.ok) throw new Error('Failed to fetch mining stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching mining stats:', error);
      return null;
    }
  };
  
  /**
   * Calculate mining efficiency based on recent sessions
   */
  export const calculateMiningEfficiency = (
    recentSessions: Array<{ tokensEarned: number; hashRate: number }>
  ): number => {
    if (recentSessions.length === 0) return 100;
    
    const averageActual = recentSessions.reduce((sum, session) => 
      sum + session.tokensEarned, 0) / recentSessions.length;
      
    const averageExpected = recentSessions.reduce((sum, session) => 
      sum + calculateExpectedReward(session.hashRate), 0) / recentSessions.length;
    
    return Math.min((averageActual / averageExpected) * 100, 100);
  };