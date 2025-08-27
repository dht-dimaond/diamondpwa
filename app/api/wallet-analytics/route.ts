// /api/wallet-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
        miningSessions: {
          where: { isActive: false } // Completed sessions
        },
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

    // Total earned is just the user's current balance
    const totalEarned = user.balance;
    
    // Total spent (purchases, withdraws, swaps that cost money)
    const totalSpent = await calculateTotalSpent(user.id);
    
    // Monthly earnings from various sources
    const monthlyEarnings = await calculateMonthlyEarnings(user.id, startOfMonth);
    
    // Average daily earnings (last 30 days)
    const averageDaily = await calculateAverageDaily(user.id, thirtyDaysAgo);
    
    // Mining rewards
    const miningRewards = await calculateMiningRewards(user.id);

    const walletStats = {
      totalEarned: totalEarned,
      totalSpent: totalSpent,
      monthlyEarnings: monthlyEarnings,
      averageDaily: averageDaily,
      miningRewards: miningRewards,
      balance: user.balance,
      // Additional useful stats
      transactionCount: user.transactions.length,
      totalSpinRewards: user.spins.reduce((sum, spin) => sum + spin.reward, 0)
    };

    return NextResponse.json(walletStats);

  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions for calculations
async function calculateTotalSpent(userId: string): Promise<number> {
  const spending = await prisma.transaction.aggregate({
    where: {
      userId,
      type: {
        in: ['PURCHASE', 'WITHDRAW']
      }
    },
    _sum: {
      amount: true
    }
  });

  return spending._sum.amount || 0;
}

async function calculateMonthlyEarnings(userId: string, startOfMonth: Date): Promise<number> {
  // Earnings from referral bonuses and spin rewards
  const earnings = await prisma.transaction.aggregate({
    where: {
      userId,
      type: {
        in: ['REFERRAL_BONUS', 'SPIN_REWARD']
      },
      date: {
        gte: startOfMonth
      }
    },
    _sum: {
      amount: true
    }
  });

  // Mining earnings from completed sessions this month
  const miningEarnings = await prisma.miningSession.aggregate({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth
      }
    },
    _sum: {
      tokensEarned: true
    }
  });

  // Spin rewards this month
  const spinRewards = await prisma.userSpin.aggregate({
    where: {
      userId,
      spinDate: {
        gte: startOfMonth
      }
    },
    _sum: { reward: true }
  });

  return (earnings._sum.amount || 0) + (miningEarnings._sum.tokensEarned || 0) + (spinRewards._sum.reward || 0);
}

async function calculateAverageDaily(userId: string, thirtyDaysAgo: Date): Promise<number> {
  // Earnings from transactions
  const earnings = await prisma.transaction.aggregate({
    where: {
      userId,
      type: {
        in: ['REFERRAL_BONUS', 'SPIN_REWARD']
      },
      date: {
        gte: thirtyDaysAgo
      }
    },
    _sum: {
      amount: true
    }
  });

  // Mining earnings from last 30 days
  const miningEarnings = await prisma.miningSession.aggregate({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    _sum: {
      tokensEarned: true
    }
  });

  // Spin rewards from last 30 days
  const spinRewards = await prisma.userSpin.aggregate({
    where: {
      userId,
      spinDate: {
        gte: thirtyDaysAgo
      }
    },
    _sum: { reward: true }
  });

  const totalEarnings = (earnings._sum.amount || 0) + (miningEarnings._sum.tokensEarned || 0) + (spinRewards._sum.reward || 0);
  return totalEarnings / 30; // Average over 30 days
}

async function calculateMiningRewards(userId: string): Promise<number> {
  // From completed mining sessions
  const miningFromSessions = await prisma.miningSession.aggregate({
    where: {
      userId,
      isActive: false
    },
    _sum: {
      tokensEarned: true
    }
  });

  // Current mining amount (if actively mining)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { minedAmount: true }
  });

  return (miningFromSessions._sum.tokensEarned || 0) + (user?.minedAmount || 0);
}