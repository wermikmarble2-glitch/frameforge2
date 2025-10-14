"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Anim8State, Action } from '@/lib/anim8-types';

interface CanvasAreaProps {
  state: Anim8State;
  dispatch: React.Dispatch<Action>;
  canvasRef: React.MutableRefObject<Record<string, HTMLCanvasElement>>;
  thumbnailRef: React.MutableRefObject<Record<string, HTMLCanvasElement>>;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ state, dispatch, canvasRef, thumbnailRef }) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const { animation, currentFrameId, currentLayerId, brushColor, brushSize, selectedTool, onionSkinning } = state;
  const { width, height, frames } = animation;

  const currentFrameIndex = frames.findIndex(f => f.id === currentFrameId);
  const currentFrame = frames[currentFrameIndex];
  const currentLayer = currentFrame?.layers.find(l => l.id === currentLayerId);

  const updateThumbnail = useCallback((frameId: string) => {
    const thumbCanvas = thumbnailRef.current[frameId];
    const frame = frames.find(f => f.id === frameId);
    if (!thumbCanvas || !frame) return;

    const thumbCtx = thumbCanvas.getContext('2d');
    if (!thumbCtx) return;

    thumbCtx.fillStyle = '#1c1917'; // bg-stone-900
    thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
    
    const scale = Math.min(thumbCanvas.width / width, thumbCanvas.height / height);
    const x = (thumbCanvas.width / 2) - (width / 2) * scale;
    const y = (thumbCanvas.height / 2) - (height / 2) * scale;

    frame.layers.forEach(layer => {
        if(layer.isVisible && canvasRef.current[layer.id]){
            thumbCtx.drawImage(canvasRef.current[layer.id], x, y, width * scale, height * scale);
        }
    });
  }, [thumbnailRef, frames, width, height, canvasRef]);
  
  const draw = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    // Onion skinning
    if (onionSkinning) {
      const prevFrame = frames[currentFrameIndex - 1];
      const nextFrame = frames[currentFrameIndex + 1];
      ctx.globalAlpha = 0.2;
      if (prevFrame) {
        prevFrame.layers.forEach(layer => {
          if (layer.isVisible && canvasRef.current[layer.id]) {
            ctx.drawImage(canvasRef.current[layer.id], 0, 0);
          }
        });
      }
      if (nextFrame) {
        nextFrame.layers.forEach(layer => {
          if (layer.isVisible && canvasRef.current[layer.id]) {
            ctx.drawImage(canvasRef.current[layer.id], 0, 0);
          }
        });
      }
      ctx.globalAlpha = 1.0;
    }

    // Draw current frame layers
    currentFrame?.layers.forEach(layer => {
      if (layer.isVisible && canvasRef.current[layer.id]) {
        ctx.drawImage(canvasRef.current[layer.id], 0, 0);
      }
    });

  }, [displayCanvasRef, width, height, currentFrame, onionSkinning, frames, currentFrameIndex, canvasRef]);
  
  useEffect(() => {
    draw();
  }, [state, draw]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !currentLayer) return;
    isDrawing.current = true;
    lastPoint.current = getMousePos(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || !lastPoint.current || !currentLayer) return;
    const activeCanvas = canvasRef.current[currentLayer.id];
    if (!activeCanvas) return;
    const ctx = activeCanvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getMousePos(e);
    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPoint.current = currentPoint;
    draw();
  };

  const handleMouseUp = () => {
    if(isDrawing.current) {
        isDrawing.current = false;
        lastPoint.current = null;
        updateThumbnail(currentFrameId);
    }
  };
  
  return (
    <canvas
      ref={displayCanvasRef}
      width={width}
      height={height}
      className="max-h-full max-w-full cursor-crosshair rounded-md bg-white shadow-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default CanvasArea;
