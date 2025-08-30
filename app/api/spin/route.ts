// app/api/spin/route.ts
import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { WHEEL_SEGMENTS, selectRandomReward } from '@/shared/wheel-config';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';

const prisma = new PrismaClient();

// Custom error types for better error handling
class SpinError extends Error {
  constructor(
    message: string, 
    public code: string, 
    public statusCode: number = 400,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'SpinError';
  }
}

export async function POST(request: Request) {
  console.log(request);
  try {
    // Get user authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new SpinError(
        'No authenticated user found',
        'UNAUTHORIZED',
        401,
        'Please log in to spin the wheel'
      );
    }

    // Rate limiting
    const userIdentifier = clerkUser.id;
    const isAllowed = rateLimiter.isAllowed(
      userIdentifier,
      RATE_LIMITS.SPIN_ATTEMPTS.limit,
      RATE_LIMITS.SPIN_ATTEMPTS.windowMs
    );

    if (!isAllowed) {
      const status = rateLimiter.getStatus(userIdentifier);
      const resetTime = Math.ceil(status.remaining / 1000);
      
      throw new SpinError(
        'Rate limit exceeded',
        'RATE_LIMITED',
        429,
        `Too many spin attempts. Please wait ${resetTime} seconds before trying again.`
      );
    }

    // Find existing user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        balance: true,
        lastSpinDate: true,
        email: true
      }
    });

    if (!user) {
      throw new SpinError(
        `User not found for clerkId: ${clerkUser.id}`,
        'USER_NOT_FOUND',
        404,
        'User account not found. Please complete your registration first.'
      );
    }

    // Check if user has already spun today (using UTC for consistency)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const existingSpin = await prisma.userSpin.findFirst({
      where: {
        userId: user.id,
        spinDate: {
          gte: todayStart,
          lt: todayEnd
        },
      },
    });

    if (existingSpin) {
      const hoursUntilReset = Math.ceil((todayEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      throw new SpinError(
        'Daily spin limit reached',
        'DAILY_LIMIT_REACHED',
        400,
        `You've already spun today! Come back in ${hoursUntilReset} hour(s) for your next spin.`
      );
    }

    // Generate random reward
    const selectedReward = selectRandomReward();

    // Execute database operations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create spin record first
      const userSpin = await tx.userSpin.create({
        data: {
          userId: user.id,
          reward: selectedReward,
          spinDate: now
        }
      });

      // Update user balance and lastSpinDate
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: selectedReward > 0 ? {
            increment: selectedReward
          } : undefined,
          lastSpinDate: now
        },
        select: {
          balance: true,
          lastSpinDate: true
        }
      });

      return { userSpin, updatedUser };
    });

    // Generate appropriate message
    const message = selectedReward > 0 
      ? `🎉 Congratulations! You won ${selectedReward} tokens!`
      : "💔 Better luck next time! Try again tomorrow.";

    const responseData = {
      success: true,
      reward: selectedReward,
      message,
      spinId: result.userSpin.id,
      newBalance: result.updatedUser.balance,
      nextSpinAvailable: todayEnd.toISOString(),
      segments: WHEEL_SEGMENTS // Include segments for frontend sync
    };

    console.log(`Spin completed for user ${user.id}: reward=${selectedReward}, newBalance=${result.updatedUser.balance}`);

    return new Response(JSON.stringify(responseData), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Spin API error:', error);

    if (error instanceof SpinError) {
      return new Response(JSON.stringify({
        success: false,
        error: error.code,
        message: error.userMessage || error.message,
        statusCode: error.statusCode
      }), { 
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'DUPLICATE_SPIN',
        message: 'A spin for today already exists. Please try again tomorrow.'
      }), { 
        status: 409,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Generic error response
    return new Response(JSON.stringify({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } finally {
    await prisma.$disconnect();
  }
}