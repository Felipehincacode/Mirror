import { useState } from 'react';
import { Bell, BellOff, Settings, Check, X, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NotificationSettings } from './NotificationSettings';

export const NotificationManager = () => {
  const {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Don't render if not supported
  if (!isSupported) return null;

  const handleBellClick = async () => {
    console.log('[DEBUG] handleBellClick called, current permission:', permission, 'isSubscribed:', isSubscribed);

    if (permission === 'denied') {
      // Show instructions for enabling notifications
      console.log('[DEBUG] Permission denied, showing permission dialog');
      setShowPermissionDialog(true);
      return;
    }

    if (permission === 'default') {
      // Request permission
      console.log('[DEBUG] Permission default, requesting permission');
      const success = await requestPermission();
      if (!success) {
        console.log('[DEBUG] Permission request failed, showing dialog');
        setShowPermissionDialog(true);
      } else {
        console.log('[DEBUG] Permission request successful');
      }
      return;
    }

    if (permission === 'granted' && !isSubscribed) {
      // Subscribe
      console.log('[DEBUG] Permission granted but not subscribed, subscribing...');
      await subscribe();
      return;
    }

    if (isSubscribed) {
      // Show settings
      console.log('[DEBUG] Already subscribed, showing settings');
      setShowSettings(true);
    }
  };

  const getBellIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground group-hover:text-foreground transition-colors" />;

    if (permission === 'denied') return <BellOff className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />;
    if (permission === 'granted' && isSubscribed) return <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />;
    if (permission === 'granted' && !isSubscribed) return <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />;

    return <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />;
  };

  const getStatusText = () => {
    if (permission === 'denied') return 'Notificaciones bloqueadas';
    if (permission === 'default') return 'Habilitar notificaciones';
    if (permission === 'granted' && !isSubscribed) return 'Suscribirse';
    if (isSubscribed) return 'Notificaciones activas';

    return 'Notificaciones';
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors group relative"
        title={getStatusText()}
        aria-label="Notifications"
      >
        {getBellIcon()}
        {isSubscribed && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border border-surface-container" />
        )}
      </button>

      {/* Permission Instructions Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Habilitar Notificaciones</DialogTitle>
            <DialogDescription>
              Para recibir recordatorios de tus retos fotográficos, necesitas habilitar las notificaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Cómo habilitar notificaciones en móvil:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre la configuración del navegador</li>
                <li>Busca "Sitios web" o "Permisos del sitio"</li>
                <li>Encuentra este sitio web en la lista</li>
                <li>Habilita las notificaciones para este sitio</li>
                <li>Vuelve a la app y recarga la página</li>
              </ol>
              <p className="mt-3 text-xs">
                <strong>Nota:</strong> Si las notificaciones fueron bloqueadas anteriormente,
                es posible que necesites restablecer los permisos del sitio o usar el botón "Restablecer permisos" si está disponible.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPermissionDialog(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowPermissionDialog(false);
                  // Try to request permission again after dialog closes
                  setTimeout(() => {
                    if (Notification.permission === 'default') {
                      Notification.requestPermission().then(permission => {
                        console.log('[DEBUG] Re-requested permission result:', permission);
                        if (permission === 'granted') {
                          window.location.reload();
                        }
                      });
                    } else {
                      window.location.reload();
                    }
                  }, 500);
                }}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuración de Notificaciones
            </DialogTitle>
          </DialogHeader>

          <NotificationSettings
            onTestNotification={sendTestNotification}
            onUnsubscribe={async () => {
              const success = await unsubscribe();
              if (success) {
                setShowSettings(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};