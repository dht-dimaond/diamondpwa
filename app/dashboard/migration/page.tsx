'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface MigrationResponse {
  success: boolean;
  migrated: boolean;
  userData: {
    id: string; // Added for referral API call
    balance: number;
    hashrate: number;
    telegramId?: string;
    isAmbassador?: boolean;
    createdAt?: string;
  };
  error?: string;
}

export default function SignupMigrationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResponse | null>(null);
  const [showNoDataFound, setShowNoDataFound] = useState(false);

  const handleMigration = async (skipMigration = false) => {
    console.log('🚀 Starting migration:', { skipMigration, telegramId });

    if (!isSignedIn) {
      console.log('❌ Not signed in, redirecting...');
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    setResult(null);
    setShowNoDataFound(false);

    try {
      console.log('📡 Posting migration data...');
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
        ok: res.ok,
      });

      const data: MigrationResponse = await res.json();

      if (!res.ok) {
        console.log('💥 Migration POST failed:', data);
        setResult({
          success: false,
          migrated: false,
          userData: { id: '', balance: 0, hashrate: 0 },
          error: data.error || 'Migration failed',
        });
        setLoading(false);
        return;
      }

      console.log('✅ Migration successful:', data);
      setResult(data);

      // Process referral after successful migration
      try {
        console.log('📡 Processing referral...');
        const referralRes = await fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.userData.id }),
        });

        if (!referralRes.ok) {
          const referralError = await referralRes.json();
          console.log('⚠️ Referral processing failed:', referralError);
          // Optionally show a toast notification here
        } else {
          console.log('✅ Referral processed successfully');
        }
      } catch (referralError) {
        console.error('💥 Error processing referral:', referralError);
      }

      // Check if user tried to migrate but no data was found
      if (
        data.success &&
        !data.migrated &&
        telegramId &&
        !skipMigration &&
        data.error &&
        data.error.includes('No data found for this Telegram ID')
      ) {
        setShowNoDataFound(true);
      }

      // Only auto-redirect for fresh accounts (no telegram migration attempted)
      if (data.success && !telegramId) {
        console.log('🎉 Fresh account created, redirecting in 2.5s...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2500);
      }
      //eslint-disable-next-line
    } catch (error: any) {
      console.error('💥 Migration error:', error);
      setResult({
        success: false,
        migrated: false,
        userData: { id: '', balance: 0, hashrate: 0 },
        error: error.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateTelegramId = (id: string): boolean => {
    return /^\d+$/.test(id) && parseInt(id) > 0 && parseInt(id) <= 10000000000;
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}! 👋</h2>
          <p className="mt-4 text-gray-600">
            Let&apos;s set up your account. Do you have an existing account from our Telegram Mini App?
          </p>
        </div>

        {(!result || showNoDataFound) && (
          <div className="space-y-6">
            {showNoDataFound && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">No Data Found</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      We couldn&apos;t find any data for Telegram ID: <strong>{telegramId}</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      📝 <strong>Suggestions:</strong>
                    </p>
                    <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                      <li>Double-check your Telegram ID</li>
                      <li>Or choose &apos;Start Fresh&apos; to create a new account</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

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
                  telegramId && !validateTelegramId(telegramId) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
                maxLength={10}
              />
              {telegramId && !validateTelegramId(telegramId) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid Telegram user ID</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Find your Telegram ID by messaging @userinfobot on Telegram
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => await handleMigration(false)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {telegramId ? 'Importing Data...' : 'Setting Up Account...'}
                  </>
                ) : telegramId ? (
                  showNoDataFound ? '🔄 Try Again' : '🔄 Import My Data'
                ) : (
                  '🚀 Set Up My Account'
                )}
              </button>

              <button
                onClick={async () => await handleMigration(true)}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
              >
                ✨ Start Fresh Instead
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 Don&apos;t have a Telegram ID? No problem - click &apos;Start Fresh Instead&apos; to begin!
              </p>
            </div>
          </div>
        )}

        {result && !showNoDataFound && (
          <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <div className="text-center">
                {result.migrated ? (
                  <>
                    <div className="text-green-600 text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">Data Imported Successfully!</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-3">
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
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-600 text-sm">Status:</span>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.userData.isAmbassador
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {result.userData.isAmbassador ? '👑 Ambassador' : '👤 User'}
                          </div>
                        </div>
                      </div>
                      {result.userData.createdAt && (
                        <div className="pt-2 border-t border-gray-100 text-center">
                          <span className="text-gray-600 text-xs">Original Account Created:</span>
                          <p className="text-gray-800 text-sm font-medium">{formatDate(result.userData.createdAt)}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Your Telegram account data has been successfully transferred!
                      {result.userData.isAmbassador && ' Your Ambassador status has been preserved.'}
                    </p>
                    <button
                      onClick={goToDashboard}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      🚀 Go to Dashboard
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-blue-600 text-5xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-3">Account Created Successfully!</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Starting Balance:</span>
                          <p className="font-bold text-blue-700">0</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Starting Hashrate:</span>
                          <p className="font-bold text-blue-700">10</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100 mt-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-600 text-sm">Status:</span>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            👤 User
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100 mt-2 text-center">
                        <span className="text-gray-600 text-xs">Account Created:</span>
                        <p className="text-gray-800 text-sm font-medium">{formatDate(new Date().toISOString())}</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">Your new account is ready. Let&apos;s start your journey!</p>
                    {!telegramId && (
                      <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Redirecting to dashboard...
                      </div>
                    )}
                    {telegramId && (
                      <button
                        onClick={goToDashboard}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        🚀 Go to Dashboard
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-red-600 text-5xl mb-4">❌</div>
                <h3 className="text-xl font-bold text-red-800 mb-3">Something Went Wrong</h3>
                <p className="text-sm text-red-700 mb-4">{result.error}</p>
                <button
                  onClick={() => {
                    setResult(null);
                    setShowNoDataFound(false);
                  }}
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