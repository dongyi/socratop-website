'use client';

import React, { useState } from 'react';
import { DebugLog } from './WorkoutAnalyzer';

interface DebugPanelProps {
  logs: DebugLog[];
  onClear: () => void;
  onExport: () => void;
}

export function DebugPanel({ logs, onClear, onExport }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">调试日志</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {logs.length} 条日志
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              清空
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              导出
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isExpanded ? '收起' : '展开'}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="font-mono text-sm space-y-2">
              {logs.length === 0 ? (
                <div className="text-gray-400">暂无日志</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-400 text-xs">[{log.timestamp}]</span>
                      <span className={`text-sm ${
                        log.message.includes('❌ ERROR') 
                          ? 'text-red-400' 
                          : log.message.includes('成功') || log.message.includes('完成')
                            ? 'text-green-400'
                            : 'text-gray-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                    
                    {log.data && (
                      <div className="mt-1 ml-4 text-xs text-blue-300 bg-gray-800 p-2 rounded overflow-x-auto">
                        <pre>{log.data}</pre>
                      </div>
                    )}
                    
                    {log.error && (
                      <div className="mt-1 ml-4 text-xs text-red-300">
                        错误详情: {log.error}
                      </div>
                    )}
                    
                    {log.stack && (
                      <div className="mt-1 ml-4 text-xs text-red-300 bg-red-900 bg-opacity-20 p-2 rounded overflow-x-auto">
                        <pre>{log.stack}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {logs.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                调试日志可以帮助诊断文件解析问题。如果遇到问题，可以将日志导出并发送给开发者。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}