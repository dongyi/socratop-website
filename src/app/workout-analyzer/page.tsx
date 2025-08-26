'use client';

import React from 'react';
import Link from 'next/link';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewWorkoutAnalyzer } from './components/NewWorkoutAnalyzer';
// import { WorkoutAnalyzer } from './components/WorkoutAnalyzer';

export default function WorkoutAnalyzerPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <LanguageToggle />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('workout_analyzer_title')}</h1>
              <p className="text-sm text-gray-600">{t('workout_analyzer_subtitle')}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('back_to_home')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewWorkoutAnalyzer />
        {/* <WorkoutAnalyzer /> */}
      </main>
    </div>
  );
}