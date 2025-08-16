import { useState, useEffect, useRef, useCallback } from 'react';

interface MiningState {
  balance: number;
  isMining: boolean;
  minedAmount: number;
  miningProgress: number;
  hashRate: number;
  toggleMining: () => void;
  claimDHT: () => void;
  upgradeHashRate: (amount: number) => void;
  isClaimable: boolean;
  formattedBalance: string;
  formattedMinedAmount: string;
  formattedHashRate: string;
}

interface MiningConfig {
  userId: string; 
  initialBalance?: number;
  initialHashRate?: number;
}

export const useMiningLogic = ({
  userId,
  initialBalance = 0,
  initialHashRate = 1
}: MiningConfig): MiningState => {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [hashRate, setHashRate] = useState<number>(initialHashRate);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedAmount, setMinedAmount] = useState<number>(0);
  const [miningStartTime, setMiningStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_MINABLE_AMOUNT = 100;
  const UPDATE_INTERVAL = 1000;

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        if (userData) {
          setBalance(userData.balance || initialBalance);
          setHashRate(userData.hashrate || initialHashRate);
          
          // Restore mining state if user was mining
          if (userData.miningStartTime && userData.minedAmount !== null) {
            const elapsedSeconds = (Date.now() - new Date(userData.miningStartTime).getTime()) / 1000;
            const offlineEarnings = 0.00278 * userData.hashrate * elapsedSeconds;
            const totalMined = Math.min(MAX_MINABLE_AMOUNT, userData.minedAmount + offlineEarnings);
            
            setMinedAmount(totalMined);
            setMiningStartTime(new Date(userData.miningStartTime).getTime());
            setIsMining(totalMined < MAX_MINABLE_AMOUNT);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [initialBalance, initialHashRate]); // Removed userId dependency since we use Clerk auth

  const getMiningRate = useCallback((): number => {
    return 0.00278 * hashRate;
  }, [hashRate]);

  const cleanupMining = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Save mining state via API
  const saveMiningState = useCallback(async (amount: number, startTime: number | null, isActive: boolean) => {
    try {
      const response = await fetch(`/api/user/${userId}/mining-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minedAmount: amount,
          miningStartTime: startTime ? new Date(startTime).toISOString() : null,
          isMining: isActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save mining state');
      }
    } catch (error) {
      console.error('Error saving mining state:', error);
    }
  }, [userId]);

  const toggleMining = useCallback((): void => {
    setIsMining(prevMining => {
      const newMiningState = !prevMining;
      const startTime = newMiningState ? Date.now() : null;
      
      if (newMiningState) {
        setMiningStartTime(startTime);
      } else {
        setMiningStartTime(null);
      }
      
      // Save state to database via API
      saveMiningState(minedAmount, startTime, newMiningState);
      
      return newMiningState;
    });
  }, [minedAmount, saveMiningState]);

  const upgradeHashRate = useCallback(async (amount: number): Promise<void> => {
    const newRate = hashRate + amount;
    
    try {
      const response = await fetch(`/api/user/${userId}/hashrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hashrate: newRate })
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade hashrate');
      }
      
      setHashRate(newRate);
      
      // Update mining state with new hashrate
      if (isMining) {
        saveMiningState(minedAmount, miningStartTime, true);
      }
    } catch (error) {
      console.error('Error upgrading hashrate:', error);
    }
  }, [hashRate, isMining, minedAmount, miningStartTime, saveMiningState, userId]);

  // Mining interval effect
  useEffect(() => {
    if (isMining) {
      intervalRef.current = setInterval(() => {
        setMinedAmount(prev => {
          const newAmount = prev + getMiningRate();
          if (newAmount >= MAX_MINABLE_AMOUNT) {
            cleanupMining();
            setIsMining(false);
            setMiningStartTime(null);
            
            // Save completed mining state
            saveMiningState(MAX_MINABLE_AMOUNT, null, false);
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎉 Mining Complete!', {
                body: 'Claim your 100 DHT tokens!',
                icon: '/coin.png'
              });
            }
            
            return MAX_MINABLE_AMOUNT;
          }
          
          // Periodically save mining progress (every 10 seconds to avoid too many API calls)
          if (Math.floor(newAmount * 10) % 10 === 0) {
            saveMiningState(newAmount, miningStartTime, true);
          }
          
          return newAmount;
        });
      }, UPDATE_INTERVAL);
    } else {
      cleanupMining();
    }

    return cleanupMining;
  }, [isMining, cleanupMining, getMiningRate, miningStartTime, saveMiningState]);

  const claimDHT = useCallback(async (): Promise<void> => {
    if (minedAmount < MAX_MINABLE_AMOUNT) {
      throw new Error('Mining must be complete before claiming.');
    }

    const newBalance = balance + minedAmount;

    try {
      const response = await fetch(`/api/user/${userId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          claimAmount: minedAmount 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to claim DHT');
      }

      const result = await response.json();
      
      setBalance(result.newBalance);
      setMinedAmount(0);
      setMiningStartTime(null);
      
      const formattedMinedAmount = minedAmount.toFixed(2);
      const formattedNewBalance = result.newBalance.toFixed(2);
      
      // Use browser alert
      alert(`Successfully claimed ${formattedMinedAmount} DHT!\nNew Balance: ${formattedNewBalance} DHT`);
      console.log(`Claimed ${formattedMinedAmount} DHT. New Balance: ${formattedNewBalance} DHT`);
    } catch (error) {
      console.error('Error claiming DHT:', error);
      throw error;
    }
  }, [minedAmount, balance, userId]);

  const miningProgress = (minedAmount / MAX_MINABLE_AMOUNT) * 100;

  return {
    balance,
    isMining,
    minedAmount,
    miningProgress,
    hashRate,
    toggleMining,
    claimDHT,
    upgradeHashRate,
    isClaimable: minedAmount >= MAX_MINABLE_AMOUNT,
    formattedBalance: balance.toFixed(2),
    formattedMinedAmount: minedAmount.toFixed(3),
    formattedHashRate: `${hashRate.toFixed(1)} GH/s`
  };
};