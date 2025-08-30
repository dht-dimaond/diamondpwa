import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await the params Promise
    const { userId } = await params;
    
    const auth = await currentUser();
    
    if (!auth?.id || auth.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { miningStartTime, isMining } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        miningStartTime: miningStartTime ? new Date(miningStartTime) : null,
        isMining: isMining,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      miningState: {
        miningStartTime: updatedUser.miningStartTime,
        isMining: updatedUser.isMining
      }
    });

  } catch (error) {
    console.error('Error updating mining state:', error);
    return NextResponse.json(
      { error: 'Failed to update mining state' },
      { status: 500 }
    );
  }
}