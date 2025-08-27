'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/config/navLinks';
import { socialLinks } from '@/config/socialLinks';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link'

export default function NavBar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('🌤️ Good Morning ');
    else if (hour < 16) setGreeting('🌞 Good Afternoon ');
    else setGreeting('🌙 Good Evening ');
  }, []);

  // Fetch avatar from /user/api  
  useEffect(() => {
    if (user) {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => setAvatar(data.avatarUrl || user.imageUrl || null))
        .catch(() => setAvatar(user?.imageUrl || null));
    }
  }, [user]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const fallbackInitial = user?.username ? user.username.charAt(0).toUpperCase() : '';

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between">
        {/* Menu Toggle Button and Greeting */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="ml-4 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="transition-transform duration-200">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
          <h1 className="ml-4 text-sm font-bold text-gray-800 dark:text-gray-200">
            {greeting}, @{user?.username} 
          </h1>
        </div>

        {/* Avatar or Initial */}
        {user && (
          <div className="mr-4">
            {avatar ? (
              <Image
                src={avatar}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                {fallbackInitial}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-65 bg-white dark:bg-gray-800 shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-sm p-2 text-gray-600 dark:text-gray-200">Follow us</h1>
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                aria-label={link.name}
              >
                <link.icon size={24} />
              </Link>
            ))}
          </div>
        </div>
        <div className="p-2">
          <nav className="mt-2">
            <ul className="space-y-1">
              {navLinks.map((link, index) => (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className="flex items-center px-2 py-4 text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                    onClick={toggleSidebar}
                  >
                    <div className="flex-shrink-0 mr-8 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                      <link.icon size={18} />
                    </div>
                    <span className="text-sm">{link.name}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Diamond Heist Mobile v1.4.7</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}