"use client";

import React from 'react';
import type { Anim8State, Action } from '@/lib/anim8-types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Brush, Eraser } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  state: Anim8State;
  dispatch: React.Dispatch<Action>;
}

const Toolbar: React.FC<ToolbarProps> = ({ state, dispatch }) => {
  const { selectedTool, brushColor, brushSize } = state;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === 'brush' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => dispatch({ type: 'SET_TOOL', tool: 'brush' })}
            >
              <Brush />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Brush Tool</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === 'eraser' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => dispatch({ type: 'SET_TOOL', tool: 'eraser' })}
            >
              <Eraser />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eraser Tool</TooltipContent>
        </Tooltip>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label htmlFor="color-picker">Brush Color</Label>
        <div className="relative">
          <input
            id="color-picker"
            type="color"
            value={brushColor}
            onChange={(e) => dispatch({ type: 'SET_BRUSH_COLOR', color: e.target.value })}
            className="h-10 w-full cursor-pointer appearance-none rounded-md border-none bg-transparent p-0"
            style={{'--color': brushColor} as React.CSSProperties}
          />
           <div 
             className="pointer-events-none absolute inset-0 rounded-md border border-input" 
             style={{backgroundColor: brushColor}}>
           </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="brush-size">Brush Size: {brushSize}px</Label>
        <Slider
          id="brush-size"
          min={1}
          max={100}
          step={1}
          value={[brushSize]}
          onValueChange={(value) => dispatch({ type: 'SET_BRUSH_SIZE', size: value[0] })}
        />
      </div>
    </div>
  );
};

export default Toolbar;
