"use client";

import React, { useEffect, useState } from 'react';
import type { Anim8State, Action, Frame } from '@/lib/anim8-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineProps {
  state: Anim8State;
  dispatch: React.Dispatch<Action>;
  thumbnailRef: React.MutableRefObject<Record<string, HTMLCanvasElement>>;
}

const FrameNameEditor = ({ frame, dispatch }: { frame: Frame, dispatch: React.Dispatch<Action> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(frame.name);

  const handleBlur = () => {
    setIsEditing(false);
    if (name !== frame.name) {
      dispatch({ type: 'RENAME_FRAME', frameId: frame.id, name: name || `Frame ${frame.id.substring(0,2)}` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setName(frame.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-6 w-24 text-xs"
      />
    );
  }

  return (
    <span onDoubleClick={() => setIsEditing(true)} className="text-xs px-1 w-24 truncate text-center">
      {frame.name}
    </span>
  );
};


const Timeline: React.FC<TimelineProps> = ({ state, dispatch, thumbnailRef }) => {
  const { animation, currentFrameId } = state;

  useEffect(() => {
    animation.frames.forEach(frame => {
      if (!thumbnailRef.current[frame.id]) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 80;
        thumbnailRef.current[frame.id] = canvas;
      }
    });
  }, [animation.frames, thumbnailRef]);

  return (
    <div className="flex h-full items-center gap-4 p-2">
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => dispatch({ type: 'ADD_FRAME', afterFrameId: currentFrameId })}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Frame</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => dispatch({ type: 'DUPLICATE_FRAME', frameId: currentFrameId })}>
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate Frame</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="icon" onClick={() => dispatch({ type: 'DELETE_FRAME', frameId: currentFrameId })}>
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Frame</TooltipContent>
        </Tooltip>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-2">
          {animation.frames.map((frame, index) => (
            <div
              key={frame.id}
              onClick={() => dispatch({ type: 'SET_CURRENT_FRAME', frameId: frame.id })}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-md p-1 ${currentFrameId === frame.id ? 'bg-primary/30' : 'hover:bg-muted'}`}
            >
              <div className="relative">
                <canvas
                    ref={el => { if (el) thumbnailRef.current[frame.id] = el; }}
                    width={120}
                    height={80}
                    className="rounded-md border bg-card"
                />
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded-sm">{index+1}</div>
              </div>
              <FrameNameEditor frame={frame} dispatch={dispatch} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Timeline;
