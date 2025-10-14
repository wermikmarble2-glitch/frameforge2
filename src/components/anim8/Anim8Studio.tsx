"use client";
import React, { useEffect, useCallback, useState } from 'react';
import { useAnim8State, getInitialState } from '@/hooks/useAnim8State';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';
import Timeline from './Timeline';
import CanvasArea from './CanvasArea';
import { Button } from '@/components/ui/button';
import { Download, Upload, Play, Pause, FastForward } from 'lucide-react';
import JSZip from 'jszip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Anim8Studio = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { state, dispatch, canvasRef, thumbnailRef } = useAnim8State(getInitialState(800, 600));

  const {
    animation,
    currentFrameId,
    currentLayerId,
    isPlaying,
    fps,
  } = state;

  useEffect(() => {
    setIsMounted(true);
    const initialCanvas = document.createElement('canvas');
    initialCanvas.width = animation.width;
    initialCanvas.height = animation.height;
    canvasRef.current[state.currentLayerId] = initialCanvas;
  }, []);

  const handleNextFrame = useCallback(() => {
    const currentIndex = animation.frames.findIndex(f => f.id === currentFrameId);
    const nextIndex = (currentIndex + 1) % animation.frames.length;
    dispatch({ type: 'SET_CURRENT_FRAME', frameId: animation.frames[nextIndex].id });
  }, [animation.frames, currentFrameId, dispatch]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(handleNextFrame, 1000 / fps);
      return () => clearInterval(interval);
    }
  }, [isPlaying, fps, handleNextFrame]);
  
  const handleExportSequence = async () => {
    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = animation.width;
    tempCanvas.height = animation.height;
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) return;

    for (let i = 0; i < animation.frames.length; i++) {
        const frame = animation.frames[i];
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        for (const layer of frame.layers) {
            if (layer.isVisible && canvasRef.current[layer.id]) {
                ctx.drawImage(canvasRef.current[layer.id], 0, 0);
            }
        }
        
        const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (blob) {
            zip.file(`frame_${String(i).padStart(4, '0')}.png`, blob);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${animation.name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <TooltipProvider>
      <div className="grid h-full w-full grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] bg-background">
        <header className="col-span-3 flex h-14 items-center justify-between border-b px-4">
          <h1 className="text-xl font-headline font-bold text-primary">Anim8</h1>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'TOGGLE_PLAYING' })}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                        const count = parseInt(prompt("How many in-between frames?", "2") || "0");
                        if(count > 0) dispatch({type: 'ADD_INBETWEENS', frameId: currentFrameId, count})
                    }}>
                        <FastForward />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Add In-betweens</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleExportSequence}>
                  <Download />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export PNG Sequence</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <aside className="row-start-2 flex flex-col border-r p-2">
          <Toolbar state={state} dispatch={dispatch} />
        </aside>

        <main className="row-start-2 overflow-hidden bg-muted/20 flex items-center justify-center p-4">
          <CanvasArea state={state} dispatch={dispatch} canvasRef={canvasRef} thumbnailRef={thumbnailRef} />
        </main>

        <aside className="row-start-2 border-l p-2">
          <LayersPanel state={state} dispatch={dispatch} />
        </aside>

        <footer className="col-span-3 row-start-3 border-t">
          <Timeline state={state} dispatch={dispatch} thumbnailRef={thumbnailRef} />
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default Anim8Studio;
