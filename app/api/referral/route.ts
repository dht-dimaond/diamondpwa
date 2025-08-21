import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { clerkClient } from '@clerk/nextjs/server';

const REFERRAL_BONUS = 10;

async function getClerkUserData(userId: string) {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return {
      clerkId: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userName: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      avatar: user.imageUrl || '', // Add avatar field
    };
  } catch (error) {
    console.error('Failed to fetch user from Clerk:', error);
    throw new Error('Unable to fetch user data from Clerk');
  }
}

async function createOrUpdateUser(userId: string, referrerId?: string) {
  const clerkUserData = await getClerkUserData(userId);
  
  return prisma.user.upsert({
    where: { id: userId },
    update: { 
      referredBy: referrerId,
      referralCode: uuidv4(),
      updatedAt: new Date()
    },
    create: { 
      id: userId,
      ...clerkUserData,
      referredBy: referrerId,
      referralCode: uuidv4(),
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('📡 Processing referral for user:', userId);

    // Check if user already exists and has a referrer
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (existingUser?.referredBy) {
      return NextResponse.json({ 
        success: false, 
        error: 'User already referred' 
      }, { status: 400 });
    }

    // Get referral code from cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('referral_code')?.value;

    if (!referralCode) {
      console.log('ℹ️ No referral code found');
      await createOrUpdateUser(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'User created without referral' 
      });
    }

    // Find referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });

    if (!referrer) {
      console.log(`❌ Invalid referral code: ${referralCode}`);
      await createOrUpdateUser(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'Invalid referral code, user created without referral' 
      });
    }

    // Process referral in transaction
    await prisma.$transaction(async (tx) => {
      // Create/update user with referrer
      await tx.user.upsert({
        where: { id: userId },
        update: {
          referredBy: referrer.id,
          referralCode: uuidv4(),
          updatedAt: new Date(),
        },
        create: { 
          id: userId,
          ...(await getClerkUserData(userId)),
          referredBy: referrer.id,
          referralCode: uuidv4(),
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });

      // Credit referrer
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: REFERRAL_BONUS },
          updatedAt: new Date(),
        },
      });

      // Optional: Log referral transaction
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          packageId: 0, // Keep as 0 if schema requires number, not null
          hashRate: 0,
          priceTON: 0,
          amount: REFERRAL_BONUS,
          date: new Date(),
          boc: 'referral_bonus',
          validity: 'permanent',
          item: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    console.log(`✅ Referral processed: ${userId} → ${referrer.id} (+$${REFERRAL_BONUS})`);

    // Clear referral cookie properly
    const response = NextResponse.json({ 
      success: true, 
      message: 'Referral processed successfully' 
    });
    
    response.cookies.set('referral_code', '', {
      expires: new Date(0),
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('💥 Referral processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process referral' 
    }, { status: 500 });
  }
}