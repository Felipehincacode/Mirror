# 🔧 RESUMEN TÉCNICO AVANZADO - BACKEND DIARIO FOTOGRÁFICO

## 📋 **INFORMACIÓN DE CONEXIÓN**

### **Configuración Supabase**
```javascript
// URLs y Claves de Producción
SUPABASE_URL = "https://awepdardqnffaptvstrg.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBkYXJkcW5mZmFwdHZzdHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjMwNTMsImV4cCI6MjA3MzI5OTA1M30.49t5rq9t6qvxmQIl_s5EmUd1SIMHaCehW1LQrA2tWgs"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBkYXJkcW5mZmFwdHZzdHJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcyMzA1MywiZXhwIjoyMDczMjk5MDUzfQ.lzAAeKeK6U8l6xm3_YfnT8KoY9evCtHryG-yjZS7XoI"
```

### **Variables de Entorno Frontend (.env)**
```bash
VITE_SUPABASE_URL=https://awepdardqnffaptvstrg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBkYXJkcW5mZmFwdHZzdHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjMwNTMsImV4cCI6MjA3MzI5OTA1M30.49t5rq9t6qvxmQIl_s5EmUd1SIMHaCehW1LQrA2tWgs
VITE_MAPBOX_TOKEN=tu_token_de_mapbox_aqui
```

---

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### **Tablas Principales**

#### **1. `users`**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. `challenges`**
```sql
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  day_index INT UNIQUE NOT NULL CHECK (day_index >= 1 AND day_index <= 90),
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. `submissions`**
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
```

#### **4. `reactions`**
```sql
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, user_id)
);
```

#### **5. `push_subscriptions`**
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

---

## 🔌 **FUNCIONES DE BASE DE DATOS COMPLETAS**

### **📋 CHALLENGES (Retos)**

#### **`get_current_challenge(start_date DATE DEFAULT '2025-09-14')`**
```sql
-- Obtiene el reto del día actual basado en la fecha de inicio
-- Calcula automáticamente qué día del viaje es (1-90)
-- Parámetros: start_date (opcional, por defecto '2025-09-14')
-- Retorna: Challenge del día actual con todos los campos
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('get_current_challenge')
// Retorna: { id, day_index, title, description, tag, created_at }
```

#### **`get_challenge_by_day(day_number INT)`**
```sql
-- Obtiene un reto específico por número de día
-- Parámetros: day_number (1-90)
-- Retorna: Challenge específico
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('get_challenge_by_day', {
  day_number: 15
})
```

#### **`get_challenges_range(start_day INT, end_day INT)`**
```sql
-- Obtiene retos en un rango específico
-- Parámetros: start_day, end_day (1-90)
-- Retorna: Array de challenges ordenados por día
```

#### **`get_all_challenges()`**
```sql
-- Obtiene todos los 90 retos
-- Parámetros: Ninguno
-- Retorna: Array completo de challenges
```

#### **`get_user_progress(user_uuid UUID)`**
```sql
-- Calcula progreso del usuario
-- Parámetros: user_uuid
-- Retorna: { total_challenges, completed_challenges, current_day, completion_percentage }
```

---

### **🖼️ GALLERY (Galerías)**

#### **`get_gallery_manuela(p_user_id UUID)`**
```sql
-- Solo fotos de Manulera ordenadas por día
-- Parámetros: p_user_id (UUID de Manulera)
-- Retorna: Array con { submission_id, day_index, challenge_title, photo_url, title, note, created_at, location_lat, location_lng }
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('get_gallery_manuela', {
  p_user_id: 'uuid-de-manulera'
})
```

#### **`get_gallery_felipe(p_user_id UUID)`**
```sql
-- Solo fotos de Felipe ordenadas por día
-- Parámetros: p_user_id (UUID de Felipe)
-- Retorna: Misma estructura que get_gallery_manuela
```

#### **`get_gallery_mirror()`**
```sql
-- Fotos intercaladas por día (ambos usuarios)
-- Parámetros: Ninguno
-- Retorna: Array con { submission_id, day_index, challenge_title, photo_url, title, note, user_id, username, created_at, location_lat, location_lng }
```

---

### **🗺️ MAP (Mapa)**

#### **`get_map_photos(p_user_id UUID)`**
```sql
-- Fotos con ubicación GPS de un usuario
-- Parámetros: p_user_id
-- Retorna: Array con { submission_id, day_index, challenge_title, photo_url, title, note, location_lat, location_lng, created_at }
-- Filtra automáticamente fotos sin ubicación
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('get_map_photos', {
  p_user_id: currentUser.id
})
```

---

### **📅 CALENDAR (Calendario)**

#### **`get_calendar_data(start_date DATE DEFAULT '2025-09-14')`**
```sql
-- Ambas fotos por día del calendario
-- Parámetros: start_date (opcional)
-- Retorna: Array con { day_index, challenge_title, challenge_description, challenge_tag, manuela_photo_url, manuela_title, manuela_note, manuela_created_at, felipe_photo_url, felipe_title, felipe_note, felipe_created_at, has_manuela, has_felipe }
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('get_calendar_data')
// Retorna datos completos para cada día del viaje
```

---

### **📸 SUBMISSIONS (Fotos)**

#### **`create_submission(p_user_id UUID, p_challenge_id INT, p_photo_url TEXT, p_title TEXT, p_note TEXT DEFAULT NULL, p_location_lat DOUBLE PRECISION DEFAULT NULL, p_location_lng DOUBLE PRECISION DEFAULT NULL)`**
```sql
-- Crea nueva foto con validaciones completas
-- Parámetros: Todos los datos de la submission
-- Validaciones: Usuario existe, challenge existe, no duplicados
-- Retorna: { submission_id, success, message }
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('create_submission', {
  p_user_id: currentUser.id,
  p_challenge_id: 15,
  p_photo_url: 'https://storage.url/photo.jpg',
  p_title: 'Mi foto del día',
  p_note: 'Nota opcional',
  p_location_lat: 40.7128,
  p_location_lng: -74.0060
})
```

#### **`update_submission(p_submission_id UUID, p_user_id UUID, p_photo_url TEXT DEFAULT NULL, p_title TEXT DEFAULT NULL, p_note TEXT DEFAULT NULL, p_location_lat DOUBLE PRECISION DEFAULT NULL, p_location_lng DOUBLE PRECISION DEFAULT NULL)`**
```sql
-- Actualiza submission existente
-- Parámetros: ID y campos a actualizar (NULL = no cambiar)
-- Validaciones: Submission existe y pertenece al usuario
-- Retorna: { success, message }
```

#### **`delete_submission(p_submission_id UUID, p_user_id UUID)`**
```sql
-- Elimina submission
-- Parámetros: ID de submission y usuario
-- Validaciones: Permisos de usuario
-- Retorna: { success, message }
```

#### **`get_user_submissions(p_user_id UUID)`**
```sql
-- Todas las fotos de un usuario
-- Parámetros: p_user_id
-- Retorna: Array completo con datos de challenges
```

#### **`get_challenge_submissions(p_challenge_id INT)`**
```sql
-- Fotos de un reto específico
-- Parámetros: p_challenge_id
-- Retorna: Array con datos de usuarios
```

---

### **🔔 NOTIFICACIONES PUSH**

#### **`save_push_subscription(p_user_id UUID, p_endpoint TEXT, p_p256dh_key TEXT, p_auth_key TEXT)`**
```sql
-- Guarda suscripción de notificaciones
-- Parámetros: Datos de la suscripción
-- Upsert: Actualiza si existe, crea si no
-- Retorna: { subscription_id, success, message }
```

**Uso en Frontend:**
```typescript
const { data, error } = await supabase.rpc('save_push_subscription', {
  p_user_id: currentUser.id,
  p_endpoint: subscription.endpoint,
  p_p256dh_key: subscription.keys.p256dh,
  p_auth_key: subscription.keys.auth
})
```

#### **`get_user_push_subscriptions(p_user_id UUID)`**
```sql
-- Obtiene suscripciones de un usuario
-- Parámetros: p_user_id
-- Retorna: Array de suscripciones
```

#### **`delete_push_subscription(p_user_id UUID, p_endpoint TEXT)`**
```sql
-- Elimina suscripción específica
-- Parámetros: user_id y endpoint
-- Retorna: { success, message }
```

#### **`get_all_push_subscriptions()`**
```sql
-- Todas las suscripciones activas (para envío masivo)
-- Parámetros: Ninguno
-- Retorna: Array con datos de usuarios
```

#### **`send_daily_reminder_notification()`**
```sql
-- Programa recordatorio diario
-- Parámetros: Ninguno
-- Retorna: { notifications_sent, success, message }
```

---

## 💾 **STORAGE DE IMÁGENES**

### **Configuración del Bucket**
```javascript
// Bucket: 'submission'
// Tipo: Privado
// Límite: 10MB por archivo
// Formatos: JPEG, PNG, WebP
// Estructura: submission/{user_id}/{challenge_id}/original.jpg
```

### **Políticas de Acceso**
```sql
-- Solo usuarios autenticados pueden subir
-- Solo usuarios autenticados pueden leer
-- Solo el propietario puede eliminar
```

### **Uso en Frontend**
```typescript
// Subir imagen
const { data, error } = await supabase.storage
  .from('submission')
  .upload(`${userId}/${challengeId}/original.jpg`, file)

// Obtener URL pública
const { data } = supabase.storage
  .from('submission')
  .getPublicUrl(`${userId}/${challengeId}/original.jpg`)
```

---

## 🔐 **SEGURIDAD Y AUTENTICACIÓN**

### **Row Level Security (RLS)**
- ✅ Habilitado en todas las tablas
- ✅ Políticas por usuario autenticado
- ✅ Acceso restringido por ownership
- ✅ Validaciones en todas las functions

### **VAPID Keys (Notificaciones Push)**
```
VAPID_PUBLIC_KEY = "BL4HZHncFUpHnJkFr9oh7qogQ1ZKyKCrOsuipgJj9P7TeEzAZododbr_jENIwLeTfhb-f3BepF5NCoYl4tzL5Ak"
VAPID_PRIVATE_KEY = "jwVojUJi5-Dkn8IbjK6Yv6LvGGv4ESRpg_WYWfw1U6A"
VAPID_SUBJECT = "mailto:felipe@diario-fotografico.com"
```

---

## 🚀 **IMPLEMENTACIÓN EN FRONTEND**

### **1. Configuración de Supabase**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### **2. Hook useApi (Ya Implementado)**
```typescript
// src/hooks/useApi.ts
export function useApi() {
  const getCurrentChallenge = async () => {
    const { data, error } = await supabase.rpc('get_current_challenge')
    if (error) throw error
    return data
  }
  
  const createSubmission = async (challengeId, photoUrl, title, note, location) => {
    const { data, error } = await supabase.rpc('create_submission', {
      p_user_id: currentUser.id,
      p_challenge_id: challengeId,
      p_photo_url: photoUrl,
      p_title: title,
      p_note: note,
      p_location_lat: location?.lat,
      p_location_lng: location?.lng
    })
    if (error) throw error
    return data
  }
  
  // ... más funciones
}
```

### **3. Uso en Componentes**
```typescript
// Ejemplo: HomeChallenge.tsx
import { useApi } from '../hooks/useApi'

function HomeChallenge() {
  const { getCurrentChallenge, loading, error } = useApi()
  const [challenge, setChallenge] = useState(null)
  
  useEffect(() => {
    const loadChallenge = async () => {
      const data = await getCurrentChallenge()
      setChallenge(data)
    }
    loadChallenge()
  }, [])
  
  if (loading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  if (!challenge) return <EmptyState />
  
  return <ChallengeCard challenge={challenge} />
}
```

---

## 📊 **ESTADO ACTUAL DEL SISTEMA**

### **✅ COMPLETADO:**
- **Base de datos**: 5 tablas con RLS
- **API Functions**: 20+ funciones probadas
- **Storage**: Bucket configurado
- **Notificaciones**: Sistema completo
- **Scripts**: 10+ scripts de administración
- **Auditoría**: Sistema verificado

### **📈 DATOS ACTUALES:**
- **Challenges**: 90 retos (1-90)
- **Usuarios**: 2 usuarios (Felipe, Manulera)
- **Submissions**: Sistema listo
- **Push subscriptions**: Sistema listo

### **🎯 LISTO PARA:**
- **Frontend**: Todas las APIs funcionando
- **Producción**: Sistema verificado
- **Deploy**: Backend serverless

---

## 🔧 **SCRIPTS DE ADMINISTRACIÓN**

### **Scripts Disponibles:**
```bash
npm run test-connection      # Probar conexión
npm run populate-challenges  # Poblar 90 retos
npm run seed-users          # Verificar usuarios
npm run test-api            # Probar API functions
npm run test-frontend       # Probar functions del frontend
npm run test-notifications  # Probar notificaciones
npm run reset-database      # Limpiar base de datos
npm run generate-vapid      # Generar keys VAPID
npm run send-reminder       # Enviar recordatorio
npm run audit              # Auditoría completa
```

---

## 🎉 **CONCLUSIÓN TÉCNICA**

El backend está **100% completo y funcional** con:

- ✅ **Arquitectura serverless** en Supabase
- ✅ **20+ funciones SQL** optimizadas y probadas
- ✅ **Seguridad completa** con RLS
- ✅ **Storage configurado** para imágenes
- ✅ **Sistema de notificaciones** push
- ✅ **APIs listas** para el frontend

**El ingeniero puede usar directamente el hook `useApi` implementado y todas las funciones están documentadas y probadas.** 🚀
