// app/api/migrate-data/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Starting wallet data migration...');

    // Get all users with their transactions
    const users = await prisma.user.findMany({
      include: {
        transactions: true
      }
    });

    console.log(`Found ${users.length} users to migrate`);

    // Process each user
    for (const user of users) {
      console.log(`Processing user: ${user.userName || user.email}`);
      
      // Calculate total spent from existing transactions
      let totalSpent = 0;
      if (user.transactions && user.transactions.length > 0) {
        totalSpent = user.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      }

      console.log(`Calculated totalSpent for ${user.userName}: ${totalSpent}`);

      // Update user with calculated totalSpent
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalSpent: totalSpent
        }
      });

      console.log(`✅ Updated user ${user.userName}: totalSpent=${totalSpent}`);
    }

    // Update transaction types for transactions that don't have a type
    console.log('Updating transaction types...');
    
    const transactionsToUpdate = await prisma.transaction.findMany({
      where: {
        type: undefined
      }
    });

    console.log(`Found ${transactionsToUpdate.length} transactions without type`);

    if (transactionsToUpdate.length > 0) {
      const updateResult = await prisma.transaction.updateMany({
        where: {
          type: undefined
        },
        data: {
          type: 'PURCHASE'
        }
      });

      console.log(`✅ Updated ${updateResult.count} transaction types to PURCHASE`);
    }

    // Create mining sessions for currently mining users
    console.log('Creating mining sessions for active miners...');
    
    const miningUsers = await prisma.user.findMany({
      where: {
        isMining: true,
        miningStartTime: { not: null }
      }
    });

    console.log(`Found ${miningUsers.length} active mining users`);

    for (const user of miningUsers) {
      if (user.miningStartTime) {
        // Check if mining session already exists
        const existingSession = await prisma.miningSession.findFirst({
          where: {
            userId: user.id,
            isActive: true
          }
        });

        if (!existingSession) {
          await prisma.miningSession.create({
            data: {
              userId: user.id,
              startTime: user.miningStartTime,
              hashRate: user.hashrate,
              tokensEarned: user.minedAmount || 0,
              isActive: true
            }
          });
          
          console.log(`✅ Created mining session for user ${user.userName}`);
        } else {
          console.log(`⏭️ Mining session already exists for user ${user.userName}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migration completed successfully!`,
      details: {
        usersProcessed: users.length,
        transactionsUpdated: transactionsToUpdate.length,
        miningUsersProcessed: miningUsers.length
      }
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}