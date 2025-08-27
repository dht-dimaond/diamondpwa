import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { clientDb } from '@/lib/firebase-client';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface MigrationRequest {
  telegramId?: string;
  skipMigration?: boolean;
}

interface MigrationResponse {
  success: boolean;
  migrated: boolean;
  userData: {
    id: string;
    balance: number;
    hashrate: number;
    telegramId?: string;
    isAmbassador?: boolean;
    createdAt?: string;
    streak?: {
      currentStreak: number;
      highestStreak: number;
      tokens: number;
    };
  };
  error?: string;
  needsMigration?: boolean;
}

function validateTelegramId(id: string): { valid: boolean; parsed?: string; error?: string } {
  if (!/^\d+$/.test(id)) {
    return { valid: false, error: 'Telegram ID must contain only numbers' };
  }
  
  const parsed = parseInt(id);
  if (parsed <= 0 || parsed > 10000000000) {
    return { valid: false, error: 'Invalid Telegram ID range' };
  }
  
  return { valid: true, parsed: id };
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        clerkId: true,
        balance: true,
        hashrate: true,
        telegramId: true,
        isMigrated: true,
        isAmbassador: true,
        createdAt: true,
        streak: {
          select: {
            currentStreak: true,
            highestStreak: true,
            tokens: true,
          }
        }
      },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        migrated: existingUser.isMigrated,
        userData: {
          id: existingUser.id,
          balance: existingUser.balance || 0,
          hashrate: existingUser.hashrate || 0,
          telegramId: existingUser.telegramId || undefined,
          isAmbassador: existingUser.isAmbassador || false,
          createdAt: existingUser.createdAt.toISOString(),
          streak: existingUser.streak || {
            currentStreak: 0,
            highestStreak: 0,
            tokens: 0,
          },
        },
        error: 'User already exists',
      });
    }
    
    const body: MigrationRequest = await req.json();
    const { telegramId, skipMigration } = body;

    let balance = 0;
    let hashrate = 10;
    let migrated = false;
    let finalTelegramId: string | null = null;
    let migrationError: string | null = null;
    let migratedData: {
      balance: number;
      hashrate: number;
      isAmbassador: boolean;
      createdAt: Date | null;
    } | null = null;

    if (telegramId && !skipMigration) {
      const validation = validateTelegramId(telegramId);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      finalTelegramId = validation.parsed!;

      const existingTelegramUser = await prisma.user.findUnique({
        where: { telegramId: finalTelegramId },
        select: { id: true, clerkId: true },
      });

      if (existingTelegramUser) {
        return NextResponse.json(
          { error: 'This Telegram ID is already linked to another account' },
          { status: 409 }
        );
      }

      try {
        const telegramIdNumber = parseInt(finalTelegramId);
        
        const qNumber = query(
          collection(clientDb, 'users'),
          where('telegramId', '==', telegramIdNumber),
          limit(1)
        );
        
        let snapshot = await getDocs(qNumber);
        
        if (snapshot.empty) {
          const qString = query(
            collection(clientDb, 'users'),
            where('telegramId', '==', finalTelegramId),
            limit(1)
          );
          snapshot = await getDocs(qString);
        }

        if (!snapshot.empty) {
          const legacyDoc = snapshot.docs[0];
          const legacyData = legacyDoc.data();
          
          balance = typeof legacyData.balance === 'number' ? Math.max(0, legacyData.balance) : 0;
          hashrate = typeof legacyData.hashrate === 'number' ? Math.max(10, legacyData.hashrate) : 10;
          const isAmbassador = Boolean(legacyData.isAmbassador);
          
          let legacyCreatedAt: Date | null = null;
          if (legacyData.createdAt) {
            if (legacyData.createdAt.toDate && typeof legacyData.createdAt.toDate === 'function') {
              legacyCreatedAt = legacyData.createdAt.toDate();
            } else if (typeof legacyData.createdAt === 'string') {
              const parsed = new Date(legacyData.createdAt);
              if (!isNaN(parsed.getTime())) {
                legacyCreatedAt = parsed;
              }
            } else if (typeof legacyData.createdAt === 'number') {
              legacyCreatedAt = new Date(legacyData.createdAt * 1000);
            }
          }
          
          migrated = true;
          migratedData = {
            balance,
            hashrate,
            isAmbassador,
            createdAt: legacyCreatedAt,
          };
        } else {
          return NextResponse.json({
            success: false,
            migrated: false,
            userData: { id: '', balance: 0, hashrate: 0 },
            error: 'No data found for this Telegram ID. Please check your ID or choose "Start Fresh" instead.',
            needsMigration: true,
          }, { status: 404 });
        }
      } catch (firebaseError) {
        migrationError = 'Unable to check legacy data';
      }
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        firstName: clerkUser.firstName || 'User',
        lastName: clerkUser.lastName || '',
        userName: clerkUser.username || `user_${Date.now()}`,
        avatar: clerkUser.imageUrl || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@temp.com`,
        telegramId: finalTelegramId,
        isAmbassador: migratedData?.isAmbassador || false,
        balance: migratedData?.balance || balance,
        hashrate: migratedData?.hashrate || hashrate,
        isMigrated: migrated,
        createdAt: migratedData?.createdAt || new Date(),
        updatedAt: new Date(),
        streak: {
          create: {
            currentStreak: 0,
            highestStreak: 0,
            tokens: 0,
            achievedMilestones: [],
          }
        }
      },
      select: {
        id: true,
        balance: true,
        hashrate: true,
        telegramId: true,
        isMigrated: true,
        isAmbassador: true,
        createdAt: true,
        streak: {
          select: {
            currentStreak: true,
            highestStreak: true,
            tokens: true,
          }
        }
      },
    });

    const response: MigrationResponse = {
      success: true,
      migrated,
      userData: {
        id: newUser.id,
        balance: newUser.balance,
        hashrate: newUser.hashrate,
        telegramId: newUser.telegramId || undefined,
        isAmbassador: newUser.isAmbassador || false,
        createdAt: newUser.createdAt.toISOString(),
        streak: newUser.streak || {
          currentStreak: 0,
          highestStreak: 0,
          tokens: 0,
        },
      },
    };

    if (telegramId && !skipMigration && !migrated && migrationError) {
      response.error = `Migration attempted but ${migrationError}. Started fresh account instead.`;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('userName')) {
        return NextResponse.json(
          { error: 'Username already taken. Please try again.' },
          { status: 409 }
        );
      }
      if (target?.includes('telegramId')) {
        return NextResponse.json(
          { error: 'This Telegram ID is already linked to another account' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Account already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        migrated: false,
        userData: { id: '', balance: 0, hashrate: 0 },
        error: 'Migration failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true, 
        balance: true, 
        hashrate: true, 
        telegramId: true,
        isMigrated: true,
        isAmbassador: true,
        createdAt: true,
        streak: {
          select: {
            currentStreak: true,
            highestStreak: true,
            tokens: true,
          }
        }
      },
    });

    const result = {
      needsMigration: !existingUser,
      user: existingUser ? {
        id: existingUser.id,
        balance: existingUser.balance,
        hashrate: existingUser.hashrate,
        telegramId: existingUser.telegramId,
        isMigrated: existingUser.isMigrated,
        isAmbassador: existingUser.isAmbassador,
        createdAt: existingUser.createdAt.toISOString(),
        streak: existingUser.streak || {
          currentStreak: 0,
          highestStreak: 0,
          tokens: 0,
        },
      } : null,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}