'use client';

import { useState, useEffect } from 'react';

export function usePWADetection() {
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isIOSStandalone);
    };
    
    checkPWA();
    window.addEventListener('resize', checkPWA);
    return () => window.removeEventListener('resize', checkPWA);
  }, []);
  
  return isPWA;
}