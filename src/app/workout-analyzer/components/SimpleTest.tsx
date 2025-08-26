'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

class SmoothChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: Point[];
  private tension: number;

  constructor(canvas: HTMLCanvasElement, data: Point[], tension = 0.25) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.data = data;
    this.tension = tension;
  }

  draw() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 设置线条样式
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#3742fa';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.data.length < 2) return;

    // 开始绘制平滑曲线
    this.ctx.moveTo(this.data[0].x, this.data[0].y);

    for (let i = 0; i < this.data.length - 1; i++) {
      const curr = this.data[i];
      const next = this.data[i + 1];
      const prev = i > 0 ? this.data[i - 1] : curr;
      const after = i < this.data.length - 2 ? this.data[i + 2] : next;

      // 计算切线向量，这决定了曲线的平滑程度
      const tangentX = (after.x - prev.x) * this.tension;
      const tangentY = (after.y - prev.y) * this.tension;

      // 计算贝塞尔曲线的控制点
      const cp1x = curr.x + tangentX / 3;
      const cp1y = curr.y + tangentY / 3;
      const cp2x = next.x - tangentX / 3;
      const cp2y = next.y - tangentY / 3;

      // 绘制三次贝塞尔曲线
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }

    this.ctx.stroke();
  }
}

export function SimpleTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tension, setTension] = useState(0.25);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    // 生成测试数据
    const data: Point[] = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        x: i * 30 + 50,
        y: Math.sin(i * 0.3) * 100 + 200 // 使用正弦函数生成波浪形数据
      });
    }

    const chart = new SmoothChart(canvasRef.current, data, tension);
    chart.draw();
  }, [tension]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">平滑折线图测试</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          平滑程度 ({tension.toFixed(2)})
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={tension}
          onChange={(e) => setTension(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border rounded bg-white"
      />
    </div>
  );
}