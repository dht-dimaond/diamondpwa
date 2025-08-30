'use client';

import Link from 'next/link';

export default function PWASignedInOnboarding() {

  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">$DHT</span>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-4">
        Welcome Back!
      </h1>
      
        <Link href="/dashboard">
        <button 
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
        >
          Go to Dashboard
        </button>
      </Link>
    </div>
  </div>
  );
}