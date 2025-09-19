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
  const [showAlert, setShowAlert] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowAlert(true);
        setWasOffline(false);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setShowAlert(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  const handleRetryConnection = () => {
    // Try to make a small request to test connectivity
    fetch(window.location.origin + '/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    })
      .then(() => {
        setIsOnline(true);
        setShowAlert(false);
      })
      .catch(() => {
        // Still offline
      });
  };

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
      {/* Status indicator in corner */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
          isOnline
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isOnline ? (
            <Wifi size={14} />
          ) : (
            <WifiOff size={14} />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Connection status alert */}
      {showAlert && (
        <div className="fixed top-16 right-4 z-50 max-w-sm">
          <Alert className={`${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="flex-1">
                {isOnline ? (
                  <span className="text-green-800">
                    Connection restored! Your photos will sync automatically.
                  </span>
                ) : (
                  <span className="text-red-800">
                    You're offline. Photos will be saved locally and synced when connection returns.
                  </span>
                )}
              </AlertDescription>
              {!isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryConnection}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  Retry
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="ml-1 h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </Alert>
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