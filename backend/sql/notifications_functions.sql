-- =================================================================
-- FUNCTIONS PARA NOTIFICACIONES PUSH
-- =================================================================

-- Tabla para almacenar suscripciones de notificaciones push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Habilitar RLS en la tabla
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Allow user to manage their own push subscriptions" ON public.push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- Función para guardar suscripción de notificaciones push
CREATE OR REPLACE FUNCTION save_push_subscription(
  p_user_id UUID,
  p_endpoint TEXT,
  p_p256dh_key TEXT,
  p_auth_key TEXT
)
RETURNS TABLE (
  subscription_id UUID,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_subscription_id UUID;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN QUERY SELECT NULL::UUID, false, 'Usuario no encontrado';
    RETURN;
  END IF;
  
  -- Insertar o actualizar la suscripción
  INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
  VALUES (p_user_id, p_endpoint, p_p256dh_key, p_auth_key)
  ON CONFLICT (user_id, endpoint) 
  DO UPDATE SET 
    p256dh_key = EXCLUDED.p256dh_key,
    auth_key = EXCLUDED.auth_key,
    updated_at = NOW()
  RETURNING id INTO new_subscription_id;
  
  RETURN QUERY SELECT new_subscription_id, true, 'Suscripción guardada exitosamente';
END;
$$;

-- Función para obtener suscripciones de un usuario
CREATE OR REPLACE FUNCTION get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  endpoint TEXT,
  p256dh_key TEXT,
  auth_key TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id as subscription_id,
    ps.endpoint,
    ps.p256dh_key,
    ps.auth_key,
    ps.created_at
  FROM push_subscriptions ps
  WHERE ps.user_id = p_user_id
  ORDER BY ps.created_at DESC;
END;
$$;

-- Función para eliminar suscripción de notificaciones push
CREATE OR REPLACE FUNCTION delete_push_subscription(
  p_user_id UUID,
  p_endpoint TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que la suscripción existe y pertenece al usuario
  IF NOT EXISTS (SELECT 1 FROM push_subscriptions WHERE user_id = p_user_id AND endpoint = p_endpoint) THEN
    RETURN QUERY SELECT false, 'Suscripción no encontrada';
    RETURN;
  END IF;
  
  -- Eliminar la suscripción
  DELETE FROM push_subscriptions WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  RETURN QUERY SELECT true, 'Suscripción eliminada exitosamente';
END;
$$;

-- Función para obtener todas las suscripciones activas (para enviar notificaciones)
CREATE OR REPLACE FUNCTION get_all_push_subscriptions()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  endpoint TEXT,
  p256dh_key TEXT,
  auth_key TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.user_id,
    u.username,
    ps.endpoint,
    ps.p256dh_key,
    ps.auth_key
  FROM push_subscriptions ps
  JOIN users u ON ps.user_id = u.id
  ORDER BY ps.updated_at DESC;
END;
$$;

-- Función para enviar notificación de recordatorio diario
CREATE OR REPLACE FUNCTION send_daily_reminder_notification()
RETURNS TABLE (
  notifications_sent INT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_count INT;
  current_challenge_title TEXT;
BEGIN
  -- Obtener el challenge del día actual
  SELECT title INTO current_challenge_title
  FROM challenges 
  WHERE day_index = (CURRENT_DATE - '2025-09-14'::DATE) + 1
  LIMIT 1;
  
  -- Contar suscripciones activas
  SELECT COUNT(*) INTO subscription_count
  FROM push_subscriptions;
  
  -- Esta función solo registra que se envió la notificación
  -- El envío real se hace desde el frontend o un servicio externo
  RETURN QUERY
  SELECT 
    subscription_count,
    true,
    'Notificación de recordatorio programada para: ' || COALESCE(current_challenge_title, 'Challenge del día');
END;
$$;

-- Comentarios para documentación
COMMENT ON TABLE public.push_subscriptions IS 'Suscripciones de notificaciones push de los usuarios';
COMMENT ON FUNCTION save_push_subscription(UUID, TEXT, TEXT, TEXT) IS 'Guarda o actualiza una suscripción de notificaciones push';
COMMENT ON FUNCTION get_user_push_subscriptions(UUID) IS 'Obtiene las suscripciones de notificaciones push de un usuario';
COMMENT ON FUNCTION delete_push_subscription(UUID, TEXT) IS 'Elimina una suscripción de notificaciones push';
COMMENT ON FUNCTION get_all_push_subscriptions() IS 'Obtiene todas las suscripciones activas para enviar notificaciones';
COMMENT ON FUNCTION send_daily_reminder_notification() IS 'Programa el envío de notificación de recordatorio diario';
