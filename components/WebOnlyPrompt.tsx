import InstallButton from '@/components/InstallButton';

export default function WebOnlyPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">$DHT</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Diamond Heist
        </h1>
        
        <p className="text-white/80 mb-8 leading-relaxed">
          Start mining $DHT cryptocurrency directly from your mobile device. 
          This app requires installation for security and optimal performance.
        </p>
        
        {/* Install Button Component */}
        <div className="mb-6">
          <InstallButton />
        </div>
        
        {/* Fallback install instructions if InstallButton doesn't show */}
        <div className="bg-blue-900/30 border border-blue-400/30 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Install Instructions</h3>
          <div className="text-sm text-white/80 text-left space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-300 mt-1">•</span>
              <span><strong>iPhone/iPad:</strong> Tap Share → &apos;Add to Home Screen&apos;</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-300 mt-1">•</span>
              <span><strong>Android:</strong> Tap menu → &apos;Install app&apos;</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-300 mt-1">•</span>
              <span><strong>Desktop:</strong> Look for install icon in address bar</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-400/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Why Install?</h3>
          <div className="text-sm text-white/80 text-left space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">•</span>
              <span>Secure offline mining capabilities</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">•</span>
              <span>Push notifications for earnings</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">•</span>
              <span>Enhanced performance & battery optimization</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full mt-6 bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
        >
          Refresh After Installing
        </button>
      </div>
    </div>
  );
}