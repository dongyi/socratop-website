'use client';

import React from 'react';
import { WorkoutData, WorkoutSession } from './WorkoutAnalyzer';

interface WorkoutSummaryProps {
  workouts: WorkoutData[];
}

export function WorkoutSummary({ workouts }: WorkoutSummaryProps) {
  // Calculate global statistics
  const calculateGlobalStats = () => {
    let totalWorkouts = 0;
    let totalSessions = 0;
    let totalDistance = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    workouts.forEach(workout => {
      totalWorkouts++;
      
      // Normalize workout data structure
      if (workout.activity && !workout.sessions) {
        workout.sessions = workout.activity.sessions;
      }
      
      if (workout.sessions) {
        totalSessions += workout.sessions.length;
        workout.sessions.forEach((session: WorkoutSession) => {
          totalDistance += session.total_distance || 0;
          totalDuration += session.total_elapsed_time || session.total_timer_time || 0;
          totalCalories += session.total_calories || 0;
        });
      }
    });

    return {
      totalWorkouts,
      totalSessions,
      totalDistance,
      totalDuration,
      totalCalories
    };
  };

  const formatDistance = (meters: number) => {
    if (!meters) return '-';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = calculateGlobalStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">运动数据概览</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-500 mt-1">运动文件</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalSessions}</div>
            <div className="text-sm text-gray-500 mt-1">运动次数</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{formatDistance(stats.totalDistance)}</div>
            <div className="text-sm text-gray-500 mt-1">总距离</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-gray-500 mt-1">总时长</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{Math.round(stats.totalCalories)}</div>
            <div className="text-sm text-gray-500 mt-1">总卡路里</div>
          </div>
        </div>
      </div>
    </div>
  );
}