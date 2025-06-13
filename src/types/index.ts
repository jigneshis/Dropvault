export interface DropFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  password?: string;
  expiresAt: Date;
  downloads: number;
  maxDownloads?: number;
  createdAt: Date;
}

export interface ShareableLink {
  id: string;
  fileId: string;
  shareUrl: string;
  qrCode: string;
  password?: string;
  expiresAt: Date;
  accessCount: number;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}