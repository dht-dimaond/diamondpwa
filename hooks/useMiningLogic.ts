import { useState, useEffect, useRef, useCallback } from 'react';
import { prisma } from '@/lib/prisma';

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

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            balance: true, 
            hashrate: true,
            miningStartTime: true,
            minedAmount: true
          }
        });
        
        if (userData) {
          setBalance(userData.balance || initialBalance);
          setHashRate(userData.hashrate || initialHashRate);
          
          // Restore mining state if user was mining
          if (userData.miningStartTime && userData.minedAmount !== null) {
            const elapsedSeconds = (Date.now() - userData.miningStartTime.getTime()) / 1000;
            const offlineEarnings = 0.00278 * userData.hashrate * elapsedSeconds;
            const totalMined = Math.min(MAX_MINABLE_AMOUNT, userData.minedAmount + offlineEarnings);
            
            setMinedAmount(totalMined);
            setMiningStartTime(userData.miningStartTime.getTime());
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
  }, [userId, initialBalance, initialHashRate]);

  const getMiningRate = useCallback((): number => {
    return 0.00278 * hashRate;
  }, [hashRate]);

  const cleanupMining = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Save mining state to database
  const saveMiningState = useCallback(async (amount: number, startTime: number | null, isActive: boolean) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          minedAmount: amount,
          miningStartTime: startTime ? new Date(startTime) : null,
          isMining: isActive
        }
      });
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
      
      // Save state to database
      saveMiningState(minedAmount, startTime, newMiningState);
      
      return newMiningState;
    });
  }, [minedAmount, saveMiningState]);

  const upgradeHashRate = useCallback(async (amount: number): Promise<void> => {
    const newRate = hashRate + amount;
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { hashrate: newRate }
      });
      
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
            
            // Show browser notification instead of Telegram popup
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎉 Mining Complete!', {
                body: 'Claim your 100 DHT tokens!',
                icon: '/coin.png'
              });
            }
            
            return MAX_MINABLE_AMOUNT;
          }
          
          // Periodically save mining progress (every 10 seconds to avoid too many DB calls)
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
      await prisma.user.update({
        where: { id: userId },
        data: { 
          balance: newBalance,
          minedAmount: 0,
          miningStartTime: null,
          isMining: false
        }
      });
      
      setBalance(newBalance);
      setMinedAmount(0);
      setMiningStartTime(null);
      
      const formattedMinedAmount = minedAmount.toFixed(2);
      const formattedNewBalance = newBalance.toFixed(2);
      
      // Use browser alert instead of Telegram popup
      alert(`Successfully claimed ${formattedMinedAmount} DHT!\nNew Balance: ${formattedNewBalance} DHT`);
      console.log(`Claimed ${formattedMinedAmount} DHT. New Balance: ${formattedNewBalance} DHT`);
    } catch (error) {
      console.error('Error updating balance in database:', error);
      // Revert local state on error
      setBalance(balance);
      setMinedAmount(minedAmount);
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