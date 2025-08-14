// /app/api/migrate-on-signup/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import  prisma  from '@/lib/prisma';
import { adminDb } from '@/lib/firebase-admin';

interface MigrationRequest {
  telegramId?: string;
  skipMigration?: boolean;
}

interface MigrationResponse {
  success: boolean;
  migrated: boolean;
  userData: {
    balance: number;
    hashrate: number;
    telegramId?: number;
    isAmbassador?: boolean;
  };
  error?: string;
  needsMigration?: boolean;
}

// Validate Telegram ID (realistic range: 1 to ~10 billion)
function validateTelegramId(id: string): { valid: boolean; parsed?: number; error?: string } {
  if (!/^\d+$/.test(id)) {
    return { valid: false, error: 'Telegram ID must contain only numbers' };
  }
  
  const parsed = parseInt(id);
  if (parsed <= 0 || parsed > 10000000000) {
    return { valid: false, error: 'Invalid Telegram ID range' };
  }
  
  return { valid: true, parsed };
}

export async function POST(req: Request) {
  console.log('📡 POST /api/migrate-on-signup started')
  
  try {
    // Get current user directly
    console.log('🔍 Getting current user from Clerk...')
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log('❌ No Clerk user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Clerk user found:', { 
      id: clerkUser.id, 
      firstName: clerkUser.firstName,
      email: clerkUser.emailAddresses[0]?.emailAddress 
    })

    // Check if user already exists (migration already done)
    console.log('🔍 Checking if user exists in database...')
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    });

    if (existingUser) {
      console.log('✅ User already exists in database:', {
        id: existingUser.id,
        balance: existingUser.balance,
        isMigrated: existingUser.isMigrated
      })
      return NextResponse.json({
        success: true,
        migrated: existingUser.isMigrated,
        userData: {
          balance: existingUser.balance || 0,
          hashrate: existingUser.hashrate || 0,
          telegramId: existingUser.telegramId || undefined,
          isAmbassador: existingUser.isAmbassador || false
        },
        error: 'User already exists'
      });
    }

    console.log('📝 User does not exist, proceeding with migration...')
    
    const body: MigrationRequest = await req.json();
    const { telegramId, skipMigration } = body;
    
    console.log('📊 Migration request:', { telegramId, skipMigration })

    let balance = 0;
    let hashrate = 10;
    let migrated = false;
    let finalTelegramId: number | null = null;
    let migrationError: string | null = null;

    // If user provided Telegram ID, try to migrate
    if (telegramId && !skipMigration) {
      console.log('🔄 Attempting Telegram migration...')
      const validation = validateTelegramId(telegramId);
      
      if (!validation.valid) {
        console.log('❌ Invalid Telegram ID:', validation.error)
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      finalTelegramId = validation.parsed!;
      console.log('✅ Valid Telegram ID:', finalTelegramId)

      // Check if this Telegram ID is already linked to another user
      console.log('🔍 Checking if Telegram ID already exists...')
      const existingTelegramUser = await prisma.user.findUnique({
        where: { telegramId: finalTelegramId }
      });

      if (existingTelegramUser) {
        console.log('❌ Telegram ID already linked to another user')
        return NextResponse.json(
          { error: 'This Telegram ID is already linked to another account' },
          { status: 409 }
        );
      }

      // Try to find legacy data in Firebase
      try {
        console.log('🔍 Querying Firebase for legacy data...')
        const snapshot = await adminDb
          .collection('users')
          .where('telegram_id', '==', finalTelegramId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const legacyData = snapshot.docs[0].data();
          console.log('✅ Found legacy data:', legacyData)
          balance = typeof legacyData.balance === 'number' ? Math.max(0, legacyData.balance) : 0;
          hashrate = typeof legacyData.hashrate === 'number' ? Math.max(10, legacyData.hashrate) : 10;
          migrated = true;

          console.log('📊 Processed legacy data:', { balance, hashrate, migrated })
        } else {
          console.log('❌ No legacy data found in Firebase')
          migrationError = 'No data found for this Telegram ID';
        }
      } catch (firebaseError) {
        console.error('💥 Firebase query error:', firebaseError);
        migrationError = 'Unable to check legacy data';
      }
    } else {
      console.log('🆕 Creating fresh account (no Telegram migration)')
    }

    // Create user in Neon DB
    console.log('💾 Creating user in database...')
  const newUser = await prisma.user.create({
  data: {
    clerkId: clerkUser.id,
    firstName: clerkUser.firstName || 'User',  // Provide fallback
    lastName: clerkUser.lastName || '',        // Provide fallback  
    userName: clerkUser.username || `user_${Date.now()}`, // Unique fallback
    avatar: clerkUser.imageUrl || '',          // Provide fallback
    email: clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@temp.com`, // Provide fallback
    telegramId: finalTelegramId,
    isAmbassador: false, 
    balance,
    hashrate,
    isMigrated: migrated,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

    console.log('✅ User created successfully:', {
      id: newUser.id,
      balance: newUser.balance,
      hashrate: newUser.hashrate,
      isMigrated: newUser.isMigrated
    })

    const response: MigrationResponse = {
      success: true,
      migrated,
      userData: {
        balance: newUser.balance,
        hashrate: newUser.hashrate,
        telegramId: newUser.telegramId || undefined,
      },
    };

    // Add warning if migration was attempted but failed
    if (telegramId && !skipMigration && !migrated && migrationError) {
      response.error = `Migration attempted but ${migrationError}. Started fresh account instead.`;
    }

    console.log('🎉 Migration completed successfully:', response)
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 Migration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    // Handle Prisma unique constraint errors
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
        userData: { balance: 0, hashrate: 0 },
        error: 'Migration failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user needs migration
export async function GET(req: Request) {
  console.log('📡 GET /api/migrate-on-signup started')
  
  try {
    console.log('🔍 Getting current user from Clerk...')
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log('❌ No Clerk user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Clerk user found:', { id: clerkUser.id })

    console.log('🔍 Checking if user exists in database...')
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true, 
        balance: true, 
        hashrate: true, 
        telegramId: true,
        isMigrated: true 
      }
    });

    const result = {
      needsMigration: !existingUser,
      user: existingUser
    }
    
    console.log('📊 Migration check result:', result)

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Migration check error:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}