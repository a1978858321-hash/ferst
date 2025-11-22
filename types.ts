export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ImageAsset {
  id: string;
  dataUrl: string; // Base64
  mimeType: string;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface EditSession {
  id: string;
  original: ImageAsset;
  result: ImageAsset | null;
  status: ProcessingStatus;
  error?: string;
}
