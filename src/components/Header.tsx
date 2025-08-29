'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AppleSignInButton from './AppleSignInButton';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
              Cadence
            </Link>
          </div>

          {/* Right side - Language Toggle and Auth */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <AppleSignInButton className="text-sm" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}