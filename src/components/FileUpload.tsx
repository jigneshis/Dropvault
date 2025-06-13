import React, { useCallback, useState } from 'react';
import { Upload, File, X, Lock, Clock, Zap } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = []
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    onFileSelect(validFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-neon-green bg-neon-green/10 scale-105' 
            : 'border-gray-600 hover:border-neon-green/50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`w-12 h-12 ${dragActive ? 'text-neon-green animate-pulse' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-mono">
              {dragActive ? (
                <span className="text-neon-green animate-pulse">Drop files here...</span>
              ) : (
                <>Drop files here or <span className="text-neon-green underline">browse</span></>
              )}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
        
        {dragActive && (
          <div className="absolute inset-0 bg-neon-green/5 rounded-lg animate-pulse" />
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-mono text-neon-green flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Selected Files ({selectedFiles.length})
          </h3>
          
          {selectedFiles.map((file, index) => (
            <div key={index} className="glass-card rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-neon-cyan" />
                <div>
                  <p className="font-mono text-sm truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;