'use client';

import React, { useRef, useEffect, useState } from 'react';
import { WorkoutRecord } from './WorkoutAnalyzer';

interface ChartCanvasProps {
  records: WorkoutRecord[];
  fieldName: string;
  options: {
    label: string;
    color: string;
    title: string;
    invertY?: boolean;
    transform?: (value: number) => number;
  };
  filterOutliers: boolean;
  width: number;
  height: number;
}

interface DataPoint {
  x: Date;
  y: number;
  isOutlier?: boolean;
}

export function ChartCanvas({ records, fieldName, options, filterOutliers, width, height }: ChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Filter outliers using 3-sigma rule
  const filterOutliersFromData = (data: DataPoint[], sigmaThreshold = 2): DataPoint[] => {
    if (!data || data.length === 0) return data;
    
    // Calculate mean and standard deviation
    const values = data.map(d => d.y);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate thresholds
    const upperThreshold = mean + sigmaThreshold * stdDev;
    const lowerThreshold = mean - sigmaThreshold * stdDev;
    
    // Mark outliers
    return data.map(point => ({
      ...point,
      isOutlier: point.y > upperThreshold || point.y < lowerThreshold
    }));
  };

  // Calculate moving average for smoothing
  const calculateMovingAverage = (data: DataPoint[], windowSize = 15): DataPoint[] => {
    if (data.length < windowSize) return data;
    
    const smoothedData: DataPoint[] = [];
    
    // Keep first few points
    for (let i = 0; i < Math.floor(windowSize / 2); i++) {
      smoothedData.push(data[i]);
    }
    
    // Calculate moving average
    for (let i = Math.floor(windowSize / 2); i < data.length - Math.floor(windowSize / 2); i++) {
      let sum = 0;
      for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
        sum += data[j].y;
      }
      smoothedData.push({
        x: data[i].x,
        y: sum / windowSize
      });
    }
    
    // Keep last few points
    for (let i = data.length - Math.floor(windowSize / 2); i < data.length; i++) {
      smoothedData.push(data[i]);
    }
    
    return smoothedData;
  };

  // Prepare chart data
  const prepareData = (): { data: DataPoint[], filteredCount: number } => {
    // Find possible field names
    const possibleFields = [
      fieldName,
      `enhanced_${fieldName}`,
      `avg_${fieldName}`,
      `${fieldName}_rate`
    ];
    
    let data: DataPoint[] = [];
    
    for (const field of possibleFields) {
      const fieldData = records
        .filter(record => record[field] !== undefined && record[field] !== null && record.timestamp)
        .map(record => {
          let value = record[field] as number;
          if (options.transform) {
            value = options.transform(value);
          }
          return {
            x: new Date(record.timestamp!),
            y: value
          };
        });
      
      if (fieldData.length > 0) {
        data = fieldData;
        break;
      }
    }

    if (data.length === 0) return { data: [], filteredCount: 0 };

    // Apply outlier detection
    const originalCount = data.length;
    data = filterOutliersFromData(data);
    
    // Remove outliers if filtering is enabled
    let filteredCount = 0;
    if (filterOutliers) {
      const originalData = [...data];
      data = data.filter(point => !point.isOutlier);
      filteredCount = originalData.length - data.length;
    }
    
    // Apply smoothing
    if (data.length > 0) {
      data = calculateMovingAverage(data);
    }

    return { data, filteredCount };
  };

  // Draw chart
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { data, filteredCount } = prepareData();
    
    // Set canvas size with device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart dimensions
    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (data.length === 0) {
      // Draw "no data" message
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`无${options.title.replace('变化', '')}数据`, width / 2, height / 2);
      return;
    }

    // Calculate data ranges
    const xValues = data.map(d => d.x.getTime());
    const yValues = data.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues) * 0.9;
    let yMax = Math.max(...yValues) * 1.1;

    // Function to get point position
    const getPointPosition = (point: DataPoint) => {
      const xRatio = (point.x.getTime() - xMin) / (xMax - xMin);
      const yRatio = (point.y - yMin) / (yMax - yMin);
      
      return {
        x: padding.left + xRatio * chartWidth,
        y: options.invertY ? 
          padding.top + yRatio * chartHeight : 
          padding.top + chartHeight - yRatio * chartHeight
      };
    };

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = padding.left + (chartWidth / xTicks) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padding.top + (chartHeight / yTicks) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // X axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';

    // X axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= xTicks; i++) {
      const x = padding.left + (chartWidth / xTicks) * i;
      const time = new Date(xMin + (xMax - xMin) * (i / xTicks));
      const label = time.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      ctx.fillText(label, x, padding.top + chartHeight + 20);
    }

    // Y axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= yTicks; i++) {
      const y = options.invertY ?
        padding.top + (chartHeight / yTicks) * i :
        padding.top + chartHeight - (chartHeight / yTicks) * i;
      const value = yMin + (yMax - yMin) * (i / yTicks);
      
      let displayValue: string;
      if (options.invertY && options.label.includes('配速')) {
        // Format pace as min:sec
        const minutes = Math.floor(value);
        const seconds = Math.round((value - minutes) * 60);
        displayValue = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        displayValue = Math.round(value).toString();
      }
      
      ctx.fillText(displayValue, padding.left - 10, y);
    }

    // Draw title
    let titleText = options.title;
    if (filterOutliers && filteredCount > 0) {
      titleText += ` (已过滤 ${filteredCount} 个异常点)`;
    }
    
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(titleText, width / 2, 10);

    // Draw data line using smooth curves
    if (data.length >= 2) {
      ctx.strokeStyle = options.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = data.map(d => getPointPosition(d));

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y);
      } else {
        // Use smooth curves for multiple points
        for (let i = 0; i < points.length - 1; i++) {
          const current = points[i];
          const next = points[i + 1];
          
          let cp1x, cp1y, cp2x, cp2y;
          
          if (i === 0) {
            cp1x = current.x + (next.x - current.x) * 0.25;
            cp1y = current.y;
            cp2x = next.x - (points[i + 2] ? (points[i + 2].x - current.x) * 0.15 : (next.x - current.x) * 0.25);
            cp2y = next.y - (points[i + 2] ? (points[i + 2].y - current.y) * 0.15 : 0);
          } else if (i === points.length - 2) {
            const prev = points[i - 1];
            cp1x = current.x + (next.x - prev.x) * 0.15;
            cp1y = current.y + (next.y - prev.y) * 0.15;
            cp2x = next.x - (next.x - current.x) * 0.25;
            cp2y = next.y;
          } else {
            const prev = points[i - 1];
            const next2 = points[i + 2];
            cp1x = current.x + (next.x - prev.x) * 0.15;
            cp1y = current.y + (next.y - prev.y) * 0.15;
            cp2x = next.x - (next2.x - current.x) * 0.15;
            cp2y = next.y - (next2.y - current.y) * 0.15;
          }
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        }
      }

      ctx.stroke();

      // Draw hover point
      if (hoveredPoint) {
        ctx.fillStyle = options.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoveredPoint.screenX, hoveredPoint.screenY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  // Handle mouse move for hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { data } = prepareData();
    if (data.length === 0) return;

    // Find nearest point
    const xValues = data.map(d => d.x.getTime());
    const yValues = data.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues) * 0.9;
    let yMax = Math.max(...yValues) * 1.1;

    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getPointPosition = (point: DataPoint) => {
      const xRatio = (point.x.getTime() - xMin) / (xMax - xMin);
      const yRatio = (point.y - yMin) / (yMax - yMin);
      
      return {
        x: padding.left + xRatio * chartWidth,
        y: options.invertY ? 
          padding.top + yRatio * chartHeight : 
          padding.top + chartHeight - yRatio * chartHeight
      };
    };

    let nearestPoint = null;
    let minDistance = Infinity;

    for (let i = 0; i < data.length; i++) {
      const dataPoint = data[i];
      const screenPoint = getPointPosition(dataPoint);
      
      const distance = Math.sqrt(
        Math.pow(screenPoint.x - mouseX, 2) + 
        Math.pow(screenPoint.y - mouseY, 2)
      );

      if (distance < minDistance && distance < 30) {
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

    if (nearestPoint) {
      setHoveredPoint(nearestPoint);
      
      // Create tooltip content
      const time = nearestPoint.data.x.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      let valueText = nearestPoint.data.y.toFixed(1);
      if (options.label.includes('心率')) {
        valueText = Math.round(nearestPoint.data.y) + ' bpm';
      } else if (options.label.includes('配速')) {
        const minutes = Math.floor(nearestPoint.data.y);
        const seconds = Math.round((nearestPoint.data.y - minutes) * 60);
        valueText = `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
      } else if (options.label.includes('步频') || options.label.includes('踏频')) {
        valueText = Math.round(nearestPoint.data.y) + (options.label.includes('步频') ? ' spm' : ' rpm');
      } else if (options.label.includes('海拔')) {
        valueText = Math.round(nearestPoint.data.y) + ' m';
      } else if (options.label.includes('功率')) {
        valueText = Math.round(nearestPoint.data.y) + ' W';
      }

      const tooltipContent = `时间: ${time}\n数值: ${valueText}\n数据点: ${nearestPoint.index + 1}/${data.length}`;
      
      setTooltip({
        x: e.clientX + 10,
        y: e.clientY - 10,
        content: tooltipContent
      });
    } else {
      setHoveredPoint(null);
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltip(null);
  };

  // Redraw chart when data changes
  useEffect(() => {
    drawChart();
  }, [records, fieldName, options, filterOutliers, hoveredPoint, width, height]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      />
      
      {tooltip && (
        <div
          className="fixed bg-black bg-opacity-80 text-white text-sm p-2 rounded shadow-lg pointer-events-none z-10 whitespace-pre-line"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}