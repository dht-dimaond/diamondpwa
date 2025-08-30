'use client';

import { useState } from 'react';

export default function PWASignedInOnboarding() {
  const [step, setStep] = useState(1);
  const [miningStarted, setMiningStarted] = useState(false);
  
  const handleStartMining = () => {
    setMiningStarted(true);
    // Here you would typically start the actual mining process
    setTimeout(() => {
      setStep(3); // Move to success step after "mining" starts
    }, 2000);
  };
  
  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };
  
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">$DHT</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome Back!
          </h1>
          
          <p className="text-white/80 mb-8">
            Ready to continue mining $DHT? Let&apos;s get your mining operation running.
          </p>
          
          <div className="bg-blue-900/30 border border-blue-400/30 rounded-xl p-6 mb-8">
            <div className="text-2xl font-bold text-white mb-2">0.00 $DHT</div>
            <div className="text-white/60 text-sm">Current Balance</div>
          </div>
          
          <button 
            onClick={handleNextStep}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
          >
            Continue Setup
          </button>
        </div>
      </div>
    );
  }
  
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Start Mining $DHT
          </h2>
          
          <p className="text-white/80 mb-8">
            Your device will use minimal resources to mine $DHT tokens. 
            Mining runs safely in the background.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-white/80">
              <span>Mining Rate:</span>
              <span className="text-blue-300 font-semibold">1.2 $DHT/hour</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Battery Usage:</span>
              <span className="text-blue-300 font-semibold">Minimal</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Payout:</span>
              <span className="text-blue-300 font-semibold">Daily</span>
            </div>
          </div>
          
          <button 
            onClick={handleStartMining}
            disabled={miningStarted}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg"
          >
            {miningStarted ? 'Starting Mining...' : 'Start Mining Now'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">🎉</span>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Mining Started!
        </h2>
        
        <p className="text-white/80 mb-6">
          Congratulations! Your $DHT mining is now active.
        </p>
        
        <div className="bg-blue-800/30 border border-blue-400/30 rounded-xl p-6 mb-8">
          <div className="text-2xl font-bold text-blue-300 mb-2">⚡ ACTIVE</div>
          <div className="text-white/80 text-sm">Mining Status</div>
          <div className="mt-4 text-white/60 text-sm">
            Estimated earnings: <span className="text-blue-300 font-semibold">28.8 $DHT/day</span>
          </div>
        </div>
        
        <div className="space-y-3 text-left text-sm text-white/70 mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-blue-300">•</span>
            <span>Keep the app installed for continuous mining</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300">•</span>
            <span>Check back daily to claim your $DHT</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300">•</span>
            <span>Invite friends for bonus rewards</span>
          </div>
        </div>
        
        <button 
          onClick={() => {/* Navigate to main dashboard */}}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}