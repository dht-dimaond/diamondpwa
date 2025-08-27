'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import ProfileCard from '@/components/ProfileCard';

interface DatabaseUser {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  userName?: string;
  avatar?: string;
  email: string;
  isAmbassador?: boolean;
  isPremium?: boolean;
  balance: number;
  hashrate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfilePage = () => {
  const { user, isLoaded } = useUser(); // Only for auth verification
  const [userData, setUserData] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) {
          console.error('User ID is missing');
          setIsLoading(false);
          return;
        }

        // Fetch additional user data from your Neon database via API
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userDbData = await response.json();
        
        if (userDbData) {
          setUserData(userDbData); 
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchUserData();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  // Show loading while Clerk or database data is loading
  if (!isLoaded || isLoading) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div>Loading...</div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div>Please sign in to view your profile.</div>
      </div>
    );
  }

  // User data not loaded yet
  if (!userData) {
    return (
      <div className='flex items-center justify-center'>
        <div>Loading user data...</div>
      </div>
    );
  }

  return (
    <div>
      <ProfileCard userData={userData} />
    </div>
  );
};

export default ProfilePage;