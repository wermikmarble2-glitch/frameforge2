"use client";

import { useReducer, Reducer, useRef } from 'react';
import type { Anim8State, Action, Animation, Frame, Layer } from '@/lib/anim8-types';

const newId = () => Math.random().toString(36).substr(2, 9);

export const useAnim8State = (initialState: Anim8State) => {
  const canvasRef = useRef<Record<string, HTMLCanvasElement>>({});
  const thumbnailRef = useRef<Record<string, HTMLCanvasElement>>({});

  const reducer: Reducer<Anim8State, Action> = (state, action) => {
    switch (action.type) {
      case 'SET_TOOL':
        return { ...state, selectedTool: action.tool };
      case 'SET_BRUSH_COLOR':
        return { ...state, brushColor: action.color };
      case 'SET_BRUSH_SIZE':
        return { ...state, brushSize: action.size };
      case 'SET_CURRENT_FRAME':
        const newFrame = state.animation.frames.find(f => f.id === action.frameId);
        return { ...state, currentFrameId: action.frameId, currentLayerId: newFrame?.layers[0]?.id ?? '' };
      case 'SET_CURRENT_LAYER':
        return { ...state, currentLayerId: action.layerId };
      case 'ADD_FRAME': {
        const newLayerId = newId();
        const newFrame: Frame = {
          id: newId(),
          name: `Frame ${state.animation.frames.length + 1}`,
          layers: [{ id: newLayerId, name: 'Layer 1', isVisible: true, opacity: 1 }],
        };

        const newCanvas = document.createElement('canvas');
        newCanvas.width = state.animation.width;
        newCanvas.height = state.animation.height;
        canvasRef.current[newLayerId] = newCanvas;

        const frameIndex = state.animation.frames.findIndex(f => f.id === action.afterFrameId);
        const newFrames = [...state.animation.frames];
        newFrames.splice(frameIndex + 1, 0, newFrame);
        return { ...state, animation: { ...state.animation, frames: newFrames }, currentFrameId: newFrame.id, currentLayerId: newLayerId };
      }
      case 'DUPLICATE_FRAME': {
        const sourceFrame = state.animation.frames.find(f => f.id === action.frameId);
        if (!sourceFrame) return state;

        const newLayers = sourceFrame.layers.map(layer => {
          const newLayerId = newId();
          const newCanvas = document.createElement('canvas');
          newCanvas.width = state.animation.width;
          newCanvas.height = state.animation.height;
          const sourceCanvas = canvasRef.current[layer.id];
          if(sourceCanvas) {
            newCanvas.getContext('2d')?.drawImage(sourceCanvas, 0, 0);
          }
          canvasRef.current[newLayerId] = newCanvas;
          return { ...layer, id: newLayerId };
        });

        const newFrame: Frame = {
            id: newId(),
            name: `${sourceFrame.name} Copy`,
            layers: newLayers,
        };
        
        const frameIndex = state.animation.frames.findIndex(f => f.id === action.frameId);
        const newFrames = [...state.animation.frames];
        newFrames.splice(frameIndex + 1, 0, newFrame);
        return { ...state, animation: { ...state.animation, frames: newFrames }, currentFrameId: newFrame.id, currentLayerId: newFrame.layers[0]?.id ?? '' };
      }
       case 'DELETE_FRAME': {
        if (state.animation.frames.length <= 1) return state;
        const frameToDelete = state.animation.frames.find(f => f.id === action.frameId);
        frameToDelete?.layers.forEach(l => delete canvasRef.current[l.id]);

        const newFrames = state.animation.frames.filter(f => f.id !== action.frameId);
        let newCurrentFrameId = state.currentFrameId;
        if(state.currentFrameId === action.frameId) {
            const oldIndex = state.animation.frames.findIndex(f => f.id === action.frameId);
            newCurrentFrameId = newFrames[Math.max(0, oldIndex - 1)]?.id ?? newFrames[0]?.id;
        }
        return { ...state, animation: { ...state.animation, frames: newFrames }, currentFrameId: newCurrentFrameId };
      }
      case 'RENAME_FRAME': {
        const newFrames = state.animation.frames.map(frame => 
          frame.id === action.frameId ? { ...frame, name: action.name } : frame
        );
        return { ...state, animation: { ...state.animation, frames: newFrames } };
      }
      case 'ADD_LAYER': {
        const newLayerId = newId();
        const newLayer: Layer = { id: newLayerId, name: `Layer ${Date.now() % 100}`, isVisible: true, opacity: 1 };
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = state.animation.width;
        newCanvas.height = state.animation.height;
        canvasRef.current[newLayerId] = newCanvas;

        const newFrames = state.animation.frames.map(frame => {
          if (frame.id === state.currentFrameId) {
            const layerIndex = frame.layers.findIndex(l => l.id === action.afterLayerId);
            const newLayers = [...frame.layers];
            newLayers.splice(layerIndex + 1, 0, newLayer);
            return { ...frame, layers: newLayers };
          }
          return frame;
        });
        return { ...state, animation: { ...state.animation, frames: newFrames }, currentLayerId: newLayer.id };
      }
      case 'DELETE_LAYER': {
         const newFrames = state.animation.frames.map(frame => {
          if (frame.id === state.currentFrameId) {
              if (frame.layers.length <= 1) return frame;
              return { ...frame, layers: frame.layers.filter(l => l.id !== action.layerId) };
          }
          return frame;
        });
        delete canvasRef.current[action.layerId];

        const currentFrame = newFrames.find(f => f.id === state.currentFrameId);
        let newCurrentLayerId = state.currentLayerId;
        if(state.currentLayerId === action.layerId) {
            const oldIndex = currentFrame?.layers.findIndex(l => l.id === action.layerId);
            newCurrentLayerId = currentFrame?.layers[Math.max(0, (oldIndex ?? 1) - 1)]?.id ?? currentFrame?.layers[0]?.id ?? '';
        }

        return { ...state, animation: { ...state.animation, frames: newFrames }, currentLayerId: newCurrentLayerId };
      }
      case 'SET_LAYER_VISIBILITY': {
        const newFrames = state.animation.frames.map(frame => ({
          ...frame,
          layers: frame.layers.map(layer => layer.id === action.layerId ? { ...layer, isVisible: action.isVisible } : layer)
        }));
        return { ...state, animation: { ...state.animation, frames: newFrames } };
      }
      case 'RENAME_LAYER': {
        const newFrames = state.animation.frames.map(frame => ({
          ...frame,
          layers: frame.layers.map(layer => layer.id === action.layerId ? { ...layer, name: action.name } : layer)
        }));
        return { ...state, animation: { ...state.animation, frames: newFrames } };
      }
      case 'REORDER_LAYER': {
         const newFrames = state.animation.frames.map(frame => {
          if (frame.id !== state.currentFrameId) return frame;
          const layers = [...frame.layers];
          const dragIndex = layers.findIndex(l => l.id === action.dragId);
          const dropIndex = layers.findIndex(l => l.id === action.dropId);
          if (dragIndex === -1 || dropIndex === -1) return frame;
          const [draggedItem] = layers.splice(dragIndex, 1);
          layers.splice(dropIndex, 0, draggedItem);
          return { ...frame, layers };
        });
        return { ...state, animation: { ...state.animation, frames: newFrames } };
      }
      case 'TOGGLE_PLAYING':
        return { ...state, isPlaying: !state.isPlaying };
      case 'SET_FPS':
        return { ...state, fps: action.fps };
      case 'SET_ONION_SKINNING':
        return { ...state, enabled: action.enabled };
      case 'ADD_INBETWEENS': {
        const frameIndex = state.animation.frames.findIndex(f => f.id === action.frameId);
        if (frameIndex === -1 || frameIndex >= state.animation.frames.length - 1) return state;

        const newFramesToAdd: Frame[] = [];
        for (let i = 0; i < action.count; i++) {
          const newLayerId = newId();
          const newFrame: Frame = {
            id: newId(),
            name: `In-between`,
            layers: [{ id: newLayerId, name: 'Layer 1', isVisible: true, opacity: 1 }],
          };
          const newCanvas = document.createElement('canvas');
          newCanvas.width = state.animation.width;
          newCanvas.height = state.animation.height;
          canvasRef.current[newLayerId] = newCanvas;
          newFramesToAdd.push(newFrame);
        }

        const newFrames = [...state.animation.frames];
        newFrames.splice(frameIndex + 1, 0, ...newFramesToAdd);
        return { ...state, animation: { ...state.animation, frames: newFrames } };
      }
      case 'LOAD_ANIMATION':
        return action.state;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch, canvasRef, thumbnailRef };
};

const firstLayerId = newId();
const firstFrameId = newId();

export const getInitialState = (width: number, height: number): Anim8State => ({
  animation: {
    id: newId(),
    name: 'Untitled Animation',
    width,
    height,
    frames: [
      {
        id: firstFrameId,
        name: 'Frame 1',
        layers: [{ id: firstLayerId, name: 'Layer 1', isVisible: true, opacity: 1 }],
      },
    ],
  },
  currentFrameId: firstFrameId,
  currentLayerId: firstLayerId,
  selectedTool: 'brush',
  brushColor: '#FFC107',
  brushSize: 5,
  isPlaying: false,
  fps: 12,
  onionSkinning: true,
});
