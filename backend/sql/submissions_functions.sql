-- =================================================================
-- FUNCTIONS PARA SUBMISSIONS (SUBIENDO FOTOS)
-- =================================================================

-- Función para crear una nueva submission
CREATE OR REPLACE FUNCTION create_submission(
  p_user_id UUID,
  p_challenge_id INT,
  p_photo_url TEXT,
  p_title TEXT,
  p_note TEXT DEFAULT NULL,
  p_location_lat DOUBLE PRECISION DEFAULT NULL,
  p_location_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  submission_id UUID,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_submission_id UUID;
  location_point GEOGRAPHY;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN QUERY SELECT NULL::UUID, false, 'Usuario no encontrado';
    RETURN;
  END IF;
  
  -- Verificar que el challenge existe
  IF NOT EXISTS (SELECT 1 FROM challenges WHERE id = p_challenge_id) THEN
    RETURN QUERY SELECT NULL::UUID, false, 'Challenge no encontrado';
    RETURN;
  END IF;
  
  -- Verificar que el usuario no haya subido ya una foto para este challenge
  IF EXISTS (SELECT 1 FROM submissions WHERE user_id = p_user_id AND challenge_id = p_challenge_id) THEN
    RETURN QUERY SELECT NULL::UUID, false, 'Ya existe una submission para este challenge';
    RETURN;
  END IF;
  
  -- Crear el punto de ubicación si se proporcionan coordenadas
  IF p_location_lat IS NOT NULL AND p_location_lng IS NOT NULL THEN
    location_point := ST_SetSRID(ST_MakePoint(p_location_lng, p_location_lat), 4326)::GEOGRAPHY;
  END IF;
  
  -- Insertar la nueva submission
  INSERT INTO submissions (
    user_id,
    challenge_id,
    photo_url,
    title,
    note,
    location
  ) VALUES (
    p_user_id,
    p_challenge_id,
    p_photo_url,
    p_title,
    p_note,
    location_point
  ) RETURNING id INTO new_submission_id;
  
  RETURN QUERY SELECT new_submission_id, true, 'Submission creada exitosamente';
END;
$$;

-- Función para actualizar una submission existente
CREATE OR REPLACE FUNCTION update_submission(
  p_submission_id UUID,
  p_user_id UUID,
  p_photo_url TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL,
  p_location_lat DOUBLE PRECISION DEFAULT NULL,
  p_location_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  location_point GEOGRAPHY;
BEGIN
  -- Verificar que la submission existe y pertenece al usuario
  IF NOT EXISTS (SELECT 1 FROM submissions WHERE id = p_submission_id AND user_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'Submission no encontrada o no tienes permisos';
    RETURN;
  END IF;
  
  -- Crear el punto de ubicación si se proporcionan coordenadas
  IF p_location_lat IS NOT NULL AND p_location_lng IS NOT NULL THEN
    location_point := ST_SetSRID(ST_MakePoint(p_location_lng, p_location_lat), 4326)::GEOGRAPHY;
  END IF;
  
  -- Actualizar la submission
  UPDATE submissions SET
    photo_url = COALESCE(p_photo_url, photo_url),
    title = COALESCE(p_title, title),
    note = COALESCE(p_note, note),
    location = COALESCE(location_point, location)
  WHERE id = p_submission_id AND user_id = p_user_id;
  
  RETURN QUERY SELECT true, 'Submission actualizada exitosamente';
END;
$$;

-- Función para eliminar una submission
CREATE OR REPLACE FUNCTION delete_submission(
  p_submission_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que la submission existe y pertenece al usuario
  IF NOT EXISTS (SELECT 1 FROM submissions WHERE id = p_submission_id AND user_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'Submission no encontrada o no tienes permisos';
    RETURN;
  END IF;
  
  -- Eliminar la submission
  DELETE FROM submissions WHERE id = p_submission_id AND user_id = p_user_id;
  
  RETURN QUERY SELECT true, 'Submission eliminada exitosamente';
END;
$$;

-- Función para obtener submissions de un usuario
CREATE OR REPLACE FUNCTION get_user_submissions(p_user_id UUID)
RETURNS TABLE (
  submission_id UUID,
  challenge_id INT,
  day_index INT,
  challenge_title TEXT,
  challenge_description TEXT,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    s.challenge_id,
    c.day_index,
    c.title as challenge_title,
    c.description as challenge_description,
    s.photo_url,
    s.title,
    s.note,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng,
    s.created_at,
    s.created_at as updated_at -- Supabase no tiene updated_at por defecto
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
  ORDER BY c.day_index DESC, s.created_at DESC;
END;
$$;

-- Función para obtener submissions por challenge
CREATE OR REPLACE FUNCTION get_challenge_submissions(p_challenge_id INT)
RETURNS TABLE (
  submission_id UUID,
  user_id UUID,
  username TEXT,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    s.user_id,
    u.username,
    s.photo_url,
    s.title,
    s.note,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng,
    s.created_at
  FROM submissions s
  JOIN users u ON s.user_id = u.id
  WHERE s.challenge_id = p_challenge_id
  ORDER BY s.created_at ASC;
END;
$$;

-- Comentarios para documentación
COMMENT ON FUNCTION create_submission(UUID, INT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION) IS 'Crea una nueva submission (foto) para un challenge';
COMMENT ON FUNCTION update_submission(UUID, UUID, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION) IS 'Actualiza una submission existente';
COMMENT ON FUNCTION delete_submission(UUID, UUID) IS 'Elimina una submission';
COMMENT ON FUNCTION get_user_submissions(UUID) IS 'Obtiene todas las submissions de un usuario';
COMMENT ON FUNCTION get_challenge_submissions(INT) IS 'Obtiene todas las submissions de un challenge específico';
