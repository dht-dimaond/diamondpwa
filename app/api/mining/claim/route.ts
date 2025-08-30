import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tokensToAdd } = await request.json();

    if (typeof tokensToAdd !== 'number' || tokensToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid token amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isMining || !user.miningStartTime) {
      return NextResponse.json({ error: 'No active mining session' }, { status: 400 });
    }


    const miningDuration = Date.now() - user.miningStartTime.getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (miningDuration < TWENTY_FOUR_HOURS) {
      return NextResponse.json({ error: 'Mining session not complete yet' }, { status: 400 });
    }

    const now = new Date();


    const result = await prisma.$transaction(async (tx) => {

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: user.balance + Math.floor(tokensToAdd),
          isMining: false,
          miningStartTime: null,
          lastClaimTime: now,
          updatedAt: now
        }
      });


      await tx.miningSession.create({
        data: {
          userId: user.id,
          startTime: user.miningStartTime!,
          endTime: new Date(user.miningStartTime!.getTime() + TWENTY_FOUR_HOURS),
          hashRate: user.hashrate,
          tokensEarned: Math.floor(tokensToAdd),
          claimedAt: now,
        }
      });


      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'MINING_CLAIM',
          hashRate: user.hashrate,
          priceTON: 0,
          amount: Math.floor(tokensToAdd),
          boc: '',
          validity: 'VALID',
          item: 0,
        }
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      newBalance: result.balance,
      tokensAdded: Math.floor(tokensToAdd),
      message: 'Tokens claimed successfully'
    });

  } catch (error) {
    console.error('Error claiming tokens:', error);
    return NextResponse.json(
      { error: 'Failed to claim tokens' },
      { status: 500 }
    );
  }
}