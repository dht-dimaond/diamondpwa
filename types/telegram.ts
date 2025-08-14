export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  }
  
  export interface UserData {
    telegramId: number;
    username: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    hashrate: number;
    balance: number;
    createdAt: string;
    twitterComplete: boolean;
    twitterRewardClaimed: boolean;
    telegramComplete: boolean;
    telegramRewardClaimed: boolean;
    youtubeComplete: boolean;
    youtubeRewardClaimed: boolean;
    tiktokComplete: boolean;
    tiktokRewardClaimed: boolean;
    referralRewardClaimed: boolean;
    referrals?: string[];
    referrer?: string | null;
    isAmbassador: boolean;
    grandPrizeRewardClaimed: boolean;
    diamondlastnameComplete: boolean;
    diamondlastnameRewardClaimed: boolean;

    streak?: {
      currentStreak: number;
      highestStreak: number;
      lastLoginDate: string;
      startDate: string;
    };
    claimedMilestones?: number[];
    
  }
  



export interface MiningPackage {
  priceTON: number;
  hashRate: string;
  Validity: string;
}






export interface MiningTransaction {
  id?: string;                   
  userId: string;                
  packageId: number;              
  hashRate: number;              
  priceTON: number;            
  amount: number;              
  date: string;                   
  boc: string;                  
  validity: string;   
  item: string | number;          
}

