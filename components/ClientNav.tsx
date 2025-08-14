'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, GroupIcon, BriefcaseIcon, WalletIcon, UserIcon } from 'lucide-react';

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full z-50">
      <div className="relative w-full flex justify-center" style={{ marginBottom: "-20px" }}>
        <div className="absolute bottom-0 w-16 h-8 bg-white/5 backdrop-blur-sm" 
             style={{ 
               borderTopLeftRadius: '999px',
               borderTopRightRadius: '999px'
             }} 
        />
        <div 
          className="relative z-20 border border-gray-400 text-white rounded-full p-3 bg-white/5 backdrop-blur-sm cursor-pointer"
        >
          <Link
            href="/profile"
            className={`flex-1 flex flex-col justify-center items-center h-full transition-colors ${
              pathname === '/profile' ? 'text-blue-700' : 'hover:text-blue-700'
            }`}
          >
             <UserIcon className="w-6 h-6" />
          </Link>
     
         
        </div>
      </div>

      <nav className="w-full rounded-t-lg backdrop-blur-sm bg-white/5 shadow-lg border-t border-white z-10">
        <div className="max-w-lg mx-auto flex justify-around text-white items-center h-16">
          <Link
            href="/"
            className={`flex-1 flex flex-col justify-center items-center h-full transition-colors ${
              pathname === '/' ? 'text-blue-700' : 'hover:text-blue-700'
            }`}
          >
            <HomeIcon className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
     
          <Link
            href="/invite"
            className={`flex-1 flex flex-col justify-center items-center h-full transition-colors ${
              pathname === '/invite' ? 'text-blue-700' : 'hover:text-blue-700'
            }`}
          >
            <GroupIcon className="w-5 h-5 mb-1" />
            <span className="text-xs">Invite</span>
          </Link>

          <Link
            href="/mission"
            className={`flex-1 flex flex-col justify-center items-center h-full transition-colors ${
              pathname === '/mission' ? 'text-blue-700' : 'hover:text-blue-700'
            }`}
          >
            <BriefcaseIcon className="w-5 h-5 mb-1" />
            <span className="text-xs">Mission</span>
          </Link>

          <Link
            href="/wallet"
            className={`flex-1 flex flex-col justify-center items-center h-full transition-colors ${
              pathname === '/wallet' ? 'text-blue-700' : 'hover:text-blue-700'
            }`}
          >
            <WalletIcon className="w-5 h-5 mb-1" />
            <span className="text-xs">Wallet</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}