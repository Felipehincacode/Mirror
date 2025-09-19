import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface NetworkStatusProps {
  showNotification?: boolean;
  className?: string;
}

export const NetworkStatus = ({ showNotification = true, className = '' }: NetworkStatusProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isOnline ? (
          <Wifi size={16} className="text-green-500" />
        ) : (
          <WifiOff size={16} className="text-red-500" />
        )}
        <span className="text-sm text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Status indicator in corner - only show when offline */}
      {!isOnline && (
        <div className={`fixed top-4 right-4 z-50 ${className}`}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <WifiOff size={14} />
            <span>Offline</span>
          </div>
        </div>
      )}

    </>
  );
};

// Hook for programmatic network status checking
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch(window.location.origin + '/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  return {
    isOnline,
    checkConnection
  };
};