// app/api/referral-stats/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET(req: Request) {
  console.log('📡 GET /api/referral-stats started');
  
  try {
    console.log('🔍 Getting current user from Clerk...');
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log('❌ No Clerk user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Clerk user found:', { id: clerkUser.id });

    console.log('🔍 Finding user in database...');
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        referralCode: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      console.log('🔄 Generating referral code for user...');
      const newReferralCode = uuidv4();
      
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: newReferralCode },
      });
      
      user.referralCode = newReferralCode;
      console.log('✅ Referral code generated:', newReferralCode);
    }

    console.log('🔍 Fetching referral statistics...');
    
    // Get users referred by current user
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: user.id },
      select: {
        id: true,
        firstName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Get recent 10 referrals
    });

    // Get total referral earnings from transactions
    const referralTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        amount: 10, // Referral bonus amount
        // You might want to add a specific type or category for referral transactions
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const totalReferrals = referredUsers.length;
    const totalEarnings = referralTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    // Format recent referrals
    const recentReferrals = referredUsers.map(referredUser => ({
      id: referredUser.id,
      firstName: referredUser.firstName || 'User',
      joinDate: referredUser.createdAt.toISOString(),
      earnings: 10, // Each referral earns $10
    }));

    const stats: ReferralStats = {
      totalReferrals,
      totalEarnings,
      referralCode: user.referralCode,
      recentReferrals,
    };

    console.log('✅ Referral stats retrieved:', {
      totalReferrals,
      totalEarnings,
      recentReferralsCount: recentReferrals.length,
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('💥 Referral stats error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}