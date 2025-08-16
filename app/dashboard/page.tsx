// app/page.tsx
'use client';

import { type FC, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import UpgradeButton from '@/components/UpgradeButton';
import ClaimButton from '@/components/ClaimButton';
import DHTBalanceCard from '@/components/DHTBalanceCard';
import AnimatedCoins from '@/components/AnimatedCoins';
import TokenDetails from '@/components/TokenDetails';
import { useMining } from '@/context/MiningContext';
import Tokenomics from '@/components/Tokennomics';
import PriceComponent from '@/components/PriceComponent';

const HomePage = () => {
  const { user, isLoaded } = useUser();
  const [initialBalance, setInitialBalance] = useState<number>(); 
  const [initialHashRate, setInitialHashRate] = useState<number>(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) {
          console.error("User ID is missing");
          return;
        }
  
        const res = await fetch(`/api/user?userId=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
  
        const userData = await res.json();
  
        if (userData) {
          setInitialBalance(userData.balance);
          setInitialHashRate(userData.hashrate);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded]);
  

  const {
    balance,
    isMining,
    minedAmount,
    toggleMining,
    claimDHT,
    formattedHashRate,
    isClaimable,
  } = useMining();

  if (!isLoaded) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="min-h-screen p-2 w-screen max-w-full overflow-x-hidden">
      <div className="max-w-l mx-auto">
        <div className="flex flex-col gap-4 mt-2 border-2 border-gray-700 rounded-xl p-4 shadow-xl bg-gradient-to-b from-gray-900/80 to-black/50">
          <DHTBalanceCard balance={balance} imageSrc="/coin.png" />
          <div className="flex items-center justify-between border-t border-gray-700/50 pt-2">
            <div className="flex items-center">
              <span className="text-blue-200">$ DHT </span>
            </div>
            <PriceComponent />
          </div>
        </div>
        
        <div className="mt-4 mb-4 border-2 border-gray-700 rounded-xl p-2 shadow-xl bg-gradient-to-b from-gray-900/80 to-black/50">
          <AnimatedCoins isMining={isMining} />

          <div className="text-center mb-6">
            <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-1000 rounded-lg p-4 backdrop-blur-md">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-blue-600 shadow-lg bg-clip-text rounded-full text-transparent animate-gradient">
                {minedAmount.toFixed(6)}{' '}
                <span className="font-mono bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  $DHT
                </span>
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isMining ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`}
                ></div>
                <p className="text-sm text-gray-300">
                  Hashrate: <span className="font-mono">{formattedHashRate}</span> ⚡️
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={toggleMining}
              className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-all transform hover:scale-105 ${
                isMining
                  ? 'bg-gradient-to-r from-amber-600 to-amber-800 animate-pulse shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-black/30 to-blue-600 shadow-lg shadow-blue-500/50 animate-pulse'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {isMining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mining in progress..</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Start Mining</span>
                  </>
                )}
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <ClaimButton
                onClick={claimDHT}
                text="Claim Tokens"
                disabled={!isClaimable}
              />
              <UpgradeButton
                text={`Upgrade miner`}
                href="/upgrade"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 border-2 border-gray-700 rounded-xl p-6 shadow-xl bg-gradient-to-b from-gray-900/80 to-black/50">
          <Tokenomics />
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
  );
};

export default HomePage;