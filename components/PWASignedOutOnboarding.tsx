import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function PWASignedOutOnboarding() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">$DHT</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to DHT Mining
        </h1>
        
        <p className="text-white/80 mb-8 text-lg">
          Start earning $DHT cryptocurrency with our mobile mining platform
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-white/80">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <span>Mine $DHT tokens daily</span>
          </div>
          
          <div className="flex items-center space-x-3 text-white/80">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <span>Secure mobile wallet</span>
          </div>
          
          <div className="flex items-center space-x-3 text-white/80">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <span>Referral rewards program</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <SignUpButton mode="modal">
            <button className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg">
              Start Mining - Sign Up
            </button>
          </SignUpButton>
          
          <SignInButton mode="modal">
            <button className="w-full border-2 border-white/30 text-white py-4 rounded-xl font-semibold hover:bg-white/10 transition-all">
              Already have an account? Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}