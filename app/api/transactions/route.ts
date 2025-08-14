// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch user transactions
export async function GET(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const auth = await currentUser();
    
    if (!auth?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, hashRate, priceTON, amount, boc, validity, item } = body;

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.id },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create transaction and update user hashrate in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          packageId,
          hashRate,
          priceTON,
          amount,
          boc,
          validity,
          item
        }
      });

      // Update user's hashrate
      await tx.user.update({
        where: { id: user.id },
        data: { hashrate: hashRate }
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}