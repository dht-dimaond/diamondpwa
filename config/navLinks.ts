import { Home, WalletIcon, Mail, Pickaxe, Users, CircleQuestionMarkIcon, User } from 'lucide-react';

export const navLinks = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Wallet', href: '/dashboard/wallet', icon: WalletIcon  },
  { name: 'Mine', href: '/dashboard/mine-page', icon: Pickaxe },
  { name: 'Referral System', href: '/dashboard/referral-system', icon: Users },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
  { name: 'Support', href: '/dashboard/support', icon: Mail },
  { name: 'Faq', href: '/dashboard/faq', icon: CircleQuestionMarkIcon },
];