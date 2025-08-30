// app/api/admin/dashboard/route.ts
import {  NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const [
      totalUsers,
      totalBalance,
      activeMiners,
      totalTransactions,
      pendingComplaints,
      totalHashrate
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.aggregate({ _sum: { balance: true } }),
      prisma.user.count({ where: { isMining: true } }),
      prisma.transaction.count(),
      prisma.support_complaints.count({ where: { status: 'Open' } }),
      prisma.user.aggregate({ _sum: { hashrate: true } })
    ]);

    const stats = {
      totalUsers,
      totalBalance: totalBalance._sum.balance || 0,
      activeMiners,
      totalTransactions,
      pendingComplaints,
      totalHashrate: totalHashrate._sum.hashrate || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}