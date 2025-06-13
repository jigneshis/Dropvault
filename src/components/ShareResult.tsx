import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Download, Clock, Shield, Eye, ExternalLink } from 'lucide-react';
import { generateQRCode } from '../utils/qrcode';
import { copyToClipboard, formatTimeRemaining, generateShareUrl } from '../utils/helpers';
import GlitchText from './GlitchText';

interface ShareResultProps {
  fileId: string;
  fileName: string;
  expiresAt: Date;
  hasPassword: boolean;
  maxDownloads?: number;
}

const ShareResult: React.FC<ShareResultProps> = ({
  fileId,
  fileName,
  expiresAt,
  hasPassword,
  maxDownloads
}) => {
  const [qrCode, setQRCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl(fileId);

  useEffect(() => {
    generateQRCode(shareUrl).then(setQRCode);
  }, [shareUrl]);

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="glass-card rounded-lg p-6 space-y-6">
      <div className="text-center">
        <GlitchText 
          text="🎯 UPLOAD COMPLETE" 
          className="text-2xl font-bold mb-2"
        />
        <p className="text-gray-400 font-mono">File secured and ready to share</p>
      </div>

      {/* File Info */}
      <div className="bg-dark-card rounded-lg p-4 space-y-2">
        <h4 className="font-mono text-neon-green text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          FILE DETAILS
        </h4>
        <div className="space-y-1 text-sm font-mono">
          <p><span className="text-gray-400">Name:</span> <span className="text-white">{fileName}</span></p>
          <p><span className="text-gray-400">Expires:</span> <span className="text-neon-cyan">{formatTimeRemaining(expiresAt)}</span></p>
          {hasPassword && (
            <p className="text-neon-green flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Password protected
            </p>
          )}
          {maxDownloads && (
            <p><span className="text-gray-400">Max downloads:</span> <span className="text-neon-pink">{maxDownloads}</span></p>
          )}
        </div>
      </div>

      {/* Share URL */}
      <div className="space-y-3">
        <h4 className="font-mono text-neon-green text-sm">SHARE LINK</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-dark-card border border-gray-600 rounded-lg px-4 py-3 font-mono text-sm text-gray-300 focus:border-neon-green focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`
              px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200 flex items-center gap-2
              ${copied 
                ? 'bg-neon-green/20 text-neon-green border border-neon-green' 
                : 'bg-dark-card border border-gray-600 text-gray-300 hover:border-neon-green hover:text-neon-green'
              }
            `}
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleOpenLink}
            className="px-4 py-3 rounded-lg font-mono text-sm bg-dark-card border border-gray-600 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan transition-all duration-200 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </button>
        </div>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className="text-center space-y-3">
          <h4 className="font-mono text-neon-green text-sm flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            QR CODE
          </h4>
          <div className="inline-block p-4 bg-white rounded-lg">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="text-xs text-gray-400 font-mono">Scan to download on mobile</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-neon-green mt-0.5" />
          <div className="text-sm font-mono">
            <p className="text-neon-green mb-1">SECURITY NOTICE</p>
            <p className="text-gray-300">
              This file will self-destruct after the specified time period. 
              Share this link securely and ensure recipients download before expiration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareResult;