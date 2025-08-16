// app/api/user/hashrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hashrate } = await request.json();

    await prisma.user.update({
      where: { clerkId: auth.id },
      data: { hashrate: hashrate }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hashrate:', error);
    return NextResponse.json({ error: 'Failed to update hashrate' }, { status: 500 });
  }
}