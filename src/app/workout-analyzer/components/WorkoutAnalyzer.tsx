'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { WorkoutSummary } from './WorkoutSummary';
import { SessionList } from './SessionList';
import { DebugPanel } from './DebugPanel';

declare global {
  interface Window {
    FitParser?: any;
    FitFileParser?: any;
  }
}

export interface WorkoutRecord {
  timestamp?: number;
  time?: number;
  heart_rate?: number;
  speed?: number;
  distance?: number;
  altitude?: number;
  power?: number;
  cadence?: number;
  step_length?: number;
  stance_time?: number;
  stance_time_balance?: number;
  vertical_oscillation?: number;
  vertical_ratio?: number;
  [key: string]: any;
}

export interface WorkoutSession {
  sport?: string | number;
  start_time?: number;
  timestamp?: number;
  total_elapsed_time?: number;
  total_timer_time?: number;
  total_distance?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_speed?: number;
  max_speed?: number;
  total_calories?: number;
  laps?: Array<{
    records?: WorkoutRecord[];
  }>;
  allRecords?: WorkoutRecord[];
  [key: string]: any;
}

export interface WorkoutData {
  fileName: string;
  fileSize: number;
  lastModified: Date;
  sessions?: WorkoutSession[];
  records?: WorkoutRecord[];
  activity?: {
    sessions?: WorkoutSession[];
    records?: WorkoutRecord[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DebugLog {
  timestamp: string;
  message: string;
  data?: string | null;
  error?: string | null;
  stack?: string | null;
}

export function WorkoutAnalyzer() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [fitParserReady, setFitParserReady] = useState(false);
  
  // Debug logging function
  const addDebugLog = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry: DebugLog = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    setDebugLogs(prev => [...prev, logEntry]);
    
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }, []);

  const addErrorLog = useCallback((message: string, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry: DebugLog = {
      timestamp,
      message: `❌ ERROR: ${message}`,
      error: error ? error.toString() : null,
      stack: error?.stack || null
    };
    
    setDebugLogs(prev => [...prev, logEntry]);
    console.error(`[DEBUG ERROR] ${message}`, error);
  }, []);

  // Load FIT parser
  const loadFitParser = useCallback(async () => {
    try {
      addDebugLog('尝试从 skypack 加载 FitParser...');
      const module = await import('https://cdn.skypack.dev/fit-file-parser');
      window.FitParser = module.default || module;
      addDebugLog('FitParser 加载成功', { type: typeof window.FitParser });
      return true;
    } catch (error) {
      addErrorLog('从 skypack 加载 FitParser 失败', error);
      try {
        addDebugLog('尝试从 jsdelivr 加载 FitParser...');
        const response = await fetch('https://cdn.jsdelivr.net/npm/fit-file-parser@1.9.3/dist/fit-parser.min.js');
        const code = await response.text();
        eval(code);
        window.FitParser = window.FitFileParser || window.FitParser;
        addDebugLog('FitParser 从 jsdelivr 加载成功', { type: typeof window.FitParser });
        return true;
      } catch (error2) {
        addErrorLog('从 jsdelivr 加载 FitParser 也失败', error2);
        return false;
      }
    }
  }, [addDebugLog, addErrorLog]);

  // Initialize FIT parser on component mount
  useEffect(() => {
    const initFitParser = async () => {
      addDebugLog('开始初始化 FitParser...');
      const ready = await loadFitParser();
      setFitParserReady(ready);
      
      if (ready) {
        addDebugLog('FitParser 初始化成功');
      } else {
        addErrorLog('FitParser 初始化失败');
      }
    };
    
    initFitParser();
  }, [loadFitParser, addDebugLog, addErrorLog]);

  // Parse FIT file
  const parseFitFile = useCallback(async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      addDebugLog('创建 FileReader 开始读取文件');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          addDebugLog('文件读取完成，开始创建 FitParser');
          addDebugLog('文件大小 (bytes)', e.target?.result?.byteLength);
          
          const FitParserClass = window.FitParser;
          if (!FitParserClass) {
            throw new Error('FitParser not loaded');
          }
          
          const fitParser = new FitParserClass({
            force: true,
            speedUnit: 'km/h',
            lengthUnit: 'm',
            temperatureUnit: 'celsius',
            elapsedRecordField: true,
            mode: 'cascade'
          });

          addDebugLog('FitParser 配置', {
            force: true,
            speedUnit: 'km/h',
            lengthUnit: 'm',
            temperatureUnit: 'celsius',
            elapsedRecordField: true,
            mode: 'cascade'
          });

          addDebugLog('开始调用 fitParser.parse()');
          
          fitParser.parse(e.target?.result, (error: any, data: any) => {
            if (error) {
              addErrorLog('FitParser.parse() 返回错误', error);
              reject(error);
            } else {
              addDebugLog('FitParser.parse() 成功');
              addDebugLog('原始解析数据结构', {
                type: typeof data,
                keys: data ? Object.keys(data) : null
              });
              resolve(data);
            }
          });
        } catch (error) {
          addErrorLog('FitParser 创建或调用过程中发生错误', error);
          reject(error);
        }
      };
      
      reader.onerror = (e) => {
        addErrorLog('FileReader 读取文件失败', e);
        reject(new Error('文件读取失败'));
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total * 100).toFixed(1);
          addDebugLog(`文件读取进度: ${progress}%`);
        }
      };
      
      addDebugLog('开始以 ArrayBuffer 形式读取文件');
      reader.readAsArrayBuffer(file);
    });
  }, [addDebugLog, addErrorLog]);

  // Normalize workout data
  const normalizeWorkoutData = useCallback((workout: any) => {
    // 如果数据在 activity 中，提取出来
    if (workout.activity) {
      const activity = workout.activity;
      
      if (!workout.sessions && activity.sessions) {
        workout.sessions = activity.sessions;
      }
      
      // 从 laps 中查找 records（COROS 数据的常见位置）
      if (activity.sessions) {
        for (const session of activity.sessions) {
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
  }, []);

  // Handle file upload
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) {
      addDebugLog('没有选择文件');
      return;
    }

    addDebugLog(`开始处理文件, 文件数量: ${files.length}`);

    if (!fitParserReady) {
      addDebugLog('FitParser 尚未加载完成，等待加载...');
      setError('正在加载解析器，请稍等...');
      
      // 等待FitParser加载完成
      let attempts = 0;
      while (!fitParserReady && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!fitParserReady) {
        addErrorLog('FitParser 加载超时');
        setError('解析器加载失败，请刷新页面重试');
        return;
      }
    }

    // 处理多个文件
    const fitFiles = Array.from(files).filter(file => file.name.endsWith('.fit'));
    
    if (fitFiles.length === 0) {
      addErrorLog('没有找到 .fit 文件');
      setError('请选择 .fit 格式的文件');
      return;
    }
    
    addDebugLog(`找到 ${fitFiles.length} 个 .fit 文件`);
    
    setIsLoading(true);
    setError('');
    
    const newWorkouts: WorkoutData[] = [];
    
    // 逐个处理所有文件
    for (let i = 0; i < fitFiles.length; i++) {
      const file = fitFiles[i];
      addDebugLog(`处理文件 ${i + 1}/${fitFiles.length}: ${file.name}`);
      
      try {
        const fitData = await parseFitFile(file);
        
        // 为每个workout添加文件名信息
        const workoutData: WorkoutData = {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified),
          ...fitData
        };
        
        normalizeWorkoutData(workoutData);
        newWorkouts.push(workoutData);
        addDebugLog(`文件 ${file.name} 解析成功`);
        
      } catch (error) {
        addErrorLog(`解析文件 ${file.name} 失败`, error);
        setError(`解析文件 ${file.name} 失败: ${(error as Error).message}`);
      }
    }
    
    setIsLoading(false);
    
    if (newWorkouts.length > 0) {
      setWorkouts(prev => [...prev, ...newWorkouts]);
    }
  }, [fitParserReady, parseFitFile, normalizeWorkoutData, addDebugLog, addErrorLog]);

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
    addDebugLog('日志已清空');
  }, [addDebugLog]);

  const exportDebugLogs = useCallback(() => {
    const logText = debugLogs.map(log => {
      let text = `[${log.timestamp}] ${log.message}`;
      if (log.data) text += '\n' + log.data;
      if (log.error) text += '\n错误: ' + log.error;
      if (log.stack) text += '\n堆栈: ' + log.stack;
      return text;
    }).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [debugLogs]);

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">上传FIT文件</h2>
          <FileUpload 
            onFilesSelected={handleFiles}
            isLoading={isLoading}
            disabled={!fitParserReady}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {workouts.length > 0 && (
        <WorkoutSummary workouts={workouts} />
      )}

      {/* Sessions List */}
      {workouts.length > 0 && (
        <SessionList workouts={workouts} />
      )}

      {/* Debug Panel */}
      <DebugPanel 
        logs={debugLogs}
        onClear={clearDebugLogs}
        onExport={exportDebugLogs}
      />
    </div>
  );
}