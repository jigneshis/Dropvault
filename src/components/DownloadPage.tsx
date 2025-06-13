import React, { useState, useEffect } from 'react';
import { Download, Lock, AlertCircle, Shield, Clock, Eye, EyeOff } from 'lucide-react';
import { StorageService } from '../utils/storage';
import { formatFileSize, formatTimeRemaining } from '../utils/helpers';
import GlitchText from './GlitchText';

interface DownloadPageProps {
  fileId: string;
}

const DownloadPage: React.FC<DownloadPageProps> = ({ fileId }) => {
  const [file, setFile] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const result = await StorageService.getFile(fileId);
        if (result) {
          setFile(result.file);
        } else {
          setError('File not found or has expired');
        }
      } catch (err: any) {
        if (err.message === 'Password required') {
          // File exists but needs password
          setError('password_required');
        } else {
          setError(err.message || 'Failed to load file');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  const handleDownload = async () => {
    if (!file && error !== 'password_required') return;
    
    setDownloading(true);
    setError('');

    try {
      const result = await StorageService.getFile(fileId, password);
      if (result) {
        // Increment download counter
        await StorageService.incrementDownload(fileId);
        
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setFile(result.file);
      }
    } catch (err: any) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-neon-green">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error && error !== 'password_required') {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="glass-card rounded-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <GlitchText text="ACCESS DENIED" className="text-2xl font-bold mb-4" />
          <p className="text-gray-300 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-4">
      <div className="glass-card rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-neon-green mx-auto mb-4" />
          <GlitchText text="SECURE DOWNLOAD" className="text-2xl font-bold mb-2" />
          <p className="text-gray-400 font-mono">File ready for download</p>
        </div>

        {file && (
          <div className="bg-dark-card rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono text-sm">Name:</span>
              <span className="text-white font-mono text-sm truncate ml-2">{file.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono text-sm">Size:</span>
              <span className="text-neon-cyan font-mono text-sm">{formatFileSize(file.file_size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono text-sm">Expires:</span>
              <span className="text-neon-pink font-mono text-sm">{formatTimeRemaining(new Date(file.expires_at))}</span>
            </div>
            {file.max_downloads && (
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono text-sm">Downloads:</span>
                <span className="text-yellow-400 font-mono text-sm">
                  {file.current_downloads}/{file.max_downloads}
                </span>
              </div>
            )}
          </div>
        )}

        {(error === 'password_required' || file?.password_hash) && (
          <div className="mb-6">
            <label className="block text-sm font-mono text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password Required
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-dark-card border border-gray-600 rounded-lg px-4 py-3 pr-12 font-mono text-sm focus:border-neon-green focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-neon-green transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {error && error !== 'password_required' && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading || (file?.password_hash && !password)}
          className={`
            w-full py-4 rounded-lg font-mono text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3
            ${downloading || (file?.password_hash && !password)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-neon text-dark-bg hover:scale-105 hover:shadow-2xl neon-border'
            }
          `}
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download File
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 font-mono">
            This file will self-destruct after download or expiration
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;