// app/api/admin/mining/global-rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { hashrate } = body;

    if (!hashrate || hashrate < 1) {
      return NextResponse.json({ error: 'Invalid hashrate value' }, { status: 400 });
    }

    // Update all users' hashrate globally
    await prisma.user.updateMany({
      data: { hashrate: parseInt(hashrate) }
    });

    return NextResponse.json({ message: 'Global hashrate updated successfully' });
  } catch (error) {
    console.error('Update global hashrate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}