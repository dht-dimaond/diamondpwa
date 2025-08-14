"use client";

interface TokenDistribution {
  name: string;
  percentage: number;
  color: string;
}

export default function Tokenomics() {
  return (
    <div className="bg-gradient-to-b from-gray-800 via-gray-800 to-gray-1000 rounded-lg p-6 backdrop-blur-md shadow-md w-full max-w-full text-white">
      <h3 className="mt-4 text-xl text-center font-semibold">Token Distribution</h3> 
    </div>
  );
};
