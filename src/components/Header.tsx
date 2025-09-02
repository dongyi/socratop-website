'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import AppleSignInButton from './AppleSignInButton';
import LanguageToggle from './LanguageToggle';
import { User, BarChart3, Home } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, signOut } = useAuth();
  const { t } = useLanguage();
  const { displayName } = useUserProfile();
  const pathname = usePathname();

  const navigationItems = [
    { name: t('nav_home'), href: '/', icon: Home },
    { name: t('nav_data_analysis'), href: '/workout-analyzer', icon: BarChart3 },
  ];

  const authenticatedItems = [
    { name: t('nav_personal_center'), href: '/profile', icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 min-w-0 flex-1">
            <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-gray-300 transition-colors shrink-0">
              Socratop
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-4 min-w-0">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Authenticated Navigation */}
              {isAuthenticated && authenticatedItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Auth and Language Toggle */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 min-w-0">
                <Link 
                  href="/profile"
                  className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors shrink-0"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden 2xl:inline text-xs">
                    {displayName}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav_sign_out')}
                </button>
              </div>
            ) : (
              <AppleSignInButton className="text-sm shrink-0" />
            )}
            
            <LanguageToggle className="shrink-0" />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-800">
          <nav className="flex items-center justify-center py-2 gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {isAuthenticated && authenticatedItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}