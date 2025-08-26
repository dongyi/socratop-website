'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Charts } from './Charts';

export interface WorkoutRecord {
  timestamp?: number;
  heart_rate?: number;
  speed?: number;
  [key: string]: unknown;
}

export interface WorkoutData {
  fileName: string;
  sessions?: Record<string, unknown>[];
  records?: WorkoutRecord[];
  activity?: {
    sessions?: Record<string, unknown>[];
    records?: WorkoutRecord[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function NewWorkoutAnalyzer() {
  const { t } = useLanguage();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 添加调试日志
  useEffect(() => {
    if (workouts.length > 0) {
      console.log('工作数据已更新：', {
        workoutsCount: workouts.length,
        firstWorkout: {
          fileName: workouts[0].fileName,
          hasActivity: !!workouts[0].activity,
          activityRecords: workouts[0].activity?.records?.length || 0,
          directRecords: workouts[0].records?.length || 0,
          sessionsCount: workouts[0].sessions?.length || 0
        }
      });
    }
  }, [workouts]);
  const [parserReady, setParserReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parser, setParser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState(t('parser_loading'));

  // 加载解析器
  useEffect(() => {
    const loadParser = async () => {
      try {
        setDebugInfo(t('parser_loading'));
  const fitModule = await import('fit-file-parser') as { default?: unknown; [key: string]: unknown };
  setDebugInfo(t('parser_loading'));
        
  const ParserClass = fitModule.default || fitModule;
        if (typeof ParserClass === 'function') {
          setParser(() => ParserClass); // 使用函数形式避免直接调用
          setParserReady(true);
          setDebugInfo(t('parsing_success'));
          console.log('FIT Parser loaded successfully', { type: typeof ParserClass, name: ParserClass.name });
        } else {
          setDebugInfo(t('module_export_error'));
          setError(t('parsing_failed'));
        }
      } catch (err) {
        console.error('Failed to load FIT Parser:', err);
        setDebugInfo(`${t('loading_failed')}: ${(err as Error).message}`);
        setError(t('parsing_failed'));
      }
    };

    loadParser();
  }, [t]);

  // 处理文件上传
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !parser || !parserReady) {
      setDebugInfo(t('loading_failed'));
      return;
    }

    setIsLoading(true);
    setError('');
    setDebugInfo(t('parsing_files'));

    const fitFiles = Array.from(files).filter(file => file.name.endsWith('.fit'));
    
    if (fitFiles.length === 0) {
      setError(t('please_select_fit'));
      setIsLoading(false);
      setDebugInfo(t('please_select_fit'));
      return;
    }

    setDebugInfo(`找到 ${fitFiles.length} 个 .fit 文件，开始解析...`);
    const newWorkouts: WorkoutData[] = [];

    for (const file of fitFiles) {
      try {
        setDebugInfo(`正在解析 ${file.name}...`);
        const buffer = await file.arrayBuffer();
        
        const result = await new Promise<unknown>((resolve, reject) => {
          try {
            const fitParser = new parser({
              force: true,
              speedUnit: 'km/h',
              lengthUnit: 'm',
            });

            fitParser.parse(buffer, (error: Error | null, data: unknown) => {
              if (error) {
                console.error('Parser callback error:', error);
                reject(error);
              } else {
                console.log('Parser callback success:', data ? Object.keys(data) : 'null data');
                resolve(data);
              }
            });
          } catch (constructorError) {
            console.error('Parser constructor error:', constructorError);
            reject(constructorError);
          }
        });

        newWorkouts.push({
          fileName: file.name,
          ...(typeof result === 'object' && result !== null ? result : {})
        });

        setDebugInfo(`✅ ${file.name} 解析成功！`);

      } catch (err) {
        console.error(`解析文件 ${file.name} 失败:`, err);
        setError(`解析文件 ${file.name} 失败: ${(err as Error).message}`);
        setDebugInfo(`❌ ${file.name} 解析失败: ${(err as Error).message}`);
      }
    }

    setWorkouts(newWorkouts); // 直接设置新的workouts，不合并旧数据
    setIsLoading(false);
    
    if (newWorkouts.length > 0) {
      setDebugInfo(`🎉 成功解析 ${newWorkouts.length} 个文件！`);
    }
  }, [parser, parserReady, t]);

  return (
    <div className="space-y-8">
      {/* 文件上传区域 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('upload_fit_files')}</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".fit"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={!parserReady || isLoading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${(!parserReady || isLoading) ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {!parserReady ? t('parser_loading') : isLoading ? t('parsing_files') : t('select_or_drag_files')}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('supports_multiple_files')}
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* 调试信息 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">{t('debug_status')}: {debugInfo}</p>
          <p className="text-xs text-blue-600 mt-1">
            {t('parser_ready')}: {parserReady ? 'Yes' : 'No'} | {t('parser_type')}: {typeof parser}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* 图表可视化区域 */}
      {workouts.length > 0 && (
        <Charts workouts={workouts} showOutlierFilter={true} />
      )}

      {/* 数据概要区域 */}
      {workouts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('parse_results_summary')}</h2>
          
          <div className="space-y-4">
            {workouts.map((workout, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{workout.fileName}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{t('sessions')}: {workout.sessions?.length || 0}</div>
                  <div>{t('records')}: {workout.records?.length || 0}</div>
                  {workout.activity && (
                    <div>{t('activity_sessions')}: {workout.activity.sessions?.length || 0}</div>
                  )}
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    {t('view_raw_data')}
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(workout, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}