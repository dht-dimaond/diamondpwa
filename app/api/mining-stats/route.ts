import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get mining statistics
    const stats = await prisma.miningSession.aggregate({
      where: { userId: user.id },
      _sum: {
        tokensEarned: true
      },
      _count: {
        id: true
      }
    });


    const recentSessions = await prisma.miningSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const checkDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const sessionExists = await prisma.miningSession.findFirst({
        where: {
          userId: user.id,
          claimedAt: { 
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      if (sessionExists) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({
      totalEarned: stats._sum.tokensEarned || 0,
      totalSessions: stats._count.id || 0,
      currentStreak: streak,
      recentSessions: recentSessions,
      currentHashrate: user.hashrate,
      expectedDailyReward: user.hashrate * 0.00001 * 24
    });

  } catch (error) {
    console.error('Error fetching mining stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mining stats' },
      { status: 500 }
    );
  }
}