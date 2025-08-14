'use client';

export default function MissionsPage() {

  return (
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-800/50">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              GRAND PRICE: $1000 DHT
            </h2>
            <p className="mt-2 text-amber-100/80">Invite 10 friends to claim prize and unlock the ambassador badge.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              </div>
            </div>
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-700/30 to-amber-600/10 border border-amber-600/50">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Ambassador Status Achieved!
              </h2>
              <p className="mt-2 text-amber-100/80">
                Congratulations! You have successfully referred 10+ friends and claimed your 1000 DHT reward.
              </p>
            </div>
          </div>

        <div className="gap-6 flex flex-col border-2 border-gray-700 rounded-xl p-4 shadow-xl bg-gradient-to-b from-gray-900/80 to-black/50">
          {/* Referral Missions*/}
          <div className=" p-6 border border-gray-700/50 bg-gradient-to-b from-gray-800 via-gray-800 to-gray-1000 rounded-lg backdrop-blur-md shadow-md w-full max-w-full">
            <div className="flex flex-col w-full max-w-full gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-amber-400">Invite Friends</h3>
                <span className="px-3 py-1 text-sm rounded-full bg-amber-900/30 text-amber-400">
                  +100 DHT
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-1 bg-gray-800 rounded-full">
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-wrap">
                </div>
              </div>
            </div>
          </div>
              <div className="bg-gradient-to-b from-gray-800 border-2 border-gray-700 via-gray-800 to-gray-1000 rounded-lg py-6 px-4 backdrop-blur-md shadow-md w-full max-w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg space-x-2 font-semibold text-white">
                      Add the💎 emoji to your Lastname
                      <span className=" text-sm rounded-full bg-purple-800/30 text-purple-400">
                        +200 DHT
                      </span>
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                    </div>
                    <div className="flex flex-col gap-3">
                  </div>
                </div>
              </div>
              </div>
        </div>
      </div>
    </div>
    )
};
