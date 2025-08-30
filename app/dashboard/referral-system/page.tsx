'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Copy, Share2, Users, DollarSign, Trophy } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  referralCode: string;
  recentReferrals: {
    id: string;
    firstName: string;
    joinDate: string;
    earnings: number;
  }[];
}

export default function ReferralPage() {
  const { isLoaded } = useUser();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      fetchReferralStats();
    }
  }, [isLoaded]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referral-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?ref=${stats?.referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      const url = getReferralUrl();
      
      // Modern browsers with clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Show error message to user
      alert(`Failed to copy link. Please copy manually: ${getReferralUrl()}`);
    }
  };

  const shareReferral = async () => {
    const url = getReferralUrl();
    const text = `Join me on this amazing platform! Use my referral link to get started: ${url}`;

    if (navigator.share) {
      setShareLoading(true);
      try {
        await navigator.share({
          title: 'Join me!',
          text: text,
          url: url,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          await copyToClipboard();
        }
      } finally {
        setShareLoading(false);
      }
    } else {
      await copyToClipboard();
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your referral stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Invite friends and earn $10 for each successful referral!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalReferrals || 0}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${stats?.totalEarnings || 0}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg per Referral</p>
                <p className="text-3xl font-bold text-purple-600">$10</p>
              </div>
              <Trophy className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Share Your Referral Link</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={getReferralUrl()}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={shareReferral}
                  disabled={shareLoading}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Your referral code: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{stats?.referralCode}</span>
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Share Your Link</h3>
              <p className="text-gray-600 dark:text-gray-400">Copy and share your unique referral link with friends</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Friends Join</h3>
              <p className="text-gray-600 dark:text-gray-400">When someone signs up using your link</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Earn Rewards</h3>
              <p className="text-gray-600 dark:text-gray-400">Get $10 credited to your account instantly</p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Referrals</h2>
            <div className="space-y-4">
              {stats.recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">{referral.firstName[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{referral.firstName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Joined {new Date(referral.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${referral.earnings}</p>
                    <p className="text-xs text-gray-500">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Referrals */}
        {stats?.totalReferrals === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No referrals yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start sharing your referral link to earn your first $10!
            </p>
            <button
              onClick={shareReferral}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}