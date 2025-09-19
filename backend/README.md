# Backend - Diario Fotográfico

Scripts y utilidades para administrar la base de datos de la PWA Diario Fotográfico.

## Estructura

```
backend/
├── config.env                    # Variables de entorno
├── package.json                  # Dependencias y scripts
├── challenges.json               # 81 retos fotográficos
├── utils/
│   └── supabase.js              # Cliente de Supabase
├── scripts/
│   ├── test_connection.js       # Probar conexión
│   ├── populate_challenges.js   # Poblar challenges
│   ├── seed_users.js            # Verificar usuarios
│   ├── test_api_functions.js    # Probar API básicas
│   └── test_frontend_apis.js    # Probar APIs del frontend
└── sql/
    ├── api_functions.sql        # Functions para vistas del frontend
    ├── submissions_functions.sql # Functions para subir fotos
    └── notifications_functions.sql # Functions para notificaciones push
```

## Instalación

```bash
cd backend
npm install
```

## Scripts Disponibles

### 1. Probar Conexión
```bash
npm run test-connection
```

### 2. Poblar Challenges
```bash
npm run populate-challenges
```
**Requisito:** Archivo `challenges.json` con tus 81 retos.

### 3. Verificar Usuarios
```bash
npm run seed-users
```

### 4. Probar API Functions
```bash
npm run test-api
```

### 5. Probar APIs del Frontend
```bash
npm run test-frontend
```

### 6. Generar Keys VAPID
```bash
npm run generate-vapid
```

### 7. Probar Notificaciones
```bash
npm run test-notifications
```

### 8. Enviar Recordatorio Diario
```bash
npm run send-reminder
```

## Configuración de la Base de Datos

### 1. Ejecutar SQL en Supabase
Ejecuta estos archivos en el **Editor SQL** de Supabase:

1. `sql/api_functions.sql` - Functions para las vistas del frontend
2. `sql/submissions_functions.sql` - Functions para subir fotos
3. `sql/notifications_functions.sql` - Functions para notificaciones push

### 2. Verificar Setup
```bash
npm run test-frontend
```

## API Functions Disponibles

### **Para las Vistas del Frontend:**

#### **Galería:**
- `get_gallery_manuela(user_id)` - Solo fotos de Manuela
- `get_gallery_felipe(user_id)` - Solo fotos de Felipe  
- `get_gallery_mirror()` - Fotos intercaladas por día

#### **Mapa:**
- `get_map_photos(user_id)` - Fotos con ubicación de un usuario

#### **Calendario:**
- `get_calendar_data(start_date)` - Ambas fotos por día

#### **Submissions:**
- `create_submission(...)` - Crear nueva foto
- `update_submission(...)` - Actualizar foto existente
- `delete_submission(...)` - Eliminar foto
- `get_user_submissions(user_id)` - Fotos de un usuario
- `get_challenge_submissions(challenge_id)` - Fotos de un challenge

#### **Notificaciones Push:**
- `save_push_subscription(...)` - Guardar suscripción de notificaciones
- `get_user_push_subscriptions(user_id)` - Obtener suscripciones de usuario
- `delete_push_subscription(...)` - Eliminar suscripción
- `get_all_push_subscriptions()` - Obtener todas las suscripciones
- `send_daily_reminder_notification()` - Enviar recordatorio diario

## Formato de challenges.json

```json
[
  {
    "date": "2025-09-14",
    "title": "✈️ En el avión",
    "description": "Estás en el aire: toma una foto desde la ventana...",
    "tag": "viaje"
  }
]
```

## Flujo de la PWA

1. **Usuario abre la app** → Se conecta a Supabase
2. **Ve el reto del día** → `get_current_challenge()`
3. **Sube una foto** → `create_submission()`
4. **Ve la galería** → `get_gallery_manuela()` / `get_gallery_felipe()` / `get_gallery_mirror()`
5. **Ve el mapa** → `get_map_photos()`
6. **Ve el calendario** → `get_calendar_data()`
7. **Recibe notificaciones** → `save_push_subscription()` + `send_daily_reminder_notification()`

## Sistema de Notificaciones Push

### **Keys VAPID:**
- **Public Key**: `BL4HZHncFUpHnJkFr9oh7qogQ1ZKyKCrOsuipgJj9P7TeEzAZododbr_jENIwLeTfhb-f3BepF5NCoYl4tzL5Ak`
- **Private Key**: `jwVojUJi5-Dkn8IbjK6Yv6LvGGv4ESRpg_WYWfw1U6A`

### **Funcionalidades:**
- ✅ **Recordatorio diario** con el reto del día
- ✅ **Notificaciones personalizadas**
- ✅ **Suscripciones por usuario**
- ✅ **Web Push API** compatible
- ✅ **VAPID** para seguridad
