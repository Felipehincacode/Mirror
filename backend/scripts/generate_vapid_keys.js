import webpush from 'web-push'

// Función para generar keys VAPID
function generateVapidKeys() {
  try {
    console.log('🔑 Generando keys VAPID para notificaciones push...\n')
    
    const vapidKeys = webpush.generateVAPIDKeys()
    
    console.log('✅ Keys VAPID generadas:')
    console.log('')
    console.log('📋 PUBLIC KEY (para el frontend):')
    console.log(vapidKeys.publicKey)
    console.log('')
    console.log('🔒 PRIVATE KEY (para el backend):')
    console.log(vapidKeys.privateKey)
    console.log('')
    console.log('📝 Instrucciones:')
    console.log('1. Copia la PUBLIC KEY al frontend (archivo .env)')
    console.log('2. Copia la PRIVATE KEY al backend (archivo config.env)')
    console.log('3. Actualiza el archivo notifications.js con estas keys')
    console.log('')
    console.log('⚠️  IMPORTANTE: Mantén la PRIVATE KEY segura y no la compartas!')
    
    return vapidKeys
    
  } catch (error) {
    console.error('❌ Error generando keys VAPID:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
generateVapidKeys()
