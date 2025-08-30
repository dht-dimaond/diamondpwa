import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCurrentlyMining } = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newMiningState = !isCurrentlyMining;
    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isMining: newMiningState,
        miningStartTime: newMiningState ? now : null,
        updatedAt: now
      }
    });

    return NextResponse.json({
      success: true,
      isMining: updatedUser.isMining,
      miningStartTime: updatedUser.miningStartTime?.toISOString() || null,
      message: newMiningState ? 'Mining started successfully' : 'Mining stopped successfully'
    });

  } catch (error) {
    console.error('Error toggling mining:', error);
    return NextResponse.json(
      { error: 'Failed to toggle mining state' },
      { status: 500 }
    );
  }
}