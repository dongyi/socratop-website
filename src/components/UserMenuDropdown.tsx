'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppleSignInButton from './AppleSignInButton';
import EmailSignInButton from './EmailSignInButton';

interface UserMenuDropdownProps {
  className?: string;
}

export default function UserMenuDropdown({ className }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="text-sm text-gray-400 mb-3">
              {t('nav_sign_in_or_register')}
            </div>
            
            <div className="space-y-2">
              <EmailSignInButton 
                className="w-full justify-center text-sm py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" 
                onClick={() => setIsOpen(false)}
              />
              <AppleSignInButton 
                className="w-full justify-center text-sm py-2.5 px-4 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors border border-gray-700" 
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}