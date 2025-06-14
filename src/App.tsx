import React, { useState } from 'react';
import { Shield, Zap, Upload as UploadIcon, Github, MessageCircle } from 'lucide-react';
import MatrixRain from './components/MatrixRain';
import GlitchText from './components/GlitchText';
import FileUpload from './components/FileUpload';
import SecurityOptions from './components/SecurityOptions';
import UploadProgress from './components/UploadProgress';
import ShareResult from './components/ShareResult';
import StatsDisplay from './components/StatsDisplay';
import DownloadPage from './components/DownloadPage';
import { StorageService } from './utils/storage';

interface SecuritySettings {
  password?: string;
  expiresIn: number;
  maxDownloads?: number;
}

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

interface CompletedUpload {
  fileId: string;
  fileName: string;
  expiresAt: Date;
  hasPassword: boolean;
  maxDownloads?: number;
}

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    expiresIn: 24
  });
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [completedUploads, setCompletedUploads] = useState<CompletedUpload[]>([]);

  // Check if we're on a download page
  const path = window.location.pathname;
  const downloadMatch = path.match(/^\/download\/(.+)$/);
  
  if (downloadMatch) {
    return <DownloadPage fileId={downloadMatch[1]} />;
  }

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleSecurityOptionsChange = (options: SecuritySettings) => {
    setSecuritySettings(options);
  };

  const uploadFile = async (file: File, settings: SecuritySettings): Promise<CompletedUpload> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(async () => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadFiles(prev => prev.map(f => 
            f.name === file.name 
              ? { ...f, progress: 100, status: 'complete' as const }
              : f
          ));
          
          try {
            // Actually upload to Supabase
            const result = await StorageService.uploadFile(
              file,
              settings.password,
              settings.expiresIn,
              settings.maxDownloads
            );
            resolve(result);
          } catch (error) {
            setUploadFiles(prev => prev.map(f => 
              f.name === file.name 
                ? { ...f, status: 'error' as const }
                : f
            ));
            reject(error);
          }
        } else {
          setUploadFiles(prev => prev.map(f => 
            f.name === file.name 
              ? { ...f, progress: Math.round(progress) }
              : f
          ));
        }
      }, 200 + Math.random() * 300);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    // Initialize upload progress
    const initialFiles: UploadFile[] = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }));
    setUploadFiles(initialFiles);

    // Upload files
    const uploadPromises = selectedFiles.map(file => uploadFile(file, securitySettings));

    try {
      const results = await Promise.all(uploadPromises);
      setCompletedUploads(results);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNewUpload = () => {
    setSelectedFiles([]);
    setUploadFiles([]);
    setCompletedUploads([]);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-dark-bg/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-dark-bg" />
                </div>
                <div>
                  <GlitchText text="DropVault" className="text-2xl font-bold" />
                  <p className="text-sm text-gray-400 font-mono">Secure • Anonymous • Self-Destructing</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <a
                  href="https://chat.turri.in.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-neon text-dark-bg rounded-lg font-mono text-sm font-semibold hover:scale-105 transition-all duration-200 flex items-center gap-2 neon-border"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with AI!
                </a>
                
                <a
                  href="https://github.com/jigneshis/DropVault"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-neon-green transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {completedUploads.length === 0 ? (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <GlitchText 
                  text="Share Files Like a Ghost" 
                  className="text-4xl sm:text-5xl font-bold mb-4"
                />
                <p className="text-xl text-gray-300 font-mono max-w-2xl mx-auto">
                  Upload, secure, and share files that vanish without a trace. 
                  Password protection and self-destruct timers included.
                </p>
              </div>

              {/* Stats Display */}
              <StatsDisplay />

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card rounded-lg p-6 text-center">
                  <Shield className="w-8 h-8 text-neon-green mx-auto mb-3" />
                  <h3 className="font-mono text-lg mb-2">Password Protected</h3>
                  <p className="text-sm text-gray-400">Secure your files with optional password encryption</p>
                </div>
                
                <div className="glass-card rounded-lg p-6 text-center">
                  <Zap className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
                  <h3 className="font-mono text-lg mb-2">Self-Destruct</h3>
                  <p className="text-sm text-gray-400">Files automatically delete after specified time</p>
                </div>
                
                <div className="glass-card rounded-lg p-6 text-center">
                  <UploadIcon className="w-8 h-8 text-neon-pink mx-auto mb-3" />
                  <h3 className="font-mono text-lg mb-2">Anonymous Sharing</h3>
                  <p className="text-sm text-gray-400">No accounts required, share instantly via QR codes</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-mono text-neon-green">1. Select Files</h2>
                  <FileUpload onFileSelect={handleFileSelect} />
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-mono text-neon-green">2. Security Settings</h2>
                  <SecurityOptions onOptionsChange={handleSecurityOptionsChange} />
                </div>
              </div>

              {/* Upload Button */}
              {selectedFiles.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`
                      px-8 py-4 rounded-lg font-mono text-lg font-semibold transition-all duration-300 flex items-center gap-3
                      ${uploading 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-neon text-dark-bg hover:scale-105 hover:shadow-2xl neon-border'
                      }
                    `}
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Secure & Share ({selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''})
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              <UploadProgress files={uploadFiles} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upload Results */}
              {completedUploads.map((upload, index) => (
                <ShareResult
                  key={index}
                  fileId={upload.fileId}
                  fileName={upload.fileName}
                  expiresAt={upload.expiresAt}
                  hasPassword={upload.hasPassword}
                  maxDownloads={upload.maxDownloads}
                />
              ))}

              {/* New Upload Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleNewUpload}
                  className="px-6 py-3 bg-dark-card border border-neon-green text-neon-green rounded-lg font-mono hover:bg-neon-green/10 transition-all duration-200 flex items-center gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload More Files
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-dark-bg/90 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm">
                Built with ❤️ for privacy and security • No logs • No tracking • No BS
              </p>
              <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500 font-mono">
                <span>Files stored temporarily</span>
                <span>•</span>
                <span>Auto-deletion guaranteed</span>
                <span>•</span>
                <span>Zero-knowledge encryption</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;