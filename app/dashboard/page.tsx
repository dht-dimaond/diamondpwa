'use client';

import {  useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMining } from '@/context/MiningContext';
import StreakCounter from '@/components/StreakCounter';
import PriceComponent from '@/components/PriceComponent';
import NavGrid from '@/components/NavGrid';
import SpinToEarn from '@/components/SpinToEarn';
import { 
  TrendingUp, 
  Wallet, 
  Zap, 
  Award,
  Users,
  BarChart3,
  Clock,
  Target,
  LucideGamepad,
  Loader,
  X,
} from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const { user, isLoaded } = useUser();
  const [balance, setBalance] = useState<number>(); 
  const [hashRate, setHashRate] = useState<number>(); 
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [price, setPrice] = useState("0.00");
  const [rank, setRank] = useState('');

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
          setBalance(userData.balance);
          setHashRate(userData.hashrate);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchRank = async () => {
      try {
        const response = await fetch('/api/streak');
        const data = await response.json();
        setRank(data.currentRank);
      } catch (error) {
        console.error('Failed to fetch rank:', error);
      }
    };

    fetchRank();
  
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/price');
        const data = await response.json();
        setPrice(data.price);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    fetchPrice();
    
    const intervalId = setInterval(fetchPrice, 900000); 
    return () => clearInterval(intervalId);
  }, []); 

  const { isMining } = useMining();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="w-full mx-auto">
        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 space-y-6 md:space-y-0">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Header with Streak Counter */}
            <div className="flex items-center justify-center mb-4">
              <StreakCounter />
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-6 h-6" />
                  <span className="text-sm opacity-90">Current Balance</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${isMining ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  {balance?.toFixed(6)} <span className="text-amber-300">DHT</span>
                </p>
                <p className="text-sm opacity-90">$ {price}</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Hashrate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{hashRate}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rank</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rank}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Grid */}
            <NavGrid />

            {/* Price Component */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <PriceComponent />
            </div>

            {/* Mining Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Mining Status</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isMining 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {isMining ? 'Active' : 'Stopped'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mining Power</span>
                  <span className="font-medium text-gray-900 dark:text-white">{hashRate} GH/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                  <span className="font-medium text-green-600">98.5%</span>
                </div>
               {/*} <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Est. Daily Earnings</span>
                  <span className="font-medium text-amber-600">2.45 DHT</span>
                </div>*/}
              </div> 

              <button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                onClick={() => window.location.href = '/dashboard/mine-page'}
              >
                Go to Mining
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Performance Chart Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">24h Change</span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+12.5%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">7d Change</span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+8.2%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Mined</span>
                  <span className="font-medium text-gray-900 dark:text-white">{balance} DHT</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Community</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">25.6K</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Miners</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">8.9M</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total DHT Mined</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/wallet">
                  <button className="flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-medium">Wallet</span>
                  </button>
                </Link>
              
              <Link href="/dashboard/wallet">
                <button className="flex items-center justify-center space-x-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 py-3 px-4 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">History</span>
                </button>
              </Link>

              </div>
            </div>
          </div>
        </div>
        
        <div className="pb-6"></div>
      </div>

      {/* Floating Spin Button */}
      <button
        onClick={() => setShowSpinModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-40"
      >
        <Loader className="w-6 h-6" />
      </button>

      {/* Spin Modal */}
      {showSpinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-auto relative">
            <button
              onClick={() => setShowSpinModal(false)}
              className="absolute top-0 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <SpinToEarn />
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
};

export default HomePage;