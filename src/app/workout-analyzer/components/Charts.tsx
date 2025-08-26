'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WorkoutData, WorkoutRecord } from './NewWorkoutAnalyzer';

interface ChartPoint {
  x: Date;
  y: number;
  originalSpeed?: number;
}

interface Dataset {
  data: ChartPoint[];
  label: string;
  borderColor: string;
  borderWidth?: number;
}

interface ChartConfig {
  type: 'line';
  data: {
    datasets: Dataset[];
  };
  options: {
    plugins?: {
      title?: {
        display: boolean;
        text: string;
      };
    };
    invertY?: boolean;
    yAxisRange?: {
      min: number;
      max: number;
    };
    filterInfo?: {
      originalCount: number;
      filteredCount: number;
      filterEnabled: boolean;
    };
    locale?: string;
  };
}


// 转换为分:秒格式
function formatMinutesToMS(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 计算数据的统计信息
function calculateStats(data: ChartPoint[]): { mean: number; stdDev: number; min: number; max: number } {
  const values = data.map(point => point.y);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = mean - 2 * stdDev;
  const max = Math.max(...values);
  return { mean, stdDev, min, max };
}

class SimpleChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ChartConfig;
  private data: ChartConfig['data'];
  private options: ChartConfig['options'];
  private tooltip: HTMLDivElement | null = null;
  private hoveredPoint: { data: ChartPoint; index: number; distance: number; screenX: number; screenY: number } | null = null;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseLeave: () => void;
  private width: number = 0;
  private height: number = 0;
  private padding = {
    top: 40,
    right: 20,
    bottom: 60,
    left: 60
  };
  private chartWidth: number = 0;
  private chartHeight: number = 0;

  constructor(canvas: HTMLCanvasElement, config: ChartConfig) {
    console.log('初始化图表：', {
      canvasSize: {
        width: canvas.width,
        height: canvas.height
      },
      dataPoints: config.data.datasets[0]?.data.length || 0
    });

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.data = config.data;
    this.options = config.options || {};
    
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    
    this.resize();
    this.render();
    this.setupMouseEvents();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.width = rect.width;
    this.height = rect.height;
    
    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;
  }

  private render(): void {
    console.log('开始渲染图表', {
      canvasSize: {
        width: this.width,
        height: this.height
      },
      data: {
        type: this.config.type,
        points: this.data.datasets[0]?.data.length || 0
      }
    });

    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (this.config.type === 'line') {
      this.renderLineChart();
    }
  }

  private renderLineChart(): void {
    const dataset = this.data.datasets[0];
    if (!dataset || !dataset.data || dataset.data.length === 0) {
      this.renderNoData();
      return;
    }

    const xValues = dataset.data.map(d => d.x.getTime());
    const yValues = dataset.data.map(d => d.y);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    
    let yMin, yMax;
    if (this.options.yAxisRange) {
      yMin = this.options.yAxisRange.min;
      yMax = this.options.yAxisRange.max;
    } else {
      yMin = Math.min(...yValues) * 0.9;
      yMax = Math.max(...yValues) * 1.1;
    }

    this.renderGrid();
    this.renderAxes(xMin, xMax, yMin, yMax);
    this.renderDataLine(dataset, xMin, xMax, yMin, yMax);
    this.renderTitle();
  }

  private renderGrid(): void {
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1;
    
    // Y轴网格线
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = this.padding.top + (this.chartHeight / yTicks) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.padding.left + this.chartWidth, y);
      this.ctx.stroke();
    }

    // X轴网格线
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = this.padding.left + (this.chartWidth / xTicks) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding.top);
      this.ctx.lineTo(x, this.padding.top + this.chartHeight);
      this.ctx.stroke();
    }
  }

  private renderAxes(xMin: number, xMax: number, yMin: number, yMax: number): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px Arial';
    
    // Y轴和标签
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding.left, this.padding.top);
    this.ctx.lineTo(this.padding.left, this.padding.top + this.chartHeight);
    this.ctx.stroke();
    
    const yTicks = 5;
    const invertY = this.options.invertY;
    
    for (let i = 0; i <= yTicks; i++) {
      const y = invertY ? 
        this.padding.top + (this.chartHeight / yTicks) * i :
        this.padding.top + this.chartHeight - (this.chartHeight / yTicks) * i;
      const value = yMin + (yMax - yMin) * (i / yTicks);
      
      let displayValue;
      if (invertY) {
        displayValue = formatMinutesToMS(value);
      } else {
        displayValue = value.toFixed(1);
      }
      
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(displayValue, this.padding.left - 10, y);
    }
    
    // X轴和标签
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding.left, this.padding.top + this.chartHeight);
    this.ctx.lineTo(this.padding.left + this.chartWidth, this.padding.top + this.chartHeight);
    this.ctx.stroke();
    
    const xTicks = 5;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    for (let i = 0; i <= xTicks; i++) {
      const x = this.padding.left + (this.chartWidth / xTicks) * i;
      const time = new Date(xMin + (xMax - xMin) * (i / xTicks));
      const locale = this.options.locale || 'en-US';
      const label = time.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
      });
      this.ctx.fillText(label, x, this.padding.top + this.chartHeight + 10);
    }
  }

  private renderDataLine(dataset: Dataset, xMin: number, xMax: number, yMin: number, yMax: number): void {
    if (dataset.data.length === 0) return;
    
    this.ctx.strokeStyle = dataset.borderColor || '#3742fa';
    this.ctx.lineWidth = dataset.borderWidth || 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    if (dataset.data.length < 2) return;
    
    this.ctx.beginPath();
    const points = dataset.data.map(d => this.getPointPosition(d, xMin, xMax, yMin, yMax));
    
    // 使用更高程度的平滑
    const tension = 0.4; // 增加平滑系数
    
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const prev = i > 0 ? points[i - 1] : curr;
      const after = i < points.length - 2 ? points[i + 2] : next;
      
      // 计算切线向量
      const tangentX = (after.x - prev.x) * tension;
      const tangentY = (after.y - prev.y) * tension;
      
      // 使用切线计算控制点
      const cp1x = curr.x + tangentX / 3;
      const cp1y = curr.y + tangentY / 3;
      const cp2x = next.x - tangentX / 3;
      const cp2y = next.y - tangentY / 3;
      
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    
    this.ctx.stroke();

    // 绘制悬停点
    if (this.hoveredPoint) {
      this.ctx.fillStyle = dataset.borderColor || '#3742fa';
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.arc(this.hoveredPoint.screenX, this.hoveredPoint.screenY, 6, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  private getPointPosition(dataPoint: ChartPoint, xMin: number, xMax: number, yMin: number, yMax: number): { x: number; y: number } {
    const x = this.padding.left + ((dataPoint.x.getTime() - xMin) / (xMax - xMin)) * this.chartWidth;
    let y;
    if (this.options.invertY) {
      y = this.padding.top + ((dataPoint.y - yMin) / (yMax - yMin)) * this.chartHeight;
    } else {
      y = this.padding.top + this.chartHeight - ((dataPoint.y - yMin) / (yMax - yMin)) * this.chartHeight;
    }
    return { x, y };
  }

  private renderTitle(): void {
    if (!this.options.plugins?.title?.display) return;
    
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(
      this.options.plugins.title.text || '',
      this.width / 2,
      10
    );
  }

  private renderNoData(): void {
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('No data', this.width / 2, this.height / 2);
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave);
  }

  private removeMouseEvents(): void {
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const nearestPoint = this.findNearestPoint(mouseX, mouseY);
    if (nearestPoint && nearestPoint.distance < 50) {
      this.hoveredPoint = nearestPoint;
      this.showTooltip(nearestPoint, event.clientX, event.clientY);
      this.render();
    } else if (this.hoveredPoint) {
      this.hoveredPoint = null;
      this.hideTooltip();
      this.render();
    }
  }

  private onMouseLeave(): void {
    this.hoveredPoint = null;
    this.hideTooltip();
    this.render();
  }

  private findNearestPoint(mouseX: number, mouseY: number): { data: ChartPoint; index: number; distance: number; screenX: number; screenY: number } | null {
    if (!this.data.datasets[0] || !this.data.datasets[0].data.length) return null;
    
    const dataset = this.data.datasets[0];
    const points = dataset.data;
    
    const xValues = points.map(d => d.x.getTime());
    const yValues = points.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    let yMin, yMax;
    
    if (this.options.yAxisRange) {
      yMin = this.options.yAxisRange.min;
      yMax = this.options.yAxisRange.max;
    } else {
      yMin = Math.min(...yValues);
      yMax = Math.max(...yValues);
    }
    
    let nearestPoint = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < points.length; i++) {
      const dataPoint = points[i];
      const screenPoint = this.getPointPosition(dataPoint, xMin, xMax, yMin, yMax);
      
      const distance = Math.sqrt(
        Math.pow(mouseX - screenPoint.x, 2) +
        Math.pow(mouseY - screenPoint.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = {
          data: dataPoint,
          index: i,
          distance: distance,
          screenX: screenPoint.x,
          screenY: screenPoint.y
        };
      }
    }
    
    return nearestPoint;
  }

  private showTooltip(point: { data: ChartPoint; index: number; distance: number; screenX: number; screenY: number }, clientX: number, clientY: number): void {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
        line-height: 1.4;
      `;
      document.body.appendChild(this.tooltip);
    }

    const locale = this.options.locale || 'en-US';
    const time = point.data.x.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const dataset = this.data.datasets[0];
    let valueText;
    
    // 添加调试日志
    console.log('Tooltip dataset label:', dataset.label);
    
    if (dataset.label) {
      if (dataset.label.includes('心率') || dataset.label === 'heart_rate') {
        valueText = Math.round(point.data.y) + ' bpm';
      } else if (dataset.label.includes('配速') || dataset.label.includes('速度') || dataset.label === 'speed' || dataset.label === 'enhanced_speed') {
        const speedKmH = point.data.originalSpeed;
        if (typeof speedKmH === 'number') {
          const paceMinKm = point.data.y;
          valueText = `${formatMinutesToMS(paceMinKm)} min/km (${speedKmH.toFixed(2)} km/h)`;
        } else {
          valueText = formatMinutesToMS(point.data.y) + ' min/km';
        }
      } else if (dataset.label.includes('功率') || dataset.label === 'power') {
        valueText = Math.round(point.data.y) + ' W';
      } else {
        valueText = point.data.y.toFixed(1);
      }
    } else {
      valueText = point.data.y.toFixed(1);
    }

    const tooltipContent = `
      <div>时间: ${time}</div>
      <div>数值: ${valueText}</div>
      <div>数据点: ${point.index + 1}/${this.data.datasets[0].data.length}</div>
    `;

    this.tooltip.innerHTML = tooltipContent;

    let left = clientX + 10;
    let top = clientY + 10;

    const tooltipRect = this.tooltip.getBoundingClientRect();
    if (left + tooltipRect.width > window.innerWidth) {
      left = clientX - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = clientY - tooltipRect.height - 10;
    }

    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
    this.tooltip.style.display = 'block';
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  destroy(): void {
    this.removeMouseEvents();
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
  }
}

export function Charts({ workouts, showOutlierFilter = false }: { workouts: WorkoutData[]; showOutlierFilter?: boolean }) {
  const { t } = useLanguage();
  const [filterOutliers, setFilterOutliers] = useState(true);
  const chartRefs = useRef<{ [key: string]: SimpleChart }>({});

  useEffect(() => {
    const chartsSnapshot = chartRefs.current;
    return () => {
      Object.values(chartsSnapshot).forEach(chart => chart?.destroy());
    };
  }, []);

  // 从 workout 数据中提取图表数据
  const extractChartData = (workout: WorkoutData) => {
    console.log('开始处理工作数据:', { 
      fileName: workout.fileName,
      fullWorkout: workout 
    });
    
    if (!workout) {
      console.error('workout 对象为空');
      return { charts: {}, yAxisRanges: {} };
    }

    const debugData = {
      hasSessions: !!workout.sessions,
      sessionsLength: workout.sessions?.length || 0,
      hasActivity: !!workout.activity,
      activityHasRecords: !!workout.activity?.records,
      hasDirectRecords: !!workout.records,
      directRecordsLength: workout.records?.length || 0,
      fileName: workout.fileName
    };

    console.log('开始提取数据，workout对象：', debugData);

    const charts: { [key: string]: ChartPoint[] } = {};
    const yAxisRanges: { [key: string]: { min: number; max: number } } = {};

    // 从 sessions 或 activity 中获取 records
    let allRecords: Record<string, unknown>[] = [];
    
    // 从所有可能的来源收集记录
    const recordSources = [] as { source: string; records: WorkoutRecord[] }[];

    // 1. 检查活动记录
    if (workout.activity?.records && Array.isArray(workout.activity.records)) {
      recordSources.push({
        source: 'activity',
        records: workout.activity.records
      });
    }

    // 2. 检查直接记录
    if (workout.records && Array.isArray(workout.records)) {
      recordSources.push({
        source: 'direct',
        records: workout.records
      });
    }

    // 3. 检查会话记录
    if (workout.sessions) {
      workout.sessions.forEach((session, index) => {
        if (session.records && Array.isArray(session.records)) {
          recordSources.push({
            source: `session_${index}`,
            records: session.records as WorkoutRecord[]
          });
        }
      });
    }

    // 选择记录最多的数据源
    if (recordSources.length > 0) {
      const bestSource = recordSources.reduce((prev, current) => 
        prev.records.length > current.records.length ? prev : current
      );

      console.log('数据源比较：', {
        allSources: recordSources.map(s => ({
          source: s.source,
          count: s.records.length
        })),
        selectedSource: bestSource.source,
        recordCount: bestSource.records.length
      });

      allRecords = bestSource.records;
    } else {
      console.warn('没有找到任何有效的记录数据源');
      console.log('调试信息 - 检查各个数据源：', {
        hasActivity: !!workout.activity,
        activityRecords: workout.activity?.records ? workout.activity.records.length : 'none',
        directRecords: workout.records ? workout.records.length : 'none',
        sessionsCount: workout.sessions ? workout.sessions.length : 'none'
      });
    }

    console.log('收集到的记录数：', allRecords.length, '第一条记录示例：', allRecords[0]);
    
    // 分析所有记录中的所有字段名
    if (allRecords.length > 0) {
      const allFieldNames = new Set<string>();
      allRecords.slice(0, 10).forEach(record => {
        Object.keys(record).forEach(key => allFieldNames.add(key));
      });
      console.log('前10条记录中的所有字段名：', Array.from(allFieldNames).sort());
      
      // 检查常见的字段名变体
      const commonFields = ['speed', 'enhanced_speed', 'heart_rate', 'power', 'cadence', 'altitude', 'enhanced_altitude', 'timestamp'];
      const foundFields = commonFields.filter(field => allFieldNames.has(field));
      console.log('找到的常见字段：', foundFields);
    }

    // 处理速度数据（转换为配速：分钟/公里）
    console.log('开始处理速度数据，记录示例：', allRecords.slice(0, 3));
    
    const speedData = allRecords
      .filter((record, index) => {
        const hasSpeed = typeof record.speed === 'number' && !isNaN(record.speed) && record.speed > 0;
        const hasTimestamp = typeof record.timestamp === 'number' || record.timestamp instanceof Date;
        if (index < 5) { // 只打印前5条记录的详细信息
          console.log(`检查记录 ${index}:`, {
            record,
            hasSpeed,
            hasTimestamp,
            speedValue: record.speed,
            timestampValue: record.timestamp,
            recordType: typeof record.speed,
            timestampType: typeof record.timestamp
          });
        }
        return hasSpeed && hasTimestamp;
      })
      .map(record => {
        const speedKmH = record.speed as number;
        const paceMinKm = 60 / speedKmH;
        const timestamp = record.timestamp instanceof Date ? record.timestamp : new Date((record.timestamp as number) * 1000);
        return {
          x: timestamp,
          y: paceMinKm,
          originalSpeed: speedKmH
        };
      });

    console.log('速度数据过滤结果：', {
      原始记录数: allRecords.length,
      有效速度记录数: speedData.length,
      前3条速度数据: speedData.slice(0, 3)
    });

    console.log('处理后的速度数据：', {
      totalRecords: speedData.length,
      sampleData: speedData.slice(0, 3)
    });

    if (speedData.length > 0) {
      let processedSpeedData: ChartPoint[] = speedData;
      if (filterOutliers) {
        processedSpeedData = filterOutlierData(processedSpeedData);
      }
      // 应用平滑处理
      processedSpeedData = smoothData(processedSpeedData, 5);
      charts['speed'] = processedSpeedData;
    }

    // 创建一个通用的数据处理函数
    const processData = (
      field: string,
      transform?: (value: number) => number,
      additionalCheck?: (record: Record<string, unknown>) => boolean
    ) => {
      console.log(`处理${field}数据...`);
      const filteredData = allRecords
        .filter((record, index) => {
          const hasField = typeof record[field] === 'number' && !isNaN(record[field] as number);
          const hasTimestamp = typeof record.timestamp === 'number' || record.timestamp instanceof Date;
          const passesCheck = additionalCheck ? additionalCheck(record) : true;
          
          if (index < 3) { // 只打印前3条记录的详细信息
            console.log(`检查记录 ${field}[${index}]:`, {
              hasField,
              hasTimestamp,
              passesCheck,
              fieldValue: record[field],
              timestamp: record.timestamp,
              fieldType: typeof record[field],
              timestampType: typeof record.timestamp
            });
          }
          
          return hasField && hasTimestamp && passesCheck;
        })
        .map(record => {
          const timestamp = record.timestamp instanceof Date ? record.timestamp : new Date((record.timestamp as number) * 1000);
          return {
            x: timestamp,
            y: transform ? transform(record[field] as number) : (record[field] as number)
          };
        });

      console.log(`${field}数据处理完成:`, {
        totalRecords: filteredData.length,
        sampleData: filteredData.slice(0, 3)
      });

      return filteredData;
    };

    // 处理各种数据类型
    type DataConfig = {
      field: string;
      transform?: (v: number) => number;
      check?: (r: Record<string, unknown>) => boolean;
    };

    const dataTypes: Record<string, DataConfig> = {
      speed: { field: 'speed', transform: (v: number) => 60 / v, check: (r: Record<string, unknown>) => (r.speed as number) > 0 },
      heart_rate: { field: 'heart_rate' },
      power: { field: 'power' },
      cadence: { field: 'cadence', transform: (v: number) => v * 2 },
      altitude: { field: 'altitude' },
      vertical_speed: { field: 'vertical_speed' },
      grade: { field: 'grade' },
      temperature: { field: 'temperature' },
      // 跑步相关的高级指标
      step_length: { field: 'step_length' },
      stance_time: { field: 'stance_time' },
      stance_time_balance: { field: 'stance_time_balance' },
      vertical_oscillation: { field: 'vertical_oscillation' },
      vertical_ratio: { field: 'vertical_ratio' },
      ground_contact_time: { field: 'ground_contact_time' },
      ground_contact_balance: { field: 'ground_contact_balance' },
      // 其他可能的字段
      enhanced_speed: { field: 'enhanced_speed', transform: (v: number) => 60 / v, check: (r: Record<string, unknown>) => (r.enhanced_speed as number) > 0 },
      enhanced_altitude: { field: 'enhanced_altitude' },
      fractional_cadence: { field: 'fractional_cadence' },
      left_right_balance: { field: 'left_right_balance' },
      gct_balance: { field: 'gct_balance' },
      running_smoothness: { field: 'running_smoothness' },
      respiration_rate: { field: 'respiration_rate' },
      // 游泳相关
      stroke_type: { field: 'stroke_type' },
      strokes: { field: 'strokes' },
      // 骑行相关  
      left_pedal_smoothness: { field: 'left_pedal_smoothness' },
      right_pedal_smoothness: { field: 'right_pedal_smoothness' },
      left_torque_effectiveness: { field: 'left_torque_effectiveness' },
      right_torque_effectiveness: { field: 'right_torque_effectiveness' }
    };

    Object.entries(dataTypes).forEach(([type, config]) => {
      const data = processData(config.field, config.transform, config.check);
      console.log(`处理数据类型 ${type}:`, {
        字段: config.field,
        原始数据长度: data.length,
        前3条数据: data.slice(0, 3)
      });
      
      if (data.length > 0) {
        if (type === 'cadence') {
          const stats = calculateStats(data);
          const processedData = data.map(point => ({
            ...point,
            y: Math.max(point.y, stats.min)
          }));
          let finalProcessedData = processedData;
          if (filterOutliers) {
            finalProcessedData = filterOutlierData(finalProcessedData);
          }
          // 应用平滑处理
          finalProcessedData = smoothData(finalProcessedData, 5);
          charts[type] = finalProcessedData;
          yAxisRanges[type] = { min: stats.min, max: stats.max };
        } else {
          let processedData = data;
          if (filterOutliers) {
            processedData = filterOutlierData(processedData);
          }
          // 应用平滑处理
          processedData = smoothData(processedData, 5);
          charts[type] = processedData;
        }
        console.log(`✅ 成功添加图表数据: ${type}, 数据点数: ${charts[type].length}`);
      } else {
        console.log(`❌ ${type} 数据为空，跳过`);
      }
    });

    console.log('最终返回的图表数据：', {
      chartsKeys: Object.keys(charts),
      chartsCounts: Object.entries(charts).map(([key, data]) => `${key}: ${data.length}`),
      totalCharts: Object.keys(charts).length
    });

    return { charts, yAxisRanges };
  };

  const filterOutlierData = (data: ChartPoint[]) => {
    const values = data.map(d => d.y);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );
    const threshold = 2 * stdDev;
    
    return data.filter(d => Math.abs(d.y - mean) <= threshold);
  };

  // 添加移动平均平滑函数
  const smoothData = (data: ChartPoint[], windowSize: number = 5): ChartPoint[] => {
    if (data.length <= windowSize) return data;
    
    const smoothed: ChartPoint[] = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length - 1, i + halfWindow);
      const slice = data.slice(start, end + 1);
      
      const avgY = slice.reduce((sum, point) => sum + point.y, 0) / slice.length;
      
      // 保留原始数据的所有属性，只更新 y 值
      const originalPoint = data[i];
      smoothed.push({
        x: originalPoint.x,
        y: avgY,
        originalSpeed: originalPoint.originalSpeed
      });
    }
    
    return smoothed;
  };

  return (
    <div className="space-y-6">
      {showOutlierFilter && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterOutliers}
              onChange={(e) => setFilterOutliers(e.target.checked)}
              className="mr-2"
            />
            {t('filter_outliers')}
          </label>
          <span className="text-sm text-gray-600">
            {t('filter_outliers_desc')}
          </span>
        </div>
      )}

      {workouts.map((workout, workoutIndex) => {
        const result = extractChartData(workout);
        const chartData = result.charts;
        const yAxisRanges = result.yAxisRanges as { [key: string]: { min: number; max: number } };
        
        console.log('处理的数据：', {
          workoutIndex,
          chartDataTypes: Object.keys(chartData),
          recordCounts: Object.entries(chartData).map(([type, data]) => `${type}: ${data.length}条记录`),
          yAxisRanges,
        });

        return (
          <div key={workoutIndex} className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {workout.fileName} - {t('chart_analysis')}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(chartData).map(([type, data]) => {
                const titles = {
                  heart_rate: t('heart_rate'),
                  power: t('power'),
                  altitude: t('altitude'),
                  cadence: t('cadence'),
                  speed: t('speed'),
                  temperature: t('temperature'),
                  distance: t('distance'),
                  vertical_speed: t('vertical_speed'),
                  grade: t('grade'),
                  timer_time: t('timer_time'),
                  // 跑步指标
                  step_length: t('step_length') || 'Step Length',
                  stance_time: t('stance_time') || 'Stance Time',
                  stance_time_balance: t('stance_time_balance') || 'Stance Time Balance',
                  vertical_oscillation: t('vertical_oscillation') || 'Vertical Oscillation',
                  vertical_ratio: t('vertical_ratio') || 'Vertical Ratio',
                  ground_contact_time: t('ground_contact_time') || 'Ground Contact Time',
                  ground_contact_balance: t('ground_contact_balance') || 'Ground Contact Balance',
                  enhanced_speed: t('enhanced_speed') || 'Enhanced Speed',
                  enhanced_altitude: t('enhanced_altitude') || 'Enhanced Altitude',
                  fractional_cadence: t('fractional_cadence') || 'Fractional Cadence',
                  left_right_balance: t('left_right_balance') || 'Left Right Balance',
                  gct_balance: t('gct_balance') || 'GCT Balance',
                  running_smoothness: t('running_smoothness') || 'Running Smoothness',
                  respiration_rate: t('respiration_rate') || 'Respiration Rate',
                  // 游泳指标
                  stroke_type: t('stroke_type') || 'Stroke Type',
                  strokes: t('strokes') || 'Strokes',
                  // 骑行指标
                  left_pedal_smoothness: t('left_pedal_smoothness') || 'Left Pedal Smoothness',
                  right_pedal_smoothness: t('right_pedal_smoothness') || 'Right Pedal Smoothness',
                  left_torque_effectiveness: t('left_torque_effectiveness') || 'Left Torque Effectiveness',
                  right_torque_effectiveness: t('right_torque_effectiveness') || 'Right Torque Effectiveness'
                };

                const units = {
                  heart_rate: 'bpm',
                  power: 'W',
                  altitude: 'm',
                  cadence: 'spm',
                  speed: 'min/km',
                  temperature: '°C',
                  distance: 'km',
                  vertical_speed: 'm/s',
                  grade: '%',
                  timer_time: 'min',
                  // 跑步指标单位
                  step_length: 'mm',
                  stance_time: 'ms',
                  stance_time_balance: '%',
                  vertical_oscillation: 'mm',
                  vertical_ratio: '%',
                  ground_contact_time: 'ms',
                  ground_contact_balance: '%',
                  enhanced_speed: 'min/km',
                  enhanced_altitude: 'm',
                  fractional_cadence: 'rpm',
                  left_right_balance: '%',
                  gct_balance: '%',
                  running_smoothness: '%',
                  respiration_rate: 'brpm',
                  // 游泳指标单位
                  stroke_type: '',
                  strokes: '次',
                  // 骑行指标单位
                  left_pedal_smoothness: '%',
                  right_pedal_smoothness: '%',
                  left_torque_effectiveness: '%',
                  right_torque_effectiveness: '%'
                };
                
                return (
                  <div key={type} className="space-y-2">
                    <canvas
                      ref={(el) => {
                        if (el) {
                          // 清理旧的图表
                          if (chartRefs.current[`${workoutIndex}_${type}`]) {
                            chartRefs.current[`${workoutIndex}_${type}`].destroy();
                          }
                          
                          // 创建新的图表
                          chartRefs.current[`${workoutIndex}_${type}`] = new SimpleChart(el, {
                            type: 'line',
                            data: {
                              datasets: [{
                                data,
                                label: titles[type as keyof typeof titles],
                                borderColor: {
                                  'heart_rate': '#ff4757',
                                  'power': '#3742fa',
                                  'altitude': '#2ed573',
                                  'cadence': '#1e90ff',
                                  'speed': '#ff6b81',
                                  'temperature': '#ff7f50',
                                  'distance': '#a8e6cf',
                                  'vertical_speed': '#dfe6e9',
                                  'grade': '#fd79a8',
                                  'timer_time': '#6c5ce7',
                                  // 跑步指标颜色
                                  'step_length': '#00d2d3',
                                  'stance_time': '#ff9ff3',
                                  'stance_time_balance': '#54a0ff',
                                  'vertical_oscillation': '#5f27cd',
                                  'vertical_ratio': '#00d8d6',
                                  'ground_contact_time': '#ff9ff3',
                                  'ground_contact_balance': '#54a0ff',
                                  'enhanced_speed': '#ff6b81',
                                  'enhanced_altitude': '#2ed573',
                                  'fractional_cadence': '#1e90ff',
                                  'left_right_balance': '#ffa726',
                                  'gct_balance': '#ab47bc',
                                  'running_smoothness': '#26a69a',
                                  'respiration_rate': '#ef5350',
                                  // 游泳指标颜色
                                  'stroke_type': '#42a5f5',
                                  'strokes': '#66bb6a',
                                  // 骑行指标颜色
                                  'left_pedal_smoothness': '#ffca28',
                                  'right_pedal_smoothness': '#ffa726',
                                  'left_torque_effectiveness': '#8d6e63',
                                  'right_torque_effectiveness': '#a1887f'
                                }[type] || '#3742fa',
                                borderWidth: 2
                              }]
                            },
                            options: {
                              plugins: {
                                title: {
                                  display: true,
                                  text: `${titles[type as keyof typeof titles]} (${units[type as keyof typeof units]})`
                                }
                              },
                              invertY: type === 'speed' || type === 'enhanced_speed',
                              yAxisRange: yAxisRanges[type]
                            }
                          });
                        }
                      }}
                      className="w-full h-52 border rounded"
                    />
                    <p className="text-sm text-gray-500 text-center">
                      {t('data_points')}: {data.length}
                      {filterOutliers && (
                        <span className="ml-2">
                          ({t('filtered')}: {data.length})
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>

            {Object.keys(chartData).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('no_chart_data')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
