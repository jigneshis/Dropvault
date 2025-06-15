import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import { StorageService } from '../utils/storage';
import { formatFileSize } from '../utils/helpers';

const StatsDisplay: React.FC = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    filesToday: 0,
    avgFileSize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await StorageService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-600 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-sans text-neon-green flex items-center gap-2 mb-4 font-semibold">
        <BarChart3 className="w-5 h-5" />
        Live Stats
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-neon-cyan">{stats.totalFiles}</div>
          <div className="text-xs text-gray-400 font-sans flex items-center justify-center gap-1">
            <FileText className="w-3 h-3" />
            Total Files
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-neon-pink">{stats.totalDownloads}</div>
          <div className="text-xs text-gray-400 font-sans flex items-center justify-center gap-1">
            <Download className="w-3 h-3" />
            Downloads
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-neon-green">{stats.filesToday}</div>
          <div className="text-xs text-gray-400 font-sans flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Today
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-white">{formatFileSize(stats.avgFileSize)}</div>
          <div className="text-xs text-gray-400 font-sans">
            Avg Size
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;