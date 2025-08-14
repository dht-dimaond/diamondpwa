// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from Neon database using Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        userName: true,
        avatar: true,
        email: true,
        isAmbassador: true,
        balance: true,
        hashrate: true,
        minedAmount: true,
        miningStartTime: true,
        isMining: true,
        isMigrated: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}