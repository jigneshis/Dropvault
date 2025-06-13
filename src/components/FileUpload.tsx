import React, { useCallback, useState } from 'react';
import { Upload, File, X, Lock, Clock, Zap, AlertTriangle } from 'lucide-react';
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
  const [errors, setErrors] = useState<string[]>([]);

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
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return;
      }

      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        newErrors.push(`${file.name} has an unsupported file type`);
        return;
      }

      // Check for duplicates
      if (selectedFiles.some(existing => existing.name === file.name && existing.size === file.size)) {
        newErrors.push(`${file.name} is already selected`);
        return;
      }

      validFiles.push(file);
    });

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setErrors([]);
    onFileSelect([]);
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

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
          accept={acceptedTypes.join(',')}
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
                <>Drop files here or <span className="text-neon-green underline cursor-pointer">browse</span></>
              )}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
            {acceptedTypes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted types: {acceptedTypes.join(', ')}
              </p>
            )}
          </div>
        </div>
        
        {dragActive && (
          <div className="absolute inset-0 bg-neon-green/5 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-neon-green flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-400">
                Total: {formatFileSize(totalSize)}
              </span>
              <button
                onClick={clearAll}
                className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="glass-card rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type || 'Unknown type'}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;