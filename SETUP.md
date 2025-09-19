# 🚀 Guía de Configuración

## 📋 **Pasos para configurar el proyecto**

### **1. Clonar el repositorio**
```bash
git clone [URL_DEL_REPO]
cd mirror
```

### **2. Configurar el backend**
```bash
cd backend
npm install
```

### **3. Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp env.example config.env

# Editar config.env con tus keys reales
```

### **4. Configurar Supabase**
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar los archivos SQL en el Editor SQL:
   - `sql/api_functions.sql`
   - `sql/submissions_functions.sql`
   - `sql/notifications_functions.sql`

### **5. Poblar la base de datos**
```bash
npm run populate-challenges
npm run test-connection
npm run audit
```

### **6. Generar keys VAPID**
```bash
npm run generate-vapid
# Copiar las keys al archivo config.env
```

## 🔐 **Variables de entorno necesarias**

### **Supabase:**
- `SUPABASE_URL` - URL de tu proyecto
- `SUPABASE_ANON_KEY` - Key pública
- `SUPABASE_SERVICE_ROLE_KEY` - Key privada

### **VAPID (para notificaciones):**
- `VAPID_PUBLIC_KEY` - Key pública
- `VAPID_PRIVATE_KEY` - Key privada
- `VAPID_SUBJECT` - Email de contacto

## ⚠️ **Importante**

- **NUNCA** subas archivos `.env` o `config.env` a Git
- **Mantén** las keys privadas seguras
- **Usa** el archivo `env.example` como referencia

## 🧪 **Verificar instalación**

```bash
npm run audit
```

Si todo está bien, verás: `✅ Sistema listo para producción`
