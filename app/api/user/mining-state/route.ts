// app/api/user/mining-state/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { minedAmount, miningStartTime, isMining } = await request.json();

    await prisma.user.update({
      where: { clerkId: auth.id },
      data: {
        minedAmount: minedAmount,
        miningStartTime: miningStartTime ? new Date(miningStartTime) : null,
        isMining: isMining
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating mining state:', error);
    return NextResponse.json({ error: 'Failed to update mining state' }, { status: 500 });
  }
}
