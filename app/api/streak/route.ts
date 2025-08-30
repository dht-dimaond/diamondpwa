import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { differenceInDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

type UserStreakType = {
  id: string;
  userId: string;
  currentStreak: number;
  highestStreak: number;
  startDate: Date | null;
  lastLogin: Date | null;
  achievedMilestones: number[];
  tokens: number;
};

const MILESTONES = [
  { days: 7, rank:  'Silver', reward: 10 },
  { days: 14, rank: 'Gold', reward: 50 },
  { days: 21, rank: 'Emerald', reward: 100 },
  { days: 30, rank: 'Diamond', reward: 500 },
  { days: 60, rank: 'Universal Ambassador', reward: 1000 },
];

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const clerkUserId = user.id;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) {
      return new Response(JSON.stringify({ error: 'User not found in database' }), { status: 404 });
    }

    const userId = dbUser.id;
    let userStreak: UserStreakType | null = await prisma.userStreak.findUnique({ where: { userId } });

    if (!userStreak) {
      userStreak = await prisma.userStreak.create({
        data: { 
          userId, 
          startDate: new Date(), 
          lastLogin: new Date(), 
          currentStreak: 1,
          highestStreak: 1,
          achievedMilestones: []
        },
      });
      return new Response(JSON.stringify({
        ...userStreak,
        currentRank: 'Bronze',
        unclaimedMilestones: [],
        nextMilestone: MILESTONES[0]
      }), { status: 200 });
    }

    const today = startOfDay(new Date());
    const lastLoginDay = startOfDay(userStreak.lastLogin || new Date(0));
    const daysDiff = differenceInDays(today, lastLoginDay);

    if (daysDiff > 0) {
 //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedData: any = { lastLogin: new Date() };

      if (daysDiff === 1) {
        updatedData.currentStreak = userStreak.currentStreak + 1;
        if (updatedData.currentStreak > userStreak.highestStreak) {
          updatedData.highestStreak = updatedData.currentStreak;
        }
      } else {
        updatedData.currentStreak = 1;
        updatedData.startDate = new Date();
      }

      userStreak = await prisma.userStreak.update({
        where: { userId },
        data: updatedData,
      }) as UserStreakType;
    }

    // TypeScript assertion - userStreak is guaranteed to exist here
    const streak = userStreak!;

    // Calculate current rank
    const currentRank = MILESTONES
      .slice()
      .reverse()
      .find(m => streak.currentStreak >= m.days)?.rank || 'Bronze';

    // Find unclaimed milestones
    const unclaimedMilestones = MILESTONES.filter(
      milestone => 
        streak.currentStreak >= milestone.days && 
        !streak.achievedMilestones.includes(milestone.days)
    );

    // Find next milestone
    const nextMilestone = MILESTONES.find(m => streak.currentStreak < m.days);

    return new Response(JSON.stringify({
      ...streak,
      currentRank,
      unclaimedMilestones,
      nextMilestone
    }), { status: 200 });
  } catch (error) {
    console.error('Error handling streak:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch/update streak' }), { status: 500 });
  }
}