// /api/wallet-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Using your existing prisma instance

export async function GET(request: NextRequest) {
  console.log(request)
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        transactions: {
          orderBy: { date: 'desc' }
        },
        miningSessions: true,
        spins: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Total spent from transactions
    const spentTransactions = user.transactions.filter(t => 
      t.type === 'PURCHASE' || t.type === 'WITHDRAW'
    );
    const totalSpent = spentTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Monthly earnings from transactions
    const monthlyTransactions = user.transactions.filter(t => 
      t.date >= startOfMonth && 
      (t.type === 'REFERRAL_BONUS' || t.type === 'SPIN_REWARD' || t.type === 'MINING_CLAIM')
    );
    const monthlyFromTransactions = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Monthly from mining sessions
    const monthlySessions = user.miningSessions.filter(s => s.createdAt >= startOfMonth);
    const monthlyFromMining = monthlySessions.reduce((sum, s) => sum + s.tokensEarned, 0);

    // Monthly from spins
    const monthlySpins = user.spins.filter(s => s.spinDate >= startOfMonth);
    const monthlyFromSpins = monthlySpins.reduce((sum, s) => sum + s.reward, 0);

    const monthlyEarnings = monthlyFromTransactions + monthlyFromMining + monthlyFromSpins;

    // 30-day earnings
    const recentTransactions = user.transactions.filter(t => 
      t.date >= thirtyDaysAgo && 
      (t.type === 'REFERRAL_BONUS' || t.type === 'SPIN_REWARD' || t.type === 'MINING_CLAIM')
    );
    const recentFromTransactions = recentTransactions.reduce((sum, t) => sum + t.amount, 0);

    const recentSessions = user.miningSessions.filter(s => s.createdAt >= thirtyDaysAgo);
    const recentFromMining = recentSessions.reduce((sum, s) => sum + s.tokensEarned, 0);

    const recentSpins = user.spins.filter(s => s.spinDate >= thirtyDaysAgo);
    const recentFromSpins = recentSpins.reduce((sum, s) => sum + s.reward, 0);

    const thirtyDayEarnings = recentFromTransactions + recentFromMining + recentFromSpins;
    const averageDaily = thirtyDayEarnings / 30;

    // Total mining rewards
    const totalMiningFromSessions = user.miningSessions.reduce((sum, s) => sum + s.tokensEarned, 0);
    
    // Add current mining progress if user is mining
    let currentMiningAmount = 0;
    if (user.isMining && user.miningStartTime) {
      const miningDuration = Date.now() - user.miningStartTime.getTime();
      const hoursOfMining = miningDuration / (1000 * 60 * 60);
      currentMiningAmount = Math.min(hoursOfMining * user.hashrate, 24 * user.hashrate);
    }

    const totalMiningRewards = totalMiningFromSessions + currentMiningAmount;

    // Total spin rewards
    const totalSpinRewards = user.spins.reduce((sum, s) => sum + s.reward, 0);

    const walletStats = {
      totalEarned: user.balance,
      totalSpent: totalSpent,
      monthlyEarnings: monthlyEarnings,
      averageDaily: averageDaily,
      miningRewards: totalMiningRewards,
      balance: user.balance,
      transactionCount: user.transactions.length,
      totalSpinRewards: totalSpinRewards,
      isMining: user.isMining,
      miningStartTime: user.miningStartTime,
      hashRate: user.hashrate
    };

    return NextResponse.json(walletStats);

  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}