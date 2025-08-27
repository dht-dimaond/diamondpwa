import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Find existing user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'User not found',
        message: 'Please complete registration first'
      }), { status: 404 });
    }

    // Check if user has already spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSpin = await prisma.userSpin.findFirst({
      where: {
        userId: user.id,
        spinDate: {
          gte: today,
          lt: tomorrow
        },
      },
    });

    if (existingSpin) {
      return new Response(JSON.stringify({ 
        error: 'Daily spin limit reached',
        message: 'Come back tomorrow for another spin!'
      }), { status: 400 });
    }

    // Generate random reward based on wheel segments
    const segments = [
      { reward: 0, weight: 20 },    // Try Again - 20%
      { reward: 10, weight: 30 },   // 10 Tokens - 30%
      { reward: 20, weight: 25 },   // 20 Tokens - 25%
      { reward: 50, weight: 15 },   // 50 Tokens - 15%
      { reward: 100, weight: 8 },   // 100 Tokens - 8%
      { reward: 200, weight: 2 },   // 200 Tokens - 2%
    ];
    
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedReward = 0;
    
    for (const segment of segments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedReward = segment.reward;
        break;
      }
    }

    // Create spin record
    const userSpin = await prisma.userSpin.create({
      data: {
        userId: user.id,
        reward: selectedReward,
        spinDate: new Date()
      }
    });

    // Update user balance and lastSpinDate if reward > 0
    if (selectedReward > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: selectedReward
          },
          lastSpinDate: new Date()
        }
      });
    } else {
      // Update lastSpinDate even for no reward
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSpinDate: new Date()
        }
      });
    }

    const message = selectedReward > 0 
      ? `Congratulations! You won ${selectedReward} tokens!` 
      : "Better luck next time!";

    return new Response(JSON.stringify({
      success: true,
      reward: selectedReward,
      message,
      spinId: userSpin.id
    }), { status: 200 });

  } catch (error) {
    console.error('Spin API error:', error);
    return new Response(JSON.stringify({
      error: 'Spin failed',
      details: (error as Error).message
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}