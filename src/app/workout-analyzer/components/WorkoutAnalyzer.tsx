'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { WorkoutSummary } from './WorkoutSummary';
import { SessionList } from './SessionList';
import { DebugPanel } from './DebugPanel';

// 不再需要全局声明，改用直接import

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
  [key: string]: unknown;
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
  [key: string]: unknown;
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
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DebugLog {
  timestamp: string;
  message: string;
  data?: string | null;
  error?: string | null;
  stack?: string | null;
}

function WorkoutAnalyzerComponent() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [fitParserReady, setFitParserReady] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fitParserClass, setFitParserClass] = useState<any>(null);
  
  // Debug logging function
  const addDebugLog = useCallback((message: string, data?: unknown) => {
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

  const addErrorLog = useCallback((message: string, error?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry: DebugLog = {
      timestamp,
      message: `❌ ERROR: ${message}`,
      error: error ? error.toString() : null,
  stack: typeof error === 'object' && error !== null && 'stack' in error ? (error as { stack?: string }).stack || null : null
    };
    
    setDebugLogs(prev => [...prev, logEntry]);
    console.error(`[DEBUG ERROR] ${message}`, error);
  }, []);

  // Load FIT parser using ES6 import
  const loadFitParser = useCallback(async () => {
    try {
      addDebugLog('通过 npm 包加载 FitParser...');
      
      // 使用动态import加载npm包
      const FitFileParser = await import('fit-file-parser') as { default?: unknown; [key: string]: unknown };
      const ParserClass = FitFileParser.default || FitFileParser;
      
      if (ParserClass && typeof ParserClass === 'function') {
        setFitParserClass(ParserClass);
        addDebugLog('FitParser 从 npm 包加载成功', { 
          type: typeof ParserClass,
          name: ParserClass.name 
        });
        return true;
      } else {
        addErrorLog('npm 包加载成功但未找到构造函数', {
          default: typeof FitFileParser.default,
          module: typeof FitFileParser,
          keys: Object.keys(FitFileParser)
        });
        return false;
      }
    } catch (error) {
      addErrorLog('从 npm 包加载 FitParser 失败', error);
      return false;
    }
  }, [addDebugLog, addErrorLog]);

  // 不再需要备用解析器，npm包更可靠

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
  const parseFitFile = useCallback(async (file: File): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      addDebugLog('创建 FileReader 开始读取文件');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          addDebugLog('文件读取完成，开始创建 FitParser');
          addDebugLog('文件大小 (bytes)', typeof e.target?.result === 'object' && e.target?.result !== null && 'byteLength' in e.target.result ? (e.target.result as ArrayBuffer).byteLength : null);
          
          // 使用状态中的FitParser
          if (!fitParserClass || typeof fitParserClass !== 'function') {
            addErrorLog('FitParser 未正确加载或不是构造函数', { 
              fitParserClass: typeof fitParserClass,
              available: !!fitParserClass
            });
            throw new Error('FitParser not loaded or not a constructor');
          }
          
          addDebugLog('FitParser 类型检查通过', { type: typeof fitParserClass });
          
          const fitParser = new fitParserClass({
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
          
          fitParser.parse(e.target?.result as ArrayBuffer, (error: Error | null, data: unknown) => {
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
  }, [addDebugLog, addErrorLog, fitParserClass]);

  // Normalize workout data
  const normalizeWorkoutData = useCallback((workout: unknown) => {
    // 如果数据在 activity 中，提取出来
    if (typeof workout === 'object' && workout !== null && 'activity' in workout) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activity = (workout as any).activity;
      
      if (!('sessions' in workout) && activity.sessions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (workout as any).sessions = activity.sessions;
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
      
      // 等待FitParser加载完成，但也检查全局变量
      let attempts = 0;
      while (!fitParserReady && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        
        // 每次循环都检查是否已经加载完成
        if (fitParserClass && !fitParserReady) {
          addDebugLog('在等待过程中发现 FitParser 已可用');
          setFitParserReady(true);
          break;
        }
      }
      
      if (!fitParserReady && !fitParserClass) {
        addErrorLog('FitParser 加载超时');
        setError('解析器加载失败，请刷新页面重试');
        return;
      } else if (fitParserClass) {
        // 最后一次检查
        setFitParserReady(true);
        setError('');
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
          ...(typeof fitData === 'object' && fitData !== null ? fitData : {})
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
  }, [fitParserReady, fitParserClass, parseFitFile, normalizeWorkoutData, addDebugLog, addErrorLog]);

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
          
          {!fitParserReady && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">正在加载FIT文件解析器，请稍等...</p>
              <div className="mt-2 text-sm text-blue-600">
                正在尝试从CDN加载必要的库文件
              </div>
            </div>
          )}
          
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

export { WorkoutAnalyzerComponent as WorkoutAnalyzer };