'use client';

import { CircleQuestionMark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


export default function Bar() {
  return (
    <div className="w-full flex items-center justify-between px-6 py-2 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-900/20 to-black/50">
     
      
      <div className="flex flex-row items-center">
        <Image
          src="/logo-coin.png"
          alt="DHT"
          width={40} 
          height={10} 
          className="w-13 h-10" 
        />
         <div className="relative flex-col justify-start">
         <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-yellow-500 bg-clip-text text-transparent animate-pulse">
           DIAMONDHEIST
          </span>
          <span className="absolute inset-0 text-2xl font-extrabold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent blur-md animate-pulse">
            DIAMONDHEIST
          </span>
        </div>
        </div>
    
      <div className='border border-blue-600 text-blue-400 px-4 py-1 text-sm rounded-xl shadow-md hover:bg-blue-800 transition duration-200 ease-in-out'>
        <Link href='/faq'>
          <CircleQuestionMark className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}