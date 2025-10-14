"use client";

import React, { useState } from 'react';
import type { Anim8State, Action, Layer } from '@/lib/anim8-types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LayersPanelProps {
  state: Anim8State;
  dispatch: React.Dispatch<Action>;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ state, dispatch }) => {
  const { animation, currentFrameId, currentLayerId, onionSkinning } = state;
  const currentFrame = animation.frames.find(f => f.id === currentFrameId);
  
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDragId(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    if (dragId) {
      dispatch({ type: 'REORDER_LAYER', dragId, dropId });
    }
    setDragId(null);
  };

  if (!currentFrame) return null;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold">Layers</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'ADD_LAYER', afterLayerId: currentLayerId })}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Layer</TooltipContent>
        </Tooltip>
      </div>
      <div 
        className="flex-grow space-y-2 overflow-y-auto"
        onDragOver={(e) => e.preventDefault()}
      >
        {currentFrame.layers.map((layer, index) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDrop={(e) => handleDrop(e, layer.id)}
            className={`flex items-center gap-2 rounded-md p-2 transition-colors ${currentLayerId === layer.id ? 'bg-primary/20' : 'hover:bg-muted/50'}`}
            onClick={() => dispatch({ type: 'SET_CURRENT_LAYER', layerId: layer.id })}
          >
            <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
            <Input
              value={layer.name}
              onChange={(e) => dispatch({ type: 'RENAME_LAYER', layerId: layer.id, name: e.target.value })}
              className="h-8 flex-grow bg-transparent"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'SET_LAYER_VISIBILITY', layerId: layer.id, isVisible: !layer.isVisible });
                  }}
                >
                  {layer.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{layer.isVisible ? 'Hide Layer' : 'Show Layer'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'DELETE_LAYER', layerId: layer.id });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Layer</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <label htmlFor="onion-skinning" className="text-sm font-medium">
          Onion Skinning
        </label>
        <Switch
          id="onion-skinning"
          checked={onionSkinning}
          onCheckedChange={(checked) => dispatch({ type: 'SET_ONION_SKINNING', enabled: checked })}
        />
      </div>
    </div>
  );
};

export default LayersPanel;
