import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const MILESTONES = [
  { days: 7, rank: 'Bronze', reward: 10 },
  { days: 14, rank: 'Gold', reward: 50 },
  { days: 21, rank: 'Emerald', reward: 100 },
  { days: 30, rank: 'Diamond', reward: 500 },
  { days: 60, rank: 'Universal Ambassador', reward: 1000 },
];

export async function POST() {
  const user = await currentUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const clerkUserId = user.id;

  try {
    const dbUser = await prisma.user.findUnique({ 
      where: { clerkId: clerkUserId },
      include: { streak: true }
    });
    
    if (!dbUser || !dbUser.streak) {
      return new Response(JSON.stringify({ error: 'User or streak not found' }), { status: 404 });
    }

    const userStreak = dbUser.streak;

    // Find unclaimed milestones
    const unclaimedMilestones = MILESTONES.filter(
      milestone => 
        userStreak.currentStreak >= milestone.days && 
        !userStreak.achievedMilestones.includes(milestone.days)
    );

    if (unclaimedMilestones.length === 0) {
      return new Response(JSON.stringify({ error: 'No unclaimed rewards' }), { status: 400 });
    }

    // Calculate total rewards
    const totalReward = unclaimedMilestones.reduce((sum, milestone) => sum + milestone.reward, 0);
    const claimedMilestones = unclaimedMilestones.map(m => m.days);

    // Update user balance and streak milestones in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbUser.id },
        data: { balance: { increment: totalReward } }
      }),
      prisma.userStreak.update({
        where: { userId: dbUser.id },
        data: { 
          achievedMilestones: {
            push: claimedMilestones
          }
        }
      })
    ]);

    return new Response(JSON.stringify({
      success: true,
      claimedRewards: unclaimedMilestones,
      totalReward,
      newBalance: dbUser.balance + totalReward
    }), { status: 200 });

  } catch (error) {
    console.error('Error claiming streak rewards:', error);
    return new Response(JSON.stringify({ error: 'Failed to claim rewards' }), { status: 500 });
  }
}