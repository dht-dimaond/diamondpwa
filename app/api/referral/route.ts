import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const REFERRAL_BONUS = 10;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('📡 Processing referral for database user ID:', userId);

    // Wait a moment to ensure user creation is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if user exists in database and get their current referral status
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        referredBy: true, 
        referralCode: true,
        clerkId: true,
        firstName: true,
        userName: true
      },
    });

    if (!existingUser) {
      console.log('❌ User not found in database:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in database' 
      }, { status: 404 });
    }

    if (existingUser.referredBy) {
      console.log('ℹ️ User already has a referrer');
      return NextResponse.json({ 
        success: true, 
        message: 'User already referred',
        alreadyReferred: true
      });
    }

    // Get referral code from cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('referral_code')?.value;

    if (!referralCode) {
      console.log('ℹ️ No referral code found in cookies');
      return NextResponse.json({ 
        success: true, 
        message: 'User created without referral - no referral code provided',
        noReferralCode: true
      });
    }

    console.log('🔍 Looking for referrer with code:', referralCode);

    // Find referrer in database
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { 
        id: true, 
        firstName: true, 
        userName: true,
        balance: true 
      },
    });

    if (!referrer) {
      console.log(`❌ Invalid referral code: ${referralCode}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Invalid referral code - user created without referral',
        invalidCode: true
      });
    }

    // Prevent self-referral
    if (referrer.id === userId) {
      console.log('❌ Attempted self-referral');
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot refer yourself' 
      }, { status: 400 });
    }

    console.log(`✅ Found valid referrer: ${referrer.firstName || referrer.userName} (${referrer.id})`);

    // Process referral in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update new user with referrer
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          referredBy: referrer.id,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          firstName: true,
          userName: true,
          referredBy: true
        }
      });

      // Credit referrer with bonus
      const updatedReferrer = await tx.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: REFERRAL_BONUS },
          updatedAt: new Date(),
        },
        select: {
          id: true,
          balance: true,
          firstName: true,
          userName: true
        }
      });

      // Log referral transaction for the referrer
      const transaction = await tx.transaction.create({
        data: {
          userId: referrer.id,
          packageId: 0,
          hashRate: 0,
          priceTON: 0,
          amount: REFERRAL_BONUS,
          date: new Date(),
          boc: `referral_bonus_from_${userId}`,
          validity: 'permanent',
          item: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        newUser: updatedUser,
        referrer: updatedReferrer,
        transaction
      };
    });

    console.log(`✅ Referral processed successfully:`);
    console.log(`   New user: ${result.newUser.firstName || result.newUser.userName} (${result.newUser.id})`);
    console.log(`   Referrer: ${result.referrer.firstName || result.referrer.userName} (${result.referrer.id})`);
    console.log(`   Bonus awarded: ${REFERRAL_BONUS} (New balance: ${result.referrer.balance})`);

    // Clear referral cookie after successful processing
    const response = NextResponse.json({ 
      success: true, 
      message: 'Referral processed successfully',
      data: {
        referrer: {
          id: result.referrer.id,
          name: result.referrer.firstName || result.referrer.userName,
          newBalance: result.referrer.balance
        },
        bonus: REFERRAL_BONUS,
        transactionId: result.transaction.id
      }
    });
    
    response.cookies.set('referral_code', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('💥 Referral processing error:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process referral - please contact support if this persists' 
    }, { status: 500 });
  }
}