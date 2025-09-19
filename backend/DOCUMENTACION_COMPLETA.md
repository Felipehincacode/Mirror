# 📚 DOCUMENTACIÓN COMPLETA - DIARIO FOTOGRÁFICO

## 🎯 **Resumen del Proyecto**

**Diario Fotográfico** es una PWA (Progressive Web App) íntima para dos personas (Felipe y Manulera) que documenta un viaje de 90 días a través de retos fotográficos diarios.

### **Características principales:**
- ✅ **PWA instalable** en móviles
- ✅ **81 retos fotográficos** personalizados
- ✅ **3 vistas**: Galería (Manuela/Mirror/Felipe), Mapa, Calendario
- ✅ **Notificaciones push** diarias
- ✅ **Funcionalidad offline** con sincronización
- ✅ **Storage privado** en Supabase

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Backend: Supabase (Serverless)**
```
PWA Frontend → Supabase Functions → PostgreSQL + Storage
     ↓
Service Worker (Offline)
     ↓
IndexedDB (Cola local)
```

### **Ventajas de esta arquitectura:**
- ✅ **Cero infraestructura** - No necesitas servidor
- ✅ **Deploy instantáneo** - Cambios en SQL se aplican inmediatamente
- ✅ **Escalabilidad automática** - Supabase maneja la carga
- ✅ **Seguridad integrada** - RLS (Row Level Security)
- ✅ **Real-time** - Actualizaciones en vivo

---

## 📊 **ESTRUCTURA DE BASE DE DATOS**

### **Tablas principales:**

#### **1. `users`**
```sql
- id (UUID) - Referencia a auth.users
- username (TEXT) - Nombre del usuario
- avatar_url (TEXT) - URL del avatar
- created_at (TIMESTAMPTZ) - Fecha de creación
```

#### **2. `challenges`**
```sql
- id (SERIAL) - ID único
- day_index (INT) - Día del viaje (1-81)
- title (TEXT) - Título del reto
- description (TEXT) - Descripción detallada
- tag (TEXT) - Categoría del reto
- created_at (TIMESTAMPTZ) - Fecha de creación
```

#### **3. `submissions`**
```sql
- id (UUID) - ID único
- user_id (UUID) - Referencia a users
- challenge_id (INT) - Referencia a challenges
- photo_url (TEXT) - URL de la foto en storage
- title (TEXT) - Título de la foto
- note (TEXT) - Nota del usuario
- location (GEOGRAPHY) - Coordenadas GPS
- created_at (TIMESTAMPTZ) - Fecha de creación
```

#### **4. `reactions`**
```sql
- id (SERIAL) - ID único
- submission_id (UUID) - Referencia a submissions
- user_id (UUID) - Referencia a users
- emoji_type (TEXT) - Tipo de emoji
- created_at (TIMESTAMPTZ) - Fecha de creación
```

#### **5. `push_subscriptions`**
```sql
- id (UUID) - ID único
- user_id (UUID) - Referencia a users
- endpoint (TEXT) - Endpoint de notificación
- p256dh_key (TEXT) - Clave pública
- auth_key (TEXT) - Clave de autenticación
- created_at (TIMESTAMPTZ) - Fecha de creación
- updated_at (TIMESTAMPTZ) - Fecha de actualización
```

---

## 🔧 **API FUNCTIONS DISPONIBLES**

### **📋 CHALLENGES (Retos)**

#### **`get_current_challenge(start_date)`**
- **Propósito**: Obtiene el reto del día actual
- **Parámetros**: `start_date` (DATE) - Fecha de inicio del viaje
- **Retorna**: Challenge del día actual
- **Uso**: Mostrar reto en la app

#### **`get_challenge_by_day(day_number)`**
- **Propósito**: Obtiene un reto específico por día
- **Parámetros**: `day_number` (INT) - Número del día (1-81)
- **Retorna**: Challenge específico
- **Uso**: Navegación entre días

#### **`get_challenges_range(start_day, end_day)`**
- **Propósito**: Obtiene retos en un rango
- **Parámetros**: `start_day`, `end_day` (INT) - Rango de días
- **Retorna**: Array de challenges
- **Uso**: Calendario, vista semanal

#### **`get_all_challenges()`**
- **Propósito**: Obtiene todos los retos
- **Parámetros**: Ninguno
- **Retorna**: Array de 81 challenges
- **Uso**: Vista completa del viaje

#### **`get_user_progress(user_uuid)`**
- **Propósito**: Calcula progreso del usuario
- **Parámetros**: `user_uuid` (UUID) - ID del usuario
- **Retorna**: Total, completados, porcentaje
- **Uso**: Mostrar progreso en la app

### **🖼️ FRONTEND (Vistas)**

#### **`get_gallery_manuela(p_user_id)`**
- **Propósito**: Solo fotos de Manulera
- **Parámetros**: `p_user_id` (UUID) - ID de Manulera
- **Retorna**: Array de submissions con datos completos
- **Uso**: Vista "Manuela" en galería

#### **`get_gallery_felipe(p_user_id)`**
- **Propósito**: Solo fotos de Felipe
- **Parámetros**: `p_user_id` (UUID) - ID de Felipe
- **Retorna**: Array de submissions con datos completos
- **Uso**: Vista "Felipe" en galería

#### **`get_gallery_mirror()`**
- **Propósito**: Fotos intercaladas por día
- **Parámetros**: Ninguno
- **Retorna**: Array de submissions con username
- **Uso**: Vista "Mirror" en galería

#### **`get_map_photos(p_user_id)`**
- **Propósito**: Fotos con ubicación de un usuario
- **Parámetros**: `p_user_id` (UUID) - ID del usuario
- **Retorna**: Array de submissions con coordenadas
- **Uso**: Vista del mapa

#### **`get_calendar_data(start_date)`**
- **Propósito**: Ambas fotos por día
- **Parámetros**: `start_date` (DATE) - Fecha de inicio
- **Retorna**: Array con datos de ambos usuarios por día
- **Uso**: Vista del calendario

### **📸 SUBMISSIONS (Fotos)**

#### **`create_submission(p_user_id, p_challenge_id, p_photo_url, p_title, p_note, p_location_lat, p_location_lng)`**
- **Propósito**: Crear nueva foto
- **Parámetros**: Todos los datos de la submission
- **Retorna**: ID de la submission creada
- **Uso**: Subir foto desde la app

#### **`update_submission(p_submission_id, p_user_id, p_photo_url, p_title, p_note, p_location_lat, p_location_lng)`**
- **Propósito**: Actualizar foto existente
- **Parámetros**: ID y datos a actualizar
- **Retorna**: Confirmación de actualización
- **Uso**: Editar foto desde la app

#### **`delete_submission(p_submission_id, p_user_id)`**
- **Propósito**: Eliminar foto
- **Parámetros**: ID de submission y usuario
- **Retorna**: Confirmación de eliminación
- **Uso**: Borrar foto desde la app

#### **`get_user_submissions(p_user_id)`**
- **Propósito**: Obtener fotos de un usuario
- **Parámetros**: `p_user_id` (UUID) - ID del usuario
- **Retorna**: Array de submissions del usuario
- **Uso**: Perfil del usuario

#### **`get_challenge_submissions(p_challenge_id)`**
- **Propósito**: Obtener fotos de un reto
- **Parámetros**: `p_challenge_id` (INT) - ID del challenge
- **Retorna**: Array de submissions del reto
- **Uso**: Ver fotos de un reto específico

### **🔔 NOTIFICACIONES PUSH**

#### **`save_push_subscription(p_user_id, p_endpoint, p_p256dh_key, p_auth_key)`**
- **Propósito**: Guardar suscripción de notificaciones
- **Parámetros**: Datos de la suscripción
- **Retorna**: ID de la suscripción
- **Uso**: Suscribir usuario a notificaciones

#### **`get_user_push_subscriptions(p_user_id)`**
- **Propósito**: Obtener suscripciones de un usuario
- **Parámetros**: `p_user_id` (UUID) - ID del usuario
- **Retorna**: Array de suscripciones
- **Uso**: Gestionar suscripciones

#### **`delete_push_subscription(p_user_id, p_endpoint)`**
- **Propósito**: Eliminar suscripción
- **Parámetros**: ID de usuario y endpoint
- **Retorna**: Confirmación de eliminación
- **Uso**: Desuscribir usuario

#### **`get_all_push_subscriptions()`**
- **Propósito**: Obtener todas las suscripciones
- **Parámetros**: Ninguno
- **Retorna**: Array de todas las suscripciones
- **Uso**: Enviar notificaciones masivas

#### **`send_daily_reminder_notification()`**
- **Propósito**: Programar recordatorio diario
- **Parámetros**: Ninguno
- **Retorna**: Estadísticas de envío
- **Uso**: Recordatorio automático

---

## 🚀 **SCRIPTS DE ADMINISTRACIÓN**

### **Scripts disponibles:**

#### **`npm run test-connection`**
- **Propósito**: Probar conexión a Supabase
- **Uso**: Verificar configuración

#### **`npm run populate-challenges`**
- **Propósito**: Poblar base de datos con 81 retos
- **Uso**: Setup inicial

#### **`npm run seed-users`**
- **Propósito**: Verificar usuarios existentes
- **Uso**: Verificar setup de usuarios

#### **`npm run test-api`**
- **Propósito**: Probar API functions básicas
- **Uso**: Verificar functions de challenges

#### **`npm run test-frontend`**
- **Propósito**: Probar API functions del frontend
- **Uso**: Verificar functions de vistas

#### **`npm run test-notifications`**
- **Propósito**: Probar sistema de notificaciones
- **Uso**: Verificar functions de notificaciones

#### **`npm run reset-database`**
- **Propósito**: Limpiar base de datos
- **Uso**: Reset para testing

#### **`npm run generate-vapid`**
- **Propósito**: Generar keys VAPID
- **Uso**: Setup de notificaciones

#### **`npm run send-reminder`**
- **Propósito**: Enviar recordatorio diario
- **Uso**: Notificaciones manuales

#### **`npm run audit`**
- **Propósito**: Auditoría completa del sistema
- **Uso**: Verificar estado general

---

## 🔐 **CONFIGURACIÓN DE SEGURIDAD**

### **Row Level Security (RLS)**
- ✅ **Habilitado** en todas las tablas
- ✅ **Políticas** para usuarios autenticados
- ✅ **Acceso restringido** por usuario
- ✅ **Validaciones** en todas las functions

### **VAPID Keys**
- **Public Key**: `BL4HZHncFUpHnJkFr9oh7qogQ1ZKyKCrOsuipgJj9P7TeEzAZododbr_jENIwLeTfhb-f3BepF5NCoYl4tzL5Ak`
- **Private Key**: `jwVojUJi5-Dkn8IbjK6Yv6LvGGv4ESRpg_WYWfw1U6A`
- **Subject**: `mailto:felipe@diario-fotografico.com`

---

## 📱 **STORAGE DE IMÁGENES**

### **Bucket: `submission`**
- **Tipo**: Privado
- **Límite**: 10MB por archivo
- **Formatos**: JPEG, PNG, WebP
- **Estructura**: `submission/{user_id}/{challenge_id}/original.jpg`

### **Políticas de acceso:**
- ✅ Solo usuarios autenticados pueden subir
- ✅ Solo usuarios autenticados pueden leer
- ✅ Solo el propietario puede eliminar

---

## 🎯 **ESTADO ACTUAL DEL SISTEMA**

### **✅ COMPLETADO:**
- **Base de datos**: 5 tablas con RLS
- **API Functions**: 20+ functions funcionando
- **Storage**: Bucket configurado
- **Notificaciones**: Sistema completo
- **Scripts**: 10+ scripts de administración
- **Auditoría**: Sistema verificado

### **📊 DATOS ACTUALES:**
- **Challenges**: 81 retos
- **Usuarios**: 2 usuarios (Felipe, Manulera)
- **Submissions**: 1 foto de prueba
- **Push subscriptions**: 0 suscripciones

### **🚀 LISTO PARA:**
- **Frontend**: Todas las APIs funcionando
- **Producción**: Sistema verificado
- **Deploy**: Backend serverless

---

## 🔄 **FLUJO DE LA APLICACIÓN**

### **1. Usuario abre la app:**
```
PWA → Supabase Auth → Verificar usuario → Cargar datos
```

### **2. Ve el reto del día:**
```
App → get_current_challenge() → Mostrar reto
```

### **3. Sube una foto:**
```
App → create_submission() → Supabase Storage → Base de datos
```

### **4. Ve la galería:**
```
App → get_gallery_manuela() / get_gallery_felipe() / get_gallery_mirror()
```

### **5. Ve el mapa:**
```
App → get_map_photos() → Mostrar fotos con ubicación
```

### **6. Ve el calendario:**
```
App → get_calendar_data() → Mostrar ambas fotos por día
```

### **7. Recibe notificaciones:**
```
App → save_push_subscription() → Backend → send_daily_reminder_notification()
```

---

## 🎉 **CONCLUSIÓN**

El **backend está 100% completo y funcional**. Todas las APIs están probadas y listas para el frontend. El sistema es:

- ✅ **Escalable** - Supabase maneja la infraestructura
- ✅ **Seguro** - RLS y validaciones en todas partes
- ✅ **Eficiente** - Functions optimizadas en PostgreSQL
- ✅ **Moderno** - Arquitectura serverless
- ✅ **Completo** - Todas las funcionalidades implementadas

**¡Listo para la Fase 3: Frontend Core!** 🚀
