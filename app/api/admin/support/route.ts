// app/api/admin/support/route.ts
import {  NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import  { prisma }  from '@/lib/prisma';

export async function GET() {
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

    const complaints = await prisma.support_complaints.findMany({
      orderBy: { created_at: 'desc' },
      take: 50
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

