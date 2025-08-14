import React from "react";

interface TokenDetailsProps {
  name: string;
  symbol: string;
  totalSupply: string;
  price: string;
  softCap: string;
  hardCap: string;
}

const TokenDetails: React.FC<TokenDetailsProps> = ({
  name,
  symbol,
  totalSupply,
  price,
  softCap,
  hardCap,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-800 via-gray-800 to-gray-1000 rounded-lg p-6 backdrop-blur-md shadow-md w-full max-w-full text-white">
      <h2 className="text-xl font-bold">Token Details</h2>
      <div className="mt-4">
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Token Name</span>
          <span>{name}</span>
        </div>
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Token Symbol</span>
          <span>{symbol}</span>
        </div>
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Total Supply</span>
          <span>{totalSupply}</span>
        </div>
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Current Price</span>
          <span>${price}</span>
        </div>
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Soft Cap</span>
          <span>${softCap}</span>
        </div>
        <div className="flex justify-between mt-2 p-4 border-2 border-b-gray-700 border-t-0 border-r-0 border-l-0 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg">
          <span className="text-gray-400">Hard Cap</span>
          <span>${hardCap}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
