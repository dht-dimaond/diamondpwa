'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { usePWADetection } from '@/hooks/usePWADetection';
import WebOnlyPrompt from '@/components/WebOnlyPrompt';
import PWASignedOutOnboarding from '@/components/PWASignedOutOnboarding';
import PWASignedInOnboarding from '@/components/PWASignedInOnboarding';

export default function Home() {
  const isPWA = usePWADetection();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {!isPWA ? (
          // If not PWA, always show web-only prompt regardless of auth state
          <WebOnlyPrompt />
        ) : (
          // If PWA, show different onboarding based on auth state
          <>
            <SignedOut>
              <PWASignedOutOnboarding />
            </SignedOut>
            <SignedIn>
              <PWASignedInOnboarding />
            </SignedIn>
          </>
        )}
      </div>
    </div>
  );
}