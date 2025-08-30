// app/api/admin/users/update-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, balance } = body;

    if (!userId || balance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: parseInt(balance) }
    });

    return NextResponse.json({ message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Update balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}