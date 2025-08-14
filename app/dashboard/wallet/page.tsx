'use client'

import DHTBalanceCard from '@/components/DHTBalanceCard';
import { useState, useEffect } from 'react';
import TransactionsList from '@/components/Transactions';
import Wallet from '@/components/Wallet';
import{ useUser } from '@clerk/nextjs';

export default function Home() {
    const { user, isLoaded } = useUser(); 
  const [balance,setBalance] =useState<number>();
  const [transactions, setTransactions] = useState<any[]>([]);

   
    useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const userTransactions = await response.json();
        setTransactions(userTransactions);
      } catch (err) {
        console.error("Error loading transactions:", err);
      }
    };

    if (isLoaded && user) {
      loadTransactions();
    }
  }, [user, isLoaded]);

  return (
    <div className="flex flex-col justify-center items-center p-2 rounded-lg shadow-lg max-w-4xl mx-auto">
       <DHTBalanceCard balance={balance ?? 0} imageSrc="/coin.png" />
       <Wallet />
      <h1 className="text-3xl font-semibold text-gray-200 mt-6 mb-6">Transaction History</h1>
      <TransactionsList transactions={transactions} />
    </div>
  );
}