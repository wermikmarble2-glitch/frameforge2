export type Tool = 'brush' | 'eraser';

export interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  opacity: number;
}

export interface Frame {
  id: string;
  name: string;
  layers: Layer[];
}

export interface Animation {
  id: string;
  name: string;
  width: number;
  height: number;
  frames: Frame[];
}

export interface Anim8State {
  animation: Animation;
  currentFrameId: string;
  currentLayerId: string;
  selectedTool: Tool;
  brushColor: string;
  brushSize: number;
  isPlaying: boolean;
  fps: number;
  onionSkinning: boolean;
}

export type Action =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_BRUSH_COLOR'; color: string }
  | { type: 'SET_BRUSH_SIZE'; size: number }
  | { type: 'ADD_FRAME'; afterFrameId: string }
  | { type: 'DUPLICATE_FRAME'; frameId: string }
  | { type: 'DELETE_FRAME'; frameId: string }
  | { type: 'SET_CURRENT_FRAME'; frameId: string }
  | { type: 'ADD_LAYER'; afterLayerId: string }
  | { type: 'DELETE_LAYER'; layerId: string }
  | { type: 'SET_CURRENT_LAYER'; layerId: string }
  | { type: 'SET_LAYER_VISIBILITY'; layerId: string; isVisible: boolean }
  | { type: 'RENAME_LAYER'; layerId: string; name: string }
  | { type: 'REORDER_LAYER'; dragId: string; dropId: string }
  | { type: 'TOGGLE_PLAYING' }
  | { type: 'SET_FPS', fps: number }
  | { type: 'SET_ONION_SKINNING', enabled: boolean }
  | { type: 'ADD_INBETWEENS', frameId: string, count: number }
  | { type: 'LOAD_ANIMATION', state: Anim8State };
