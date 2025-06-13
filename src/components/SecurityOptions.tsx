import React, { useState } from 'react';
import { Lock, Clock, Download, Eye, EyeOff } from 'lucide-react';

interface SecurityOptionsProps {
  onOptionsChange: (options: {
    password?: string;
    expiresIn: number;
    maxDownloads?: number;
  }) => void;
}

const SecurityOptions: React.FC<SecurityOptionsProps> = ({ onOptionsChange }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>();
  const [enableDownloadLimit, setEnableDownloadLimit] = useState(false);

  const handleOptionsUpdate = () => {
    onOptionsChange({
      password: password || undefined,
      expiresIn,
      maxDownloads: enableDownloadLimit ? maxDownloads : undefined,
    });
  };

  React.useEffect(() => {
    handleOptionsUpdate();
  }, [password, expiresIn, maxDownloads, enableDownloadLimit]);

  const expiryOptions = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 24, label: '1 Day' },
    { value: 72, label: '3 Days' },
    { value: 168, label: '1 Week' },
  ];

  return (
    <div className="glass-card rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-mono text-neon-green flex items-center gap-2">
        <Lock className="w-5 h-5" />
        Security Settings
      </h3>

      {/* Password Protection */}
      <div className="space-y-3">
        <label className="block text-sm font-mono text-gray-300">
          Password Protection (Optional)
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-dark-card border border-gray-600 rounded-lg px-4 py-3 pr-12 font-mono text-sm focus:border-neon-green focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-neon-green transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <p className="text-xs text-neon-green font-mono">🔒 Password protection enabled</p>
        )}
      </div>

      {/* Expiry Time */}
      <div className="space-y-3">
        <label className="block text-sm font-mono text-gray-300 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Auto-Destruct Timer
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {expiryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setExpiresIn(option.value)}
              className={`
                p-3 rounded-lg font-mono text-sm transition-all duration-200
                ${expiresIn === option.value
                  ? 'bg-neon-green/20 border-neon-green text-neon-green neon-border'
                  : 'bg-dark-card border border-gray-600 text-gray-300 hover:border-neon-green/50'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Download Limit */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="downloadLimit"
            checked={enableDownloadLimit}
            onChange={(e) => setEnableDownloadLimit(e.target.checked)}
            className="w-4 h-4 text-neon-green bg-dark-card border-gray-600 rounded focus:ring-neon-green"
          />
          <label htmlFor="downloadLimit" className="text-sm font-mono text-gray-300 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Limit Downloads
          </label>
        </div>
        
        {enableDownloadLimit && (
          <input
            type="number"
            min="1"
            max="100"
            value={maxDownloads || 1}
            onChange={(e) => setMaxDownloads(parseInt(e.target.value))}
            placeholder="Max downloads"
            className="w-full bg-dark-card border border-gray-600 rounded-lg px-4 py-3 font-mono text-sm focus:border-neon-green focus:outline-none transition-colors"
          />
        )}
      </div>
    </div>
  );
};

export default SecurityOptions;