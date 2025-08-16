// app/api/user/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { claimAmount } = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id },
      select: { balance: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newBalance = user.balance + claimAmount;

    await prisma.user.update({
      where: { clerkId: auth.id },
      data: { 
        balance: newBalance,
        minedAmount: 0,
        miningStartTime: null,
        isMining: false
      }
    });
    
    return NextResponse.json({ newBalance });
  } catch (error) {
    console.error('Error claiming DHT:', error);
    return NextResponse.json({ error: 'Failed to claim DHT' }, { status: 500 });
  }
}