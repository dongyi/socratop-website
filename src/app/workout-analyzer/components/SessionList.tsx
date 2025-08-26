'use client';

import React, { useState } from 'react';
import { WorkoutData, WorkoutSession } from './WorkoutAnalyzer';
import { SessionDetails } from './SessionDetails';

interface SessionListProps {
  workouts: WorkoutData[];
}

interface SessionWithMetadata extends WorkoutSession {
  workoutIndex: number;
  sessionIndex: number;
  workout: WorkoutData;
  startTime: Date;
}

export function SessionList({ workouts }: SessionListProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Collect and sort all sessions
  const getAllSessions = (): SessionWithMetadata[] => {
    let allSessions: SessionWithMetadata[] = [];
    
    workouts.forEach((workout, workoutIndex) => {
      // Normalize workout data if needed
      if (workout.activity && !workout.sessions) {
        workout.sessions = workout.activity.sessions;
        
        // Extract records from laps if available
        if (workout.activity.sessions) {
          for (const session of workout.activity.sessions) {
            if (session.laps && session.laps.length > 0) {
              session.allRecords = [];
              for (const lap of session.laps) {
                if (lap.records && lap.records.length > 0) {
                  session.allRecords = session.allRecords.concat(lap.records);
                }
              }
            }
          }
        }
      }
      
      if (workout.sessions) {
        workout.sessions.forEach((session, sessionIndex) => {
          allSessions.push({
            ...session,
            workoutIndex,
            sessionIndex,
            workout,
            startTime: session.start_time ? new Date(session.start_time) : new Date(0)
          });
        });
      }
    });
    
    // Sort by start time (newest first)
    return allSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  };

  const getSportName = (sportId: string | number | undefined): string => {
    if (typeof sportId === 'string') {
      const sportNames: { [key: string]: string } = {
        'training': '训练',
        'strength_training': '力量训练',
        'running': '跑步',
        'cycling': '骑行',
        'swimming': '游泳',
        'walking': '步行',
        'hiking': '徒步',
        'generic': '通用运动'
      };
      return sportNames[sportId] || sportId;
    }
    
    const sports: { [key: number]: string } = {
      0: '通用',
      1: '跑步',
      2: '骑行',
      3: '过渡',
      4: '健身',
      5: '游泳',
      6: '篮球',
      7: '足球',
      8: '网球',
      9: '美式足球',
      10: '训练',
      11: '步行',
      12: '越野跑',
      13: '街头跑',
      14: '径赛跑',
      15: '徒步',
      16: '登山'
    };
    return sports[sportId as number] || `运动类型 ${sportId}`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '-';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const toggleSessionDetails = (sessionKey: string) => {
    setExpandedSession(expandedSession === sessionKey ? null : sessionKey);
  };

  const allSessions = getAllSessions();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">运动记录详情</h2>
        <p className="text-sm text-gray-600 mt-1">共 {allSessions.length} 次运动</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                文件名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                运动类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                开始时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时长
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                距离
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均心率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                卡路里
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allSessions.map((session, index) => {
              const sessionKey = `${session.workoutIndex}-${session.sessionIndex}`;
              const isExpanded = expandedSession === sessionKey;
              const records = session.allRecords || [];
              
              return (
                <React.Fragment key={sessionKey}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.workout.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSportName(session.sport)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(session.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(session.total_elapsed_time || session.total_timer_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistance(session.total_distance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.avg_heart_rate ? `${session.avg_heart_rate} bpm` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.total_calories ? `${session.total_calories} kcal` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleSessionDetails(sessionKey)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isExpanded ? '收起' : '查看详情'}
                        {records.length > 0 && (
                          <span className="ml-1 text-gray-500">({records.length}点)</span>
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 bg-gray-50">
                        <SessionDetails 
                          session={session}
                          records={records}
                          sessionKey={sessionKey}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}