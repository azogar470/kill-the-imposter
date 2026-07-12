'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasStroke, StrokePoint } from '@/lib/types';
import { soundEffects } from '@/lib/AudioEffects';

interface DrawingBoardProps {
  strokes: CanvasStroke[];
  isMyTurn: boolean;
  myPlayerId: string;
  myPlayerName: string;
  initialInk: number;
  onSubmitStroke: (stroke: CanvasStroke, inkUsed: number) => void;
  onEndTurn: () => void;
}

const COLORS = [
  '#000000', // Black
  '#ff0055', // Red
  '#00f0ff', // Blue
  '#00ff66', // Green
  '#ffaa00'  // Yellow
];

export const DrawingBoard: React.FC<DrawingBoardProps> = ({
  strokes,
  isMyTurn,
  myPlayerId,
  myPlayerName,
  initialInk,
  onSubmitStroke,
  onEndTurn
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<StrokePoint[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [inkRemaining, setInkRemaining] = useState<number>(initialInk);

  useEffect(() => {
    setInkRemaining(initialInk);
  }, [initialInk, isMyTurn]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke.points, stroke.color, stroke.size);
    });

    if (currentPoints.length > 0) {
      drawStroke(ctx, currentPoints, selectedColor, 8);
    }
  }, [strokes, currentPoints, selectedColor]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    points: StrokePoint[],
    color: string,
    size: number
  ) => {
    if (points.length === 0) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || inkRemaining <= 0) return;
    setIsDrawing(true);
    const pt = getCoordinates(e);
    setCurrentPoints([pt]);
    soundEffects.playDrawTick();
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMyTurn || inkRemaining <= 0) return;
    const pt = getCoordinates(e);

    const lastPt = currentPoints[currentPoints.length - 1];
    if (lastPt) {
      const dx = pt.x - lastPt.x;
      const dy = pt.y - lastPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) return;

      const cost = dist * 0.08;
      const nextInk = Math.max(0, inkRemaining - cost);
      setInkRemaining(nextInk);

      if (nextInk <= 0) {
        handleEndDraw();
        return;
      }
    }

    setCurrentPoints((prev) => [...prev, pt]);
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 0) {
      const strokeObj: CanvasStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: myPlayerId,
        playerName: myPlayerName,
        color: selectedColor,
        size: 8,
        points: currentPoints
      };

      const inkUsed = initialInk - inkRemaining;
      onSubmitStroke(strokeObj, Math.round(inkUsed));
      setCurrentPoints([]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      
      {/* Optional Brush Color Palette */}
      <div className="flex items-center gap-3 justify-center mb-1">
        <span className="font-mono text-xs font-bold text-black">COLOR:</span>
        {COLORS.map((col) => (
          <button
            key={col}
            disabled={!isMyTurn}
            onClick={() => setSelectedColor(col)}
            className={`w-8 h-8 rounded-full border-3 border-black transition-all ${
              selectedColor === col ? 'scale-115 ring-2 ring-black' : 'opacity-75 hover:opacity-100'
            }`}
            style={{ backgroundColor: col }}
          />
        ))}
        {isMyTurn && (
          <span className="font-mono text-xs font-bold text-black ml-4">
            INK: {Math.round(inkRemaining)}%
          </span>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="neo-canvas-wrapper w-full relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={handleStartDraw}
          onMouseMove={handleMoveDraw}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleMoveDraw}
          onTouchEnd={handleEndDraw}
          className={`w-full aspect-[8/5] block bg-white ${
            !isMyTurn || inkRemaining <= 0 ? 'pointer-events-none' : 'cursor-crosshair'
          }`}
        />
      </div>

      {/* Toolbar Section immediately below canvas */}
      <div className="w-full flex items-center justify-between py-2 px-1">
        
        {/* Left Side: Yellow Pencil pointing downwards */}
        <div className="flex items-center gap-2">
          <svg
            className="w-12 h-12"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Pencil Eraser */}
            <path d="M40 10 H60 V22 H40 Z" fill="#FF8DA1" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
            {/* Metal Band */}
            <path d="M40 22 H60 V28 H40 Z" fill="#CCCCCC" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
            {/* Pencil Body */}
            <path d="M40 28 H60 V70 H40 Z" fill="#FFCC00" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
            {/* Shaved Wood */}
            <path d="M40 70 L50 86 L60 70 Z" fill="#EBD1A7" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
            {/* Graphite Lead Point pointing down */}
            <path d="M47 80 L50 86 L53 80 Z" fill="#333333" stroke="#000000" strokeWidth="4" />
          </svg>
          <span className="font-mono text-xs font-bold text-black hidden sm:inline">DRAW PANEL</span>
        </div>

        {/* Right Side: Bright Cyan Pill Button (#38C8FF) with FINISH and Pink text-shadow */}
        {isMyTurn && (
          <div>
            <button
              onClick={onEndTurn}
              className="btn-finish-cyan"
            >
              FINISH
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
