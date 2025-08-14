"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs"; // For authentication

export default function PriceComponent() {
  const [price, setPrice] = useState("0.00");
  const [change, setChange] = useState("0.00");
  const { isSignedIn } = useUser(); // Clerk authentication state

  useEffect(() => {
    if (!isSignedIn) return; // Only fetch when authenticated

    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/price');
        const data = await response.json();
        setPrice(data.price);
        setChange(data.change);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    // Initial fetch
    fetchPrice();
    
    // Optional: Add polling for real-time updates (every 10s)
    const intervalId = setInterval(fetchPrice, 900000); // 15 minutes in milliseconds (15 * 60 * 1000 = 90000000);
    return () => clearInterval(intervalId);
  }, [isSignedIn]); // Re-run when auth state changes

  // Styling logic remains the same
  const isNegative = Number(change) < 0;
  const textColor = isNegative ? "text-red-400" : "text-green-400";
  const bgColor = isNegative ? "bg-red-500/20" : "bg-green-500/20";
  const sign = isNegative ? "-" : "+";

  return (
    <div className="flex items-center">
      <span className="text-xl font-semibold text-blue-200">${price}</span>
      <span className={`ml-2 px-2 py-1 text-sm ${bgColor} ${textColor} rounded-lg flex items-center`}>
        <span className="mr-1">{sign}</span>{Math.abs(Number(change))}%
      </span>
    </div>
  );
}