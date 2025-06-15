import React from 'react';
import { File, Check, AlertCircle, Loader } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

interface UploadProgressProps {
  files: {
    name: string;
    size: number;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
  }[];
}

const UploadProgress: React.FC<UploadProgressProps> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <div className="glass-card rounded-lg p-4 sm:p-6 space-y-4">
      <h3 className="text-base sm:text-lg font-sans text-neon-green flex items-center gap-2 font-semibold">
        <Loader className="w-5 h-5 animate-spin" />
        Upload Progress
      </h3>

      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <File className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 font-sans">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && (
                  <>
                    <span className="text-xs font-sans text-neon-cyan">{file.progress}%</span>
                    <Loader className="w-4 h-4 text-neon-cyan animate-spin" />
                  </>
                )}
                {file.status === 'complete' && (
                  <Check className="w-4 h-4 text-neon-green" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            {file.status === 'uploading' && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neon-cyan to-neon-green h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${file.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            )}

            {file.status === 'complete' && (
              <div className="w-full bg-neon-green/20 rounded-full h-2">
                <div className="bg-neon-green h-2 rounded-full w-full animate-pulse-neon" />
              </div>
            )}

            {file.status === 'error' && (
              <div className="w-full bg-red-400/20 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full w-full" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;