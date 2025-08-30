'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-full p-0.5 ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
          language === 'en'
            ? 'bg-white text-black'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('zh')}
        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
          language === 'zh'
            ? 'bg-white text-black'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        中文
      </button>
    </div>
  );
}