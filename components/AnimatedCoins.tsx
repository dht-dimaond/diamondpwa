import React from 'react';

interface AnimatedCoinsProps {
  isMining: boolean;
}

const AnimatedCoins: React.FC<AnimatedCoinsProps> = ({ isMining }) => {
  const backgroundCoins = Array(20).fill(null).map((_, i) => ({
    size: '200px',
    animationDelay: `${i * 0.2}s`,
  }));

  return (
    <div className="relative w-full aspect-square mb-6 flex justify-center items-center">
   
    
    <img
      src="/coin.png"
      alt="DHT Token"
      className={`relative z-10 ${isMining ? 'animate-spin-slow' : 'animate-float'}`}
      width={1800}
      height={1200}
    />
  </div>
  
  );
};


export default AnimatedCoins;