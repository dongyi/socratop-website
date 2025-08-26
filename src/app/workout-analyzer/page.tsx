'use client';

import React, { useState, useEffect, useRef } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import { WorkoutAnalyzer } from './components/WorkoutAnalyzer';

export default function WorkoutAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <LanguageToggle />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">运动数据分析器</h1>
              <p className="text-sm text-gray-600">解析和可视化你的FIT运动数据文件</p>
            </div>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              返回主页
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkoutAnalyzer />
      </main>
    </div>
  );
}