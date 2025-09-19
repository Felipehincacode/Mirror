-- =================================================================
-- API FUNCTIONS PARA EL DIARIO FOTOGRÁFICO
-- =================================================================

-- Función para obtener el challenge del día actual
-- Calcula qué día del viaje es basado en la fecha de inicio
CREATE OR REPLACE FUNCTION get_current_challenge(start_date DATE DEFAULT '2025-09-14')
RETURNS TABLE (
  id INT,
  day_index INT,
  title TEXT,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_day INT;
BEGIN
  -- Calcular el día actual del viaje
  current_day := (CURRENT_DATE - start_date) + 1;
  
  -- Si el día es mayor a 90, devolver el último challenge
  IF current_day > 90 THEN
    current_day := 90;
  END IF;
  
  -- Si el día es menor a 1, devolver el primer challenge
  IF current_day < 1 THEN
    current_day := 1;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.day_index,
    c.title,
    c.description,
    c.tag,
    c.created_at
  FROM challenges c
  WHERE c.day_index = current_day;
END;
$$;

-- Función para obtener un challenge específico por día
CREATE OR REPLACE FUNCTION get_challenge_by_day(day_number INT)
RETURNS TABLE (
  id INT,
  day_index INT,
  title TEXT,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.day_index,
    c.title,
    c.description,
    c.tag,
    c.created_at
  FROM challenges c
  WHERE c.day_index = day_number;
END;
$$;

-- Función para obtener challenges en un rango de días
CREATE OR REPLACE FUNCTION get_challenges_range(start_day INT, end_day INT)
RETURNS TABLE (
  id INT,
  day_index INT,
  title TEXT,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.day_index,
    c.title,
    c.description,
    c.tag,
    c.created_at
  FROM challenges c
  WHERE c.day_index BETWEEN start_day AND end_day
  ORDER BY c.day_index;
END;
$$;

-- Función para obtener todos los challenges
CREATE OR REPLACE FUNCTION get_all_challenges()
RETURNS TABLE (
  id INT,
  day_index INT,
  title TEXT,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.day_index,
    c.title,
    c.description,
    c.tag,
    c.created_at
  FROM challenges c
  ORDER BY c.day_index;
END;
$$;

-- Función para obtener el progreso del usuario
CREATE OR REPLACE FUNCTION get_user_progress(user_uuid UUID)
RETURNS TABLE (
  total_challenges INT,
  completed_challenges INT,
  current_day INT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INT;
  completed_count INT;
  current_day_num INT;
BEGIN
  -- Contar total de challenges
  SELECT COUNT(*) INTO total_count FROM challenges;
  
  -- Contar challenges completados por el usuario
  SELECT COUNT(*) INTO completed_count 
  FROM submissions s 
  WHERE s.user_id = user_uuid;
  
  -- Calcular día actual (basado en fecha de inicio)
  current_day_num := (CURRENT_DATE - '2025-09-14'::DATE) + 1;
  
  -- Calcular porcentaje de completación
  RETURN QUERY
  SELECT 
    total_count,
    completed_count,
    current_day_num,
    CASE 
      WHEN total_count > 0 THEN ROUND((completed_count::NUMERIC / total_count::NUMERIC) * 100, 2)
      ELSE 0
    END;
END;
$$;

-- =================================================================
-- FUNCTIONS PARA LAS VISTAS DEL FRONTEND
-- =================================================================

-- Función para la GALERÍA - Modo Manuela (solo sus fotos)
CREATE OR REPLACE FUNCTION get_gallery_manuela(p_user_id UUID)
RETURNS TABLE (
  submission_id UUID,
  day_index INT,
  challenge_title TEXT,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    c.day_index,
    c.title as challenge_title,
    s.photo_url,
    s.title,
    s.note,
    s.created_at,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
  ORDER BY c.day_index DESC, s.created_at DESC;
END;
$$;

-- Función para la GALERÍA - Modo Felipe (solo sus fotos)
CREATE OR REPLACE FUNCTION get_gallery_felipe(p_user_id UUID)
RETURNS TABLE (
  submission_id UUID,
  day_index INT,
  challenge_title TEXT,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    c.day_index,
    c.title as challenge_title,
    s.photo_url,
    s.title,
    s.note,
    s.created_at,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
  ORDER BY c.day_index DESC, s.created_at DESC;
END;
$$;

-- Función para la GALERÍA - Modo Mirror (intercaladas por día)
CREATE OR REPLACE FUNCTION get_gallery_mirror()
RETURNS TABLE (
  submission_id UUID,
  day_index INT,
  challenge_title TEXT,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  user_id UUID,
  username TEXT,
  created_at TIMESTAMPTZ,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    c.day_index,
    c.title as challenge_title,
    s.photo_url,
    s.title,
    s.note,
    s.user_id,
    u.username,
    s.created_at,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  JOIN users u ON s.user_id = u.id
  ORDER BY c.day_index DESC, s.created_at ASC;
END;
$$;

-- Función para el MAPA - Fotos con ubicación de un usuario
CREATE OR REPLACE FUNCTION get_map_photos(p_user_id UUID)
RETURNS TABLE (
  submission_id UUID,
  day_index INT,
  challenge_title TEXT,
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
    c.day_index,
    c.title as challenge_title,
    s.photo_url,
    s.title,
    s.note,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng,
    s.created_at
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id 
    AND s.location IS NOT NULL
  ORDER BY s.created_at DESC;
END;
$$;

-- Función para el CALENDARIO - Ambas fotos por día
CREATE OR REPLACE FUNCTION get_calendar_data(start_date DATE DEFAULT '2025-09-14')
RETURNS TABLE (
  day_index INT,
  challenge_title TEXT,
  challenge_description TEXT,
  challenge_tag TEXT,
  manuela_photo_url TEXT,
  manuela_title TEXT,
  manuela_note TEXT,
  manuela_created_at TIMESTAMPTZ,
  felipe_photo_url TEXT,
  felipe_title TEXT,
  felipe_note TEXT,
  felipe_created_at TIMESTAMPTZ,
  has_manuela BOOLEAN,
  has_felipe BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.day_index,
    c.title as challenge_title,
    c.description as challenge_description,
    c.tag as challenge_tag,
    m.photo_url as manuela_photo_url,
    m.title as manuela_title,
    m.note as manuela_note,
    m.created_at as manuela_created_at,
    f.photo_url as felipe_photo_url,
    f.title as felipe_title,
    f.note as felipe_note,
    f.created_at as felipe_created_at,
    (m.id IS NOT NULL) as has_manuela,
    (f.id IS NOT NULL) as has_felipe
  FROM challenges c
  LEFT JOIN submissions m ON c.id = m.challenge_id AND m.user_id = (
    SELECT id FROM users WHERE username ILIKE '%manulera%' LIMIT 1
  )
  LEFT JOIN submissions f ON c.id = f.challenge_id AND f.user_id = (
    SELECT id FROM users WHERE username ILIKE '%felipe%' LIMIT 1
  )
  ORDER BY c.day_index;
END;
$$;

-- Función para obtener submissions de un usuario por challenge
CREATE OR REPLACE FUNCTION get_user_submission_by_challenge(p_user_id UUID, p_challenge_id INT)
RETURNS TABLE (
  submission_id UUID,
  photo_url TEXT,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as submission_id,
    s.photo_url,
    s.title,
    s.note,
    s.created_at,
    ST_Y(s.location::geometry) as location_lat,
    ST_X(s.location::geometry) as location_lng
  FROM submissions s
  WHERE s.user_id = p_user_id AND s.challenge_id = p_challenge_id
  LIMIT 1;
END;
$$;

-- Comentarios para documentación
COMMENT ON FUNCTION get_current_challenge(DATE) IS 'Obtiene el challenge del día actual basado en la fecha de inicio del viaje';
COMMENT ON FUNCTION get_challenge_by_day(INT) IS 'Obtiene un challenge específico por número de día';
COMMENT ON FUNCTION get_challenges_range(INT, INT) IS 'Obtiene challenges en un rango de días específico';
COMMENT ON FUNCTION get_all_challenges() IS 'Obtiene todos los challenges ordenados por día';
COMMENT ON FUNCTION get_user_progress(UUID) IS 'Obtiene el progreso de completación de challenges de un usuario';
COMMENT ON FUNCTION get_gallery_manuela(UUID) IS 'Obtiene todas las fotos de Manuela para la galería';
COMMENT ON FUNCTION get_gallery_felipe(UUID) IS 'Obtiene todas las fotos de Felipe para la galería';
COMMENT ON FUNCTION get_gallery_mirror() IS 'Obtiene todas las fotos intercaladas por día para la vista Mirror';
COMMENT ON FUNCTION get_map_photos(UUID) IS 'Obtiene fotos con ubicación de un usuario para el mapa';
COMMENT ON FUNCTION get_calendar_data(DATE) IS 'Obtiene datos del calendario con ambas fotos por día';
COMMENT ON FUNCTION get_user_submission_by_challenge(UUID, INT) IS 'Obtiene la submission de un usuario para un challenge específico';
