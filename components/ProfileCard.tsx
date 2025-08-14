// src/components/ProfileCard.tsx
import React from 'react';
import { 
  MessageCircle, 
  Heart, 
  Info, 
  HelpCircle, 
  User as UserIcon,
  Globe,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

interface ProfileCardProps {
  userData: DatabaseUser; // All data from database
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData }) => {
  return (
    <div className="min-h-screen p-2">
      <div className="flex flex-col gap-4 rounded-2xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.01]">
            {/* Profile Image / User Info */}
            <div className=" w-full flex flex-row justify-start gap-2 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <div className="relative group">
                <div className="w-18 h-18 rounded-full border-4 border-white/30 backdrop-blur-xl bg-white/10 overflow-hidden shadow-xl transition-transform group-hover:scale-105">
                  {userData.avatar ? (
                    <Image
                      src={userData.avatar}
                      alt={`${userData.firstName}'s profile`}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-xl font-semibold">
                      {userData.firstName?.charAt(0).toUpperCase() || userData.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {/*User Info */}
              <div className="flex flex-col">
                <p className="text-lg font-bold text-blue-200">
                  {userData.firstName} {userData.lastName}
                </p>
                {userData.userName && (
                  <p className="text-white text-md">@{userData.userName}</p>
                )}
              </div>

               {/* Premium Badge - Using database data */}
               {userData.isPremium ? (
                      <div className='text-green-400'> <Star className='w-10 h-10'/></div>
                ) : (
                  <div className='text-yellow-400 text-opacity-10'> <Star className='w-10 h-10'/></div>
               )}

            </div>

             {/* User ID */}
            <div className="flex items-center justify-between text-blue-200 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
             <div className="flex items-center justify-between gap-2">
               <UserIcon className="w-5 h-5" /> 
               <span className='text-white'> My ID</span> 
             </div>
              <p className="text-blue-100 text-sm">{userData.id}</p>
            </div>

              {/* Email - Replacing language with email since that's more relevant for Clerk */}
              <div className="flex items-center justify-between text-blue-200 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-2"> 
                    <Globe className="w-5 h-5" /> 
                    <span className='text-white'> Email</span>
                  </div>
                <span className="text-blue-100 font-medium">
                  {userData.email || 'Not provided'}
                </span>
              </div>

              {/* Invite */}
              <Link href="/invite">
                <div className="flex items-center justify-between text-blue-200 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/30 animate-pulse">
                    <div className="flex items-center justify-between gap-2"> 
                      <Heart className="w-5 h-5" />
                      <span className='text-white'> Invite Friends</span>
                    </div>
                </div>
              </Link>

              {/* Contact Support */}
              <div className="flex items-center justify-between text-blue-200 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-2"> 
                    <MessageCircle className="w-5 h-5" />
                    <span className='text-white'> Contact Support</span>
                  </div>
              </div>

              {/* FAQ */}
              <Link href="/faq">
                <div className="flex items-center justify-between text-blue-200 animate-pulse backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between gap-2"> 
                      <HelpCircle className="w-5 h-5" />
                      <span className='text-white'>FAQ</span>
                    </div>
                </div>
              </Link>

              {/* Legal Information */}
              <Link href="/legal">
                <div className="flex items-center justify-between text-blue-200 backdrop-blur-md bg-white/5 animate-pulse rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-2"> 
                    <Info className="w-5 h-5" />
                    <span className='text-white'>Legal Notes</span>
                  </div>
               </div>
             </Link>
          </div>
      </div>
  );
};

export default ProfileCard;