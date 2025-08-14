'use client'

import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'

export default function SwapButton() {
  return (
   
      <div className=" text-blue-200 rounded-xl">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">DHT</span>
            <ArrowLeftRight size={14} className="text-blue-400" />
            <span className="text-sm font-medium">TON</span>
          </div>
          <Link href="/wallet" className="block">
           <button className="border border-blue-600 bg-blue-900/20 text-blue-200 rounded-xl shadow-md hover:bg-blue-800/50 transition duration-200 ease-in-out px-6">Swap</button>
          </Link>
          <span className="text-[10px] text-gray-400 font-medium">(Coming soon)</span>
        </div>
      </div>
    
  )
}