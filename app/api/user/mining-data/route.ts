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
      where: { clerkId: auth.id },
      select: {
        balance: true,
        hashrate: true,
        miningStartTime: true,
        isMining: true,
        lastClaimTime: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.balance,
      hashrate: user.hashrate,
      miningStartTime: user.miningStartTime?.toISOString() || null,
      isMining: user.isMining,
      lastClaimTime: user.lastClaimTime?.toISOString() || null,
    });

  } catch (error) {
    console.error('Error fetching mining data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}