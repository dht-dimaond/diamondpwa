'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface MigrationResponse {
  success: boolean;
  migrated: boolean;
  userData: {
    balance: number;
    hashrate: number;
    telegramId?: number;
  };
  error?: string;
}

export default function SignupMigrationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResponse | null>(null);

  const handleMigration = async (skipMigration = false) => {
    console.log('🚀 Starting migration:', { skipMigration, telegramId })
    
    if (!isSignedIn) {
      console.log('❌ Not signed in, redirecting...')
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('📡 Posting migration data...')
      const res = await fetch('/api/migrate-on-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: skipMigration ? undefined : telegramId || undefined,
          skipMigration,
        }),
      });

      console.log('📡 Migration POST Response:', { 
        status: res.status, 
        ok: res.ok 
      })

      if (!res.ok) {
        const errorData = await res.json();
        console.error('💥 Migration POST failed:', errorData)
        throw new Error(errorData.error || 'Migration failed');
      }

      const data: MigrationResponse = await res.json();
      console.log('✅ Migration successful:', data)
      setResult(data);

      if (data.success) {
        console.log('🎉 Migration success, redirecting in 2.5s...')
        setTimeout(() => {
          router.push('/dashboard');
        }, 2500);
      }
    } catch (error: any) {
      console.error('💥 Migration error:', error)
      setResult({
        success: false,
        migrated: false,
        userData: { balance: 0, hashrate: 0 },
        error: error.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateTelegramId = (id: string): boolean => {
    return /^\d+$/.test(id) && parseInt(id) > 0 && parseInt(id) <= 10000000000;
  };

  // Simple loading check
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}! 👋</h2>
          <p className="mt-4 text-gray-600">
            Let's set up your account. Do you have an existing account from our Telegram Mini App?
          </p>
        </div>

        {!result && (
          <div className="space-y-6">
            <div>
              <label htmlFor="telegram-id" className="block text-sm font-medium text-gray-700 mb-2">
                Telegram User ID (Optional)
              </label>
              <input
                id="telegram-id"
                type="text"
                placeholder="e.g., 123456789"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  telegramId && !validateTelegramId(telegramId) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={loading}
                maxLength={10}
              />
              {telegramId && !validateTelegramId(telegramId) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid Telegram user ID
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Find your Telegram ID by messaging @userinfobot on Telegram
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleMigration(false)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {telegramId ? 'Importing Data...' : 'Setting Up Account...'}
                  </>
                ) : telegramId ? (
                  '🔄 Import My Data'
                ) : (
                  '🚀 Set Up My Account'
                )}
              </button>

              {telegramId && (
                <button
                  onClick={() => handleMigration(true)}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                >
                  ✨ Start Fresh Instead
                </button>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 Don't have a Telegram ID? No problem - click "Set Up My Account" to start fresh!
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <div className="text-center">
                {result.migrated ? (
                  <>
                    <div className="text-green-600 text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">
                      Data Imported Successfully!
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Balance:</span>
                          <p className="font-bold text-green-700">{result.userData.balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Hashrate:</span>
                          <p className="font-bold text-green-700">{result.userData.hashrate.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-green-700">
                      Your Telegram account data has been successfully transferred! 
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-blue-600 text-5xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-3">
                      Account Created Successfully!
                    </h3>
                    <p className="text-sm text-blue-700">
                      Your new account is ready. Let's start your journey!
                    </p>
                  </>
                )}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0  12h4z"></path>
                  </svg>
                  Redirecting to dashboard...
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-red-600 text-5xl mb-4">❌</div>
                <h3 className="text-xl font-bold text-red-800 mb-3">
                  Something Went Wrong
                </h3>
                <p className="text-sm text-red-700 mb-4">{result.error}</p>
                <button
                  onClick={() => setResult(null)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}