'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="flex items-center bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-full p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            language === 'en'
              ? 'bg-white text-black'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            language === 'zh'
              ? 'bg-white text-black'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          中文
        </button>
      </div>
    </div>
  );
}