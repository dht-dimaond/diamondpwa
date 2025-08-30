'use client'

import { useState, useEffect } from 'react';
import TransactionsList from '@/components/Transactions';
import { useUser } from '@clerk/nextjs';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown,
  Wallet as WalletIcon,
  CreditCard,
  History,
  DollarSign,
  Zap,
  Clock,
  Activity,
  Gift
} from 'lucide-react';

// Type definitions for better type safety
interface WalletStats {
  totalEarned: number;
  totalSpent: number;
  monthlyEarnings: number;
  averageDaily: number;
  miningRewards: number;
  balance: number;
  transactionCount: number;
  totalSpinRewards: number;
}

interface PriceData {
  price: number;
  change: number;
}

export default function WalletPage() {
  const { user, isLoaded } = useUser();
  
  const [priceData, setPriceData] = useState<PriceData>({ price: 0, change: 0 });
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalEarned: 0,
    totalSpent: 0,
    monthlyEarnings: 0,
    averageDaily: 0,
    miningRewards: 0,
    balance: 0,
    transactionCount: 0,
    totalSpinRewards: 0
  });
  //eslint-disable-next-line
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Load wallet analytics
        const analyticsResponse = await fetch('/api/wallet-analytics');
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setWalletStats(analyticsData);
        } else {
          throw new Error('Failed to load wallet analytics');
        }

        // Load price data
        const priceResponse = await fetch('/api/price');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          setPriceData({
            price: priceData.price || 0,
            change: priceData.change || 0
          });
        }

        // Load transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (transactionsResponse.ok) {
          const userTransactions = await transactionsResponse.json();
          setTransactions(userTransactions);
        }

      } catch (err) {
        console.error("Error loading wallet data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      loadWalletData();
    }
  }, [user, isLoaded]);

  // Calculate USD value of balance
  const balanceUSD = (walletStats.balance * priceData.price).toFixed(2);

  // Calculate monthly progress (assuming a goal of 1000 DHT per month)
  const monthlyGoal = 1000;
  const monthlyProgress = Math.min((walletStats.monthlyEarnings / monthlyGoal) * 100, 100);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        <div className="space-y-6">
          {/* Wallet Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your DHT tokens and track your earnings</p>
          </div>

          {/* Balance Card */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <WalletIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Total Balance</p>
                    <h2 className="text-4xl font-bold">
                      {walletStats.balance.toFixed(6)}
                      <span className="text-2xl text-amber-300 ml-2">DHT</span>
                    </h2>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-blue-200 text-sm">USD Value</p>
                  <p className="text-2xl font-semibold">$ {balanceUSD}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    {priceData.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className={`text-sm ${priceData.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {priceData.change > 0 ? '+' : ''}{Number(priceData.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <ArrowUpRight className="w-6 h-6 text-green-300 mx-auto mb-2" />
                  <p className="text-lg font-bold">{walletStats.totalEarned.toFixed(2)}</p>
                  <p className="text-xs text-blue-200">Total Earned</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <ArrowDownLeft className="w-6 h-6 text-red-300 mx-auto mb-2" />
                  <p className="text-lg font-bold">{walletStats.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-blue-200">Total Spent</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                  <p className="text-lg font-bold">{walletStats.miningRewards.toFixed(2)}</p>
                  <p className="text-xs text-blue-200">Mining Rewards</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Gift className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                  <p className="text-lg font-bold">{walletStats.totalSpinRewards.toFixed(2)}</p>
                  <p className="text-xs text-blue-200">Spin Rewards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Performance</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {walletStats.monthlyEarnings.toFixed(2)} DHT
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{width: `${Math.min(monthlyProgress, 100)}%`}}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {monthlyProgress.toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-green-600">
                  Goal: {monthlyGoal} DHT
                </p>
              </div>
            </div>

            {/* Daily Average */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Daily Average</h3>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {walletStats.averageDaily.toFixed(2)} DHT
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Per day</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Last 30 days</span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    Consistent earning pattern
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Send DHT</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg transition-colors">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Receive DHT</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 py-3 px-4 rounded-lg transition-colors">
                  <DollarSign className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </div>
              
              {/* Additional Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Total Transactions: {walletStats.transactionCount}</p>
                  <p>Spin Rewards: {walletStats.totalSpinRewards} DHT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <History className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{transactions.length} transactions</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {transactions.length > 0 ? (
                <TransactionsList transactions={transactions} />
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}