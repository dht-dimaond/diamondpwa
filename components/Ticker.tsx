'use client'

import React from "react";

const Ticker = () => {
  const newsItems = [
    "LIMITED OFFER : Refer 10 Users now to Earn the Ambassador Badge and $1000DHT GRAND PRICE !!! 🕓",
    "Join Our Telegram Commmunity for News and Updates",
    "Follow us On X(Twitter) to be part of our ever-expanding community."
  ];

  return (
    <div className="relative overflow-hidden backdrop-blur-lg mt-2 px-2 py-1 bg-white/20 text-white">
      <div className="flex animate-scroll gap-8">
        {/* Repeat the news items twice for seamless looping */}
        {[...newsItems, ...newsItems].map((item, index) => (
          <span
            key={index}
            className="inline-block text-sm font-medium whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
