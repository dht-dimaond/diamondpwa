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
    id: string; // Added
    balance: number;
    hashrate: number;
    telegramId?: string;
    isAmbassador?: boolean;
    createdAt?: string;
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
  console.log('📡 POST /api/migrate-on-signup started');
  
  try {
    console.log('🔍 Getting current user from Clerk...');
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log('❌ No Clerk user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Clerk user found:', { 
      id: clerkUser.id, 
      firstName: clerkUser.firstName,
      email: clerkUser.emailAddresses[0]?.emailAddress 
    });

    console.log('🔍 Checking if user exists in database...');
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
      },
    });

    if (existingUser) {
      console.log('✅ User already exists in database:', {
        id: existingUser.id,
        balance: existingUser.balance,
        isMigrated: existingUser.isMigrated,
        isAmbassador: existingUser.isAmbassador,
      });
      return NextResponse.json({
        success: true,
        migrated: existingUser.isMigrated,
        userData: {
          id: existingUser.id, // Added
          balance: existingUser.balance || 0,
          hashrate: existingUser.hashrate || 0,
          telegramId: existingUser.telegramId || undefined,
          isAmbassador: existingUser.isAmbassador || false,
          createdAt: existingUser.createdAt.toISOString(),
        },
        error: 'User already exists',
      });
    }

    console.log('📝 User does not exist, proceeding with migration...');
    
    const body: MigrationRequest = await req.json();
    const { telegramId, skipMigration } = body;
    
    console.log('📊 Migration request:', { telegramId, skipMigration });

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
      console.log('🔄 Attempting Telegram migration...');
      const validation = validateTelegramId(telegramId);
      
      if (!validation.valid) {
        console.log('❌ Invalid Telegram ID:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      finalTelegramId = validation.parsed!;
      console.log('✅ Valid Telegram ID:', finalTelegramId);

      console.log('🔍 Checking if Telegram ID already exists...');
      const existingTelegramUser = await prisma.user.findUnique({
        where: { telegramId: finalTelegramId },
        select: {
          id: true,
          clerkId: true,
        },
      });

      if (existingTelegramUser) {
        console.log('❌ Telegram ID already linked to another user');
        return NextResponse.json(
          { error: 'This Telegram ID is already linked to another account' },
          { status: 409 }
        );
      }

      try {
        console.log('🔍 Querying Firebase for legacy data...');
        const telegramIdNumber = parseInt(finalTelegramId);
        
        console.log(`🔍 Looking for telegramId: ${telegramIdNumber} (number) or "${finalTelegramId}" (string)`);
        
        const qNumber = query(
          collection(clientDb, 'users'),
          where('telegramId', '==', telegramIdNumber),
          limit(1)
        );
        
        let snapshot = await getDocs(qNumber);
        
        if (snapshot.empty) {
          console.log('🔍 Not found as number, trying as string...');
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
          console.log('✅ Found legacy data:', {
            docId: legacyDoc.id,
            telegramId: legacyData.telegramId,
            balance: legacyData.balance,
            hashrate: legacyData.hashrate,
            isAmbassador: legacyData.isAmbassador,
            createdAt: legacyData.createdAt,
            allFields: Object.keys(legacyData),
          });
          
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

          console.log('📊 Processed legacy data:', { 
            balance, 
            hashrate, 
            isAmbassador,
            legacyCreatedAt: legacyCreatedAt?.toISOString(),
            migrated 
          });
          
          migratedData = {
            balance,
            hashrate,
            isAmbassador,
            createdAt: legacyCreatedAt,
          };
        } else {
          console.log('❌ No legacy data found in Firebase for telegramId:', finalTelegramId);
          console.log('🛑 User provided Telegram ID but no data found - should NOT create account');
          
          return NextResponse.json({
            success: false,
            migrated: false,
            userData: { id: '', balance: 0, hashrate: 0 },
            error: 'No data found for this Telegram ID. Please check your ID or choose "Start Fresh" instead.',
            needsMigration: true,
          }, { status: 404 });
        }
      } catch (firebaseError) {
        console.error('💥 Firebase query error:', firebaseError);
        console.error('Firebase error details:', {
          message: firebaseError instanceof Error ? firebaseError.message : 'Unknown error',
          code: (firebaseError as any)?.code || 'No code',
        });
        migrationError = 'Unable to check legacy data';
      }
    } else {
      console.log('🆕 Creating fresh account (no Telegram migration)');
    }

    console.log('💾 Creating user in database...');
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
      },
      select: {
        id: true,
        balance: true,
        hashrate: true,
        telegramId: true,
        isMigrated: true,
        isAmbassador: true,
        createdAt: true,
      },
    });

    console.log('✅ User created successfully:', {
      id: newUser.id,
      balance: newUser.balance,
      hashrate: newUser.hashrate,
      isMigrated: newUser.isMigrated,
      isAmbassador: newUser.isAmbassador,
      createdAt: newUser.createdAt,
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
      },
    };

    if (telegramId && !skipMigration && !migrated && migrationError) {
      response.error = `Migration attempted but ${migrationError}. Started fresh account instead.`;
    }

    console.log('🎉 Migration completed successfully:', response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('💥 Migration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

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
  console.log('📡 GET /api/migrate-on-signup started');
  
  try {
    console.log('🔍 Getting current user from Clerk...');
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log('❌ No Clerk user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Clerk user found:', { id: clerkUser.id });

    console.log('🔍 Checking if user exists in database...');
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
      } : null,
    };
    
    console.log('📊 Migration check result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 Migration check error:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}