'use client';

import React, { useState } from 'react';
import { WorkoutSession, WorkoutRecord } from './WorkoutAnalyzer';
import { ChartCanvas } from './ChartCanvas';

interface SessionDetailsProps {
  session: WorkoutSession & { workoutIndex: number; sessionIndex: number; workout: { fileName: string; [key: string]: unknown } };
  records: WorkoutRecord[];
  sessionKey?: string;
}

export function SessionDetails({ session, records }: SessionDetailsProps) {
  const [filterOutliers, setFilterOutliers] = useState(false);

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
      10: '训练',
      11: '步行',
      15: '徒步'
    };
    return sports[sportId as number] || `运动类型 ${sportId}`;
  };

  const isRunning = session && (session.sport === 'running' || session.sport === 'run' || session.sport === 1);

  const exportSessionJSON = () => {
    const sessionData = {
      fileName: session.workout.fileName,
      sessionIndex: session.sessionIndex,
      session: session,
      records: records,
      exportTime: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.workout.fileName}-session-${session.sessionIndex + 1}-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">开始时间:</span>
            <div className="text-gray-900">{formatTimestamp(session.start_time)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">结束时间:</span>
            <div className="text-gray-900">{formatTimestamp(session.timestamp)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">运动时长:</span>
            <div className="text-gray-900">{formatDuration(session.total_elapsed_time || session.total_timer_time)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">总距离:</span>
            <div className="text-gray-900">{formatDistance(session.total_distance)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">平均心率:</span>
            <div className="text-gray-900">{session.avg_heart_rate || '-'} bpm</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">最大心率:</span>
            <div className="text-gray-900">{session.max_heart_rate || '-'} bpm</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">总卡路里:</span>
            <div className="text-gray-900">{session.total_calories || '-'} kcal</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">数据点数:</span>
            <div className="text-gray-900">{records.length}</div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">图表数据</h4>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterOutliers}
              onChange={(e) => setFilterOutliers(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">过滤异常值 (3σ)</span>
          </label>
        </div>
      </div>

      {/* Charts Grid */}
      {records.length > 0 ? (
        <div className="space-y-6">
          {/* First row of charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="heart_rate"
                options={{
                  label: '心率 (bpm)',
                  color: '#ef4444',
                  title: '心率变化'
                }}
                filterOutliers={filterOutliers}
                width={300}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="speed"
                options={{
                  label: '配速 (min/km)',
                  color: '#06b6d4',
                  title: '配速变化',
                  invertY: true,
                  transform: (value: number) => {
                    if (value <= 0) return 0;
                    const kmh = value * 3.6;
                    const pace = 60 / kmh;
                    return pace > 10 ? 10 : pace;
                  }
                }}
                filterOutliers={filterOutliers}
                width={300}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="cadence"
                options={{
                  label: isRunning ? '步频 (spm)' : '踏频 (rpm)',
                  color: '#8b5cf6',
                  title: isRunning ? '步频变化' : '踏频变化',
                  transform: isRunning ? (value: number) => {
                    const transformed = value * 2;
                    return transformed < 150 ? 150 : transformed;
                  } : undefined
                }}
                filterOutliers={filterOutliers}
                width={300}
                height={200}
              />
            </div>
          </div>

          {/* Second row of charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="altitude"
                options={{
                  label: '海拔 (m)',
                  color: '#10b981',
                  title: '海拔变化'
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="power"
                options={{
                  label: '功率 (W)',
                  color: '#f59e0b',
                  title: '功率变化'
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="step_length"
                options={{
                  label: '步幅 (mm)',
                  color: '#6366f1',
                  title: '步幅变化'
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="stance_time"
                options={{
                  label: '触地时间 (ms)',
                  color: '#ec4899',
                  title: '触地时间变化'
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
          </div>

          {/* Third row of charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="stance_time_balance"
                options={{
                  label: '触地时间平衡 (%)',
                  color: '#14b8a6',
                  title: '触地时间平衡变化'
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="vertical_oscillation"
                options={{
                  label: '垂直振幅 (mm)',
                  color: '#f97316',
                  title: '垂直振幅变化',
                  transform: (value: number) => value / 10
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <ChartCanvas
                records={records}
                fieldName="vertical_ratio"
                options={{
                  label: '垂直振幅比 (%)',
                  color: '#84cc16',
                  title: '垂直振幅比变化',
                  transform: (value: number) => value / 10
                }}
                filterOutliers={filterOutliers}
                width={250}
                height={200}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          此运动为{getSportName(session.sport)}，无详细的逐秒记录数据
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={exportSessionJSON}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          导出此Session为JSON
        </button>
      </div>
    </div>
  );
}