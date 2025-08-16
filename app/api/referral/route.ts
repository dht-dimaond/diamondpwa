import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      console.log('❌ Missing userId in request');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('📡 Processing referral for user:', userId);

    // Get referral code from cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('referral_code')?.value;

    if (!referralCode) {
      console.log('ℹ️ No referral code found in cookie');
      // Generate referral code for new user even if not referred
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: uuidv4() },
      });
      return NextResponse.json({ success: true, message: 'No referral code provided, user created with new referral code' });
    }

    // Find referrer by referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });

    if (!referrer) {
      console.log(`❌ Referral code ${referralCode} not found`);
      // Generate referral code for new user
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: uuidv4() },
      });
      return NextResponse.json({ success: true, message: 'Invalid referral code, user created with new referral code' });
    }

    // Check if user is already referred
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (existingUser?.referredBy) {
      console.log('⚠️ User already has a referrer');
      return NextResponse.json({ success: false, error: 'User already referred' }, { status: 400 });
    }

    // Process referral in a transaction
    await prisma.$transaction(async (tx) => {
      // Update new user with referrer ID
      await tx.user.update({
        where: { id: userId },
        data: {
          referredBy: referrer.id,
          referralCode: uuidv4(), // Generate new referral code for the user
          updatedAt: new Date(),
        },
      });

      // Credit referrer's balance
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: 10 },
          updatedAt: new Date(),
        },
      });

      // Log transaction for referrer
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          packageId: 0, // Placeholder, adjust if needed
          hashRate: 0,
          priceTON: 0,
          amount: 10,
          date: new Date(),
          boc: '', // Placeholder, adjust if needed
          validity: 'permanent', // Adjust as needed
          item: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    console.log(`✅ Referral processed: User ${userId} referred by ${referrer.id}, $10 credited`);

    // Clear referral cookie
    cookieStore.delete('referral_code');

    return NextResponse.json({ success: true, message: 'Referral processed successfully' });
  } catch (error) {
    console.error('💥 Referral processing error:', error);
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
  }
}