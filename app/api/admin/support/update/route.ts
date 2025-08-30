// app/api/admin/support/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.support_complaints.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ message: 'Complaint status updated successfully' });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}