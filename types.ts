
export type ImageQuality = 'Standard' | 'High' | 'Ultra';

export interface AppState {
  productImage: string | null;
  bgType: 'upload' | 'text';
  bgImage: string | null;
  bgDescription: string;
  quantity: number;
  quality: ImageQuality;
  isGenerating: boolean;
  generatedImages: string[];
  error: string | null;
  progress: number;
}

export interface GenerationResult {
  imageUrl: string;
  error?: string;
}
