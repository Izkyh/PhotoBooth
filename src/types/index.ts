export interface Photo {
  id: number;
  dataUrl: string;
  timestamp: number;
}

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'cool' | 'warm' | 'vintage';

export type LayoutType = 'single' | 'vertical-4' | 'horizontal-2x2' | 'grid-2x3';

export type FrameColor = 'white' | 'black' | 'pink' | 'green' | 'blue' | 'yellow' | 'purple' | 'maroon' | 'burgundy' | 'custom';

export interface AppState {
  photos: Photo[];
  currentFilter: FilterType;
  currentLayout: LayoutType;
  isCapturing: boolean;
  countdown: number;
  frameColor: FrameColor;
  customFrameColor: string;
}

export interface Frame {
  id: number;
  name: string;
  online: number;
  locations: number;
}
