'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { navLinks } from '@/config/navLinks';
import { usePathname, useRouter } from 'next/navigation';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-30 flex items-center justify-center z-[70]">
    <div className="p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export default function NavGrid() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setLoading(true);
      router.push(href);
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <>
      {loading && <LoadingOverlay />}
      <div className="flex flex-1 justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm p-6 w-full">
          <div className="grid grid-cols-4 gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div key={link.href} className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => handleNavigation(link.href)}
                    className={`
                      relative w-14 h-14 rounded-2xl border-2 flex items-center justify-center
                      transition-all duration-300 ease-out transform hover:scale-105 active:scale-95
                      ${isActive 
                        ? 'bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/25' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <link.icon 
                      size={24} 
                      className={`transition-colors duration-200 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400'
                      }`} 
                    />
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-900 rounded-full border-2 border-white dark:border-gray-900"></div>
                    )}
                  </button>
                  <span className={`
                    text-xs font-medium text-center leading-tight transition-colors duration-200
                    ${isActive 
                      ? 'text-blue-900 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {link.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}