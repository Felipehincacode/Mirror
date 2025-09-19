# 📸 Diario Fotográfico PWA

Una Progressive Web App íntima para documentar un viaje de 90 días a través de retos fotográficos diarios.

## 🎯 **Descripción del Proyecto**

**Diario Fotográfico** es una PWA personal para dos personas (Felipe y Manulera) que crea un ritual diario de conexión emocional durante un viaje de 90 días.

### **Características principales:**
- ✅ **PWA instalable** en móviles
- ✅ **81 retos fotográficos** personalizados
- ✅ **3 vistas**: Galería (Manuela/Mirror/Felipe), Mapa, Calendario
- ✅ **Notificaciones push** diarias
- ✅ **Funcionalidad offline** con sincronización
- ✅ **Storage privado** en Supabase

## 🏗️ **Arquitectura**

### **Backend: Supabase (Serverless)**
```
PWA Frontend → Supabase Functions → PostgreSQL + Storage
     ↓
Service Worker (Offline)
     ↓
IndexedDB (Cola local)
```

### **Tecnologías:**
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **PWA**: Service Worker + IndexedDB
- **Notificaciones**: Web Push API + VAPID

## 📁 **Estructura del Proyecto**

```
mirror/
├── backend/                    # Scripts y configuración del backend
│   ├── sql/                   # Functions de PostgreSQL
│   ├── scripts/               # Scripts de administración
│   ├── utils/                 # Utilidades de Supabase
│   └── DOCUMENTACION_COMPLETA.md
├── frontend/                   # PWA React (próximamente)
├── proceso paso a paso.md      # Plan de desarrollo
└── README.md                  # Este archivo
```

## 🚀 **Estado del Proyecto**

### **✅ COMPLETADO:**
- **Fase 1**: Fundación (Backend) - ✅ COMPLETO
- **Fase 2**: API y Lógica de Negocio - ✅ COMPLETO

### **🔄 EN PROGRESO:**
- **Fase 3**: Frontend Core - 🚧 PRÓXIMO

### **📋 PENDIENTE:**
- **Fase 4**: PWA y Offline
- **Fase 5**: Pulimiento y Deploy

## 🔧 **Backend Completado**

### **Base de datos:**
- ✅ **5 tablas** con Row Level Security
- ✅ **81 challenges** poblados
- ✅ **2 usuarios** configurados
- ✅ **Storage** para imágenes

### **API Functions:**
- ✅ **20+ functions** de PostgreSQL
- ✅ **Challenges** - Retos diarios
- ✅ **Submissions** - Subir/editar fotos
- ✅ **Frontend** - Vistas (Galería/Mapa/Calendario)
- ✅ **Notificaciones** - Push notifications

### **Scripts de administración:**
- ✅ **10+ scripts** para testing y administración
- ✅ **Auditoría completa** del sistema
- ✅ **Documentación** completa

## 📱 **Funcionalidades del Frontend (Plan)**

### **Vistas principales:**
- **Dashboard** - Reto del día + navegación
- **Gallery** - 3 modos (Manuela/Mirror/Felipe)
- **Map** - Fotos con ubicación GPS
- **Calendar** - Vista calendario interactivo
- **Profile** - Perfil del usuario

### **Características:**
- **Mobile-first** design
- **Offline-first** con sincronización
- **Notificaciones push** diarias
- **Subida de fotos** con compresión
- **Micro-interacciones** con Framer Motion

## 🔐 **Seguridad**

- **Row Level Security** en todas las tablas
- **Autenticación** con Supabase Auth
- **VAPID keys** para notificaciones push
- **Storage privado** con políticas de acceso

## 📊 **Datos del Sistema**

- **Challenges**: 81 retos fotográficos
- **Usuarios**: 2 usuarios (Felipe, Manulera)
- **Storage**: Bucket privado para imágenes
- **Notificaciones**: Sistema completo con VAPID

## 🎯 **Próximos Pasos**

1. **Crear frontend** con React + Vite + TailwindCSS
2. **Implementar PWA** con Service Worker
3. **Agregar funcionalidad offline** con IndexedDB
4. **Deploy** a Vercel/Netlify
5. **Testing** en dispositivos móviles

## 📚 **Documentación**

- **Backend**: Ver `backend/DOCUMENTACION_COMPLETA.md`
- **Plan**: Ver `proceso paso a paso.md`
- **APIs**: Documentadas en el backend

## 🎉 **Contribución**

Este es un proyecto personal íntimo. El código está documentado para referencia y aprendizaje.

---

**Desarrollado con ❤️ para documentar un viaje especial**
