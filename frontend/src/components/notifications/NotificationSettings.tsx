import { useState } from 'react';
import { Bell, BellOff, TestTube, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotificationSettingsProps {
  onTestNotification: () => Promise<boolean>;
  onUnsubscribe: () => Promise<void>;
}

export const NotificationSettings = ({
  onTestNotification,
  onUnsubscribe
}: NotificationSettingsProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await onTestNotification();
    } finally {
      setIsTesting(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar las notificaciones?')) {
      return;
    }

    setIsUnsubscribing(true);
    try {
      await onUnsubscribe();
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center space-x-3 p-3 bg-surface-container rounded-lg">
        <Bell className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Notificaciones activas</p>
          <p className="text-xs text-muted-foreground">
            Recibirás recordatorios diarios de tus retos
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Preferencias</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminders" className="text-sm">
              Recordatorios diarios
            </Label>
            <Switch
              id="daily-reminders"
              checked={dailyReminders}
              onCheckedChange={setDailyReminders}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="achievements" className="text-sm">
              Notificaciones de logros
            </Label>
            <Switch
              id="achievements"
              checked={achievementNotifications}
              onCheckedChange={setAchievementNotifications}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Acciones</h4>

        <Button
          variant="outline"
          onClick={handleTestNotification}
          disabled={isTesting}
          className="w-full justify-start"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          {isTesting ? 'Enviando...' : 'Probar notificación'}
        </Button>

        <Button
          variant="destructive"
          onClick={handleUnsubscribe}
          disabled={isUnsubscribing}
          className="w-full justify-start"
        >
          {isUnsubscribing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BellOff className="h-4 w-4 mr-2" />
          )}
          {isUnsubscribing ? 'Desactivando...' : 'Desactivar notificaciones'}
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Los recordatorios se envían diariamente a las 9:00 AM</p>
        <p>• Puedes cambiar estas preferencias en cualquier momento</p>
        <p>• Las notificaciones incluyen acciones para ir directamente al reto</p>
      </div>
    </div>
  );
};