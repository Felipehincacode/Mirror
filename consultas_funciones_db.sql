-- ================================================================================
-- QUERIES SQL PARA CONSULTAR FUNCIONES DE LA BASE DE DATOS
-- Mirror Diary Project - Database Functions Inspection
-- ================================================================================

-- 1. CONSULTAR TODAS LAS FUNCIONES PERSONALIZADAS EN LA BASE DE DATOS
-- ============================================================================
SELECT 
    routine_name as function_name,
    routine_type as type,
    data_type as return_type,
    routine_definition as definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- 2. OBTENER PARÁMETROS DE CADA FUNCIÓN
-- ============================================================================
SELECT 
    r.routine_name as function_name,
    p.parameter_name,
    p.data_type,
    p.parameter_default,
    p.parameter_mode
FROM information_schema.routines r
JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public' 
    AND r.routine_type = 'FUNCTION'
    AND r.routine_name NOT LIKE 'pg_%'
ORDER BY r.routine_name, p.ordinal_position;

-- 3. CONSULTAR COMENTARIOS/DOCUMENTACIÓN DE LAS FUNCIONES
-- ============================================================================
SELECT 
    obj_description(p.oid) as function_description,
    proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND proname NOT LIKE 'pg_%'
ORDER BY proname;

-- ================================================================================
-- TESTING DE FUNCIONES ESPECÍFICAS DEL PROYECTO
-- ================================================================================

-- 4. PROBAR FUNCIÓN get_current_challenge()
-- ============================================================================
SELECT 'Testing get_current_challenge()' as test_name;
SELECT * FROM get_current_challenge();

-- 5. PROBAR FUNCIÓN get_challenge_by_day()
-- ============================================================================
SELECT 'Testing get_challenge_by_day(1)' as test_name;
SELECT * FROM get_challenge_by_day(1);

-- 6. PROBAR FUNCIÓN get_all_challenges()
-- ============================================================================
SELECT 'Testing get_all_challenges() - First 5 records' as test_name;
SELECT * FROM get_all_challenges() LIMIT 5;

-- 7. PROBAR FUNCIÓN get_user_progress()
-- ============================================================================
SELECT 'Testing get_user_progress() for Felipe' as test_name;
SELECT * FROM get_user_progress('76352a12-966c-4e82-9ead-ac267dfedcdd');

-- 8. PROBAR FUNCIONES DE GALERÍA
-- ============================================================================
SELECT 'Testing get_gallery_felipe()' as test_name;
SELECT * FROM get_gallery_felipe('76352a12-966c-4e82-9ead-ac267dfedcdd') LIMIT 5;

SELECT 'Testing get_gallery_mirror()' as test_name;
SELECT * FROM get_gallery_mirror() LIMIT 5;

-- 9. PROBAR FUNCIÓN DE MAPA
-- ============================================================================
SELECT 'Testing get_map_photos() for Felipe' as test_name;
SELECT * FROM get_map_photos('76352a12-966c-4e82-9ead-ac267dfedcdd');

-- 10. PROBAR FUNCIÓN DE CALENDARIO
-- ============================================================================
SELECT 'Testing get_calendar_data()' as test_name;
SELECT * FROM get_calendar_data() LIMIT 10;

-- ================================================================================
-- VERIFICAR ESTRUCTURA DE TABLAS
-- ================================================================================

-- 11. ESTRUCTURA DE TABLA USERS
-- ============================================================================
SELECT 'Users table structure' as table_info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. ESTRUCTURA DE TABLA CHALLENGES
-- ============================================================================
SELECT 'Challenges table structure' as table_info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'challenges' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 13. ESTRUCTURA DE TABLA SUBMISSIONS
-- ============================================================================
SELECT 'Submissions table structure' as table_info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'submissions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ================================================================================
-- VERIFICAR DATOS EXISTENTES
-- ================================================================================

-- 14. CONTAR REGISTROS EN CADA TABLA
-- ============================================================================
SELECT 'Data counts' as info;
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'challenges' as table_name, 
    COUNT(*) as record_count 
FROM challenges
UNION ALL
SELECT 
    'submissions' as table_name, 
    COUNT(*) as record_count 
FROM submissions
UNION ALL
SELECT 
    'reactions' as table_name, 
    COUNT(*) as record_count 
FROM reactions
UNION ALL
SELECT 
    'push_subscriptions' as table_name, 
    COUNT(*) as record_count 
FROM push_subscriptions;

-- 15. USUARIOS EXISTENTES
-- ============================================================================
SELECT 'Current users' as info;
SELECT 
    id,
    username,
    created_at
FROM users
ORDER BY created_at;

-- 16. ALGUNOS CHALLENGES DE EJEMPLO
-- ============================================================================
SELECT 'Sample challenges' as info;
SELECT 
    id,
    day_index,
    title,
    LEFT(description, 50) || '...' as description_preview,
    tag
FROM challenges
ORDER BY day_index
LIMIT 10;

-- 17. SUBMISSIONS EXISTENTES (SI LAS HAY)
-- ============================================================================
SELECT 'Current submissions' as info;
SELECT 
    s.id,
    u.username,
    c.day_index,
    c.title as challenge_title,
    s.title as submission_title,
    s.created_at
FROM submissions s
JOIN users u ON s.user_id = u.id
JOIN challenges c ON s.challenge_id = c.id
ORDER BY s.created_at DESC
LIMIT 10;

-- ================================================================================
-- VERIFICAR PERMISOS Y POLÍTICAS RLS
-- ================================================================================

-- 18. VERIFICAR POLÍTICAS RLS
-- ============================================================================
SELECT 'RLS policies' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================================
-- INFORMACIÓN ADICIONAL DEL SISTEMA
-- ================================================================================

-- 19. EXTENSIONES INSTALADAS
-- ============================================================================
SELECT 'Installed extensions' as info;
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension
ORDER BY extname;

-- 20. VERIFICAR CONFIGURACIÓN DE POSTGIS (SI ESTÁ INSTALADA)
-- ============================================================================
SELECT 'PostGIS version (if installed)' as info;
SELECT PostGIS_Version() as postgis_version;

-- ================================================================================
-- INSTRUCCIONES DE USO
-- ================================================================================

/*
INSTRUCCIONES PARA EJECUTAR ESTAS QUERIES:

1. Conectarse a la base de datos de Supabase
2. Ejecutar las queries una por una o por secciones
3. Revisar los resultados para entender:
   - Qué funciones están disponibles
   - Qué parámetros esperan
   - Qué datos retornan
   - Estado actual de los datos

IMPORTANTE:
- Estas queries son de solo lectura (SELECT)
- No modifican datos existentes
- Proporcionan información completa del sistema
- Ayudan a entender la estructura antes de conectar el frontend

FUNCIONES PRINCIPALES DISPONIBLES:
- get_current_challenge() - Challenge del día actual
- get_challenge_by_day(day_number) - Challenge específico
- get_all_challenges() - Todos los challenges
- get_user_progress(user_id) - Progreso del usuario
- get_gallery_felipe(user_id) - Galería de Felipe
- get_gallery_manuela(user_id) - Galería de Manuela
- get_gallery_mirror() - Galería combinada
- get_map_photos(user_id) - Fotos con ubicación
- get_calendar_data() - Datos del calendario
- create_submission(...) - Crear nueva foto
- update_submission(...) - Actualizar foto
- delete_submission(...) - Eliminar foto

¡EJECUTA ESTAS QUERIES PARA CONOCER TU BASE DE DATOS!
*/
