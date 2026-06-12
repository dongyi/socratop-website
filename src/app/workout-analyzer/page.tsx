'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { NewWorkoutAnalyzer } from './components/NewWorkoutAnalyzer';
// import { WorkoutAnalyzer } from './components/WorkoutAnalyzer';

export default function WorkoutAnalyzerPage() {
  const { t } = useLanguage();
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-16">
        {/* Page Header */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-light mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {t('workout_analyzer_title')}
              </h1>
              <p className="text-gray-400">{t('workout_analyzer_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NewWorkoutAnalyzer />
          {/* <WorkoutAnalyzer /> */}
        </main>
      </div>
    </>
  );
}