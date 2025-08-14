'use client';

import WithdrawButton from '../components/WithdrawButton';

interface BalanceCardProps {
  balance: number;
  imageSrc: string;
}

export default function DHTBalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="w-full flex items-center justify-between py-2 px-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
      {/* Center: DHT Balance */}
      <div className="flex flex-row gap-0 items-center justify-start">
        {/* Image with required width and height */}
     
        <div className="flex flex-col justify-start">
          <span className="text-xs font-semibold text-gray-400">DHT Balance</span>
          <span className="text-lg text-gray-200">{balance >= 1000 ? (balance / 1000).toFixed(1).replace(".0", "") + "k" : Math.floor(balance)}<span className="text-sm font-semibold text-blue-200"> $DHT</span> </span>
        </div>
      </div>
      {/* Right: Withdraw Button */}
      <WithdrawButton />
    </div>
  );
}