// src/components/ProfileCard.tsx
import React from 'react';
import { 
  MessageCircle, 
  Heart, 
  Info, 
  HelpCircle, 
  User as UserIcon,
  Globe,
  Star,
  Shield,
  Wallet,
  TrendingUp,
  Clock,
  Settings,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AvatarUploadForm from '@/components/AvatarUploadForm';
import { updateUserAvatar } from '@/lib/avatarUpload';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs'

interface DatabaseUser {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  userName?: string;
  avatar?: string;
  email: string;
  isAmbassador?: boolean;
  isPremium?: boolean;
  balance: number;
  hashrate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfileCardProps {
  userData: DatabaseUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData }) => {
  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(1)}MH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(1)}KH/s`;
    return `${hashrate}H/s`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-2 space-y-6">
        
        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white overflow-hidden">
          {/* Simple background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            {/* User Info Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 mb-2 rounded-full border-4 border-white/30 overflow-hidden shadow-xl">
                  {userData?.avatar ? (
                    <Image
                      src={userData?.avatar}
                      alt={`${userData?.firstName}'s profile`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-white/20 text-white text-2xl font-bold">
                      {userData?.firstName?.charAt(0).toUpperCase() || userData?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <AvatarUploadForm 
                    userId={userData?.id}
                    formAction={updateUserAvatar}
                  />
                {userData.isPremium && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {userData.firstName} {userData.lastName}
                </h1>
                {userData.userName && (
                  <p className="text-blue-200 text-lg mb-3">@{userData.userName}</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {userData.isAmbassador && (
                    <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                      <Shield className="w-4 h-4 text-amber-300" />
                      <span className="text-sm text-amber-300">Ambassador</span>
                    </div>
                  )}
                  <span className="text-sm text-blue-200">
                    Member since {formatDate(userData.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Account Information
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">User ID</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {userData.id.slice(0, 8)}...{userData.id.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">Email</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {userData.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Settings - 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-4">
              <Link href="/dashboard/referral-system" className="block group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform transition-all hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Invite Friends</h4>
                      <p className="text-blue-100 text-sm">Earn rewards for every referral</p>
                    </div>
                    <Heart className="w-8 h-8 text-blue-200 group-hover:animate-pulse" />
                  </div>
                </div>
              </Link>

            <Link href='/dashboard/support' >
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Contact Support</h4>
                    <p className="text-gray-100 text-sm">Get help when you need it</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-gray-200" />
                </div>
              </div>
            </Link>
            </div>

            {/* Settings & Help */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings & Help
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <Link href="/faq" className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">FAQ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link href="/legal" className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">Legal Information</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;