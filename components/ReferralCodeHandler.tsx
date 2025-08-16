'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function ReferralCodeHandler() {
  const { user, isLoaded } = useUser();
  const [referralProcessed, setReferralProcessed] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user || referralProcessed) return;

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      setReferralCode(refCode);
      console.log(`🎯 Found referral code: ${refCode}`);
      
      // Call referral API directly with the code
      processReferral(user.id, refCode);
    } else {
      // Still need to create referral code for user
      processReferral(user.id, null);
    }
  }, [user, isLoaded, referralProcessed]);

  const processReferral = async (userId: string, refCode: string | null) => {
    try {
      console.log(`📡 Calling referral API for user ${userId} with code: ${refCode || 'none'}`);
      
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(refCode && { 'x-referral-code': refCode }), // Send as header too
        },
        body: JSON.stringify({
          userId,
          referralCode: refCode, // Send in body
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Referral processed successfully:', result);
        setReferralProcessed(true);
      } else {
        console.error('❌ Referral processing failed:', result);
      }
      
    } catch (error) {
      console.error('💥 Error calling referral API:', error);
    }
  };

  if (referralCode && !referralProcessed) {
    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-blue-800">
          <strong>Processing referral code:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{referralCode}</code>
        </div>
      </div>
    );
  }

  if (referralCode && referralProcessed) {
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-green-800">
          ✅ <strong>Referral processed successfully!</strong>
        </div>
      </div>
    );
  }

  return null;
}