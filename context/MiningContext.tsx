import { createContext, useContext, ReactNode } from 'react';
import { useMiningLogic } from '@/hooks/useMiningLogic';
import { useUser } from '@clerk/nextjs';

interface MiningContextType {
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

const MiningContext = createContext<MiningContextType | null>(null);

export function MiningProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const miningState = useMiningLogic({
    userId: user?.id || '',
    initialBalance: 0,
    initialHashRate: 1000,
  });

  return (
    <MiningContext.Provider value={miningState}>
      {children}
    </MiningContext.Provider>
  );
}

export function useMining() {
  const context = useContext(MiningContext);
  if (!context) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
}