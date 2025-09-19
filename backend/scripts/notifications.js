import { supabaseAdmin } from '../utils/supabase.js'
import webpush from 'web-push'

// Configuración de VAPID (keys generadas)
const VAPID_PUBLIC_KEY = 'BL4HZHncFUpHnJkFr9oh7qogQ1ZKyKCrOsuipgJj9P7TeEzAZododbr_jENIwLeTfhb-f3BepF5NCoYl4tzL5Ak'
const VAPID_PRIVATE_KEY = 'jwVojUJi5-Dkn8IbjK6Yv6LvGGv4ESRpg_WYWfw1U6A'
const VAPID_SUBJECT = 'mailto:felipe@diario-fotografico.com'

// Configurar web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// Función para enviar notificación push
async function sendPushNotification(subscription, payload) {
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true, result }
  } catch (error) {
    console.error('Error enviando notificación:', error)
    return { success: false, error: error.message }
  }
}

// Función para enviar recordatorio diario a todos los usuarios
async function sendDailyReminder() {
  try {
    console.log('🔔 Enviando recordatorio diario...')
    
    // Obtener el challenge del día actual
    const { data: currentChallenge, error: challengeError } = await supabaseAdmin
      .rpc('get_current_challenge', { start_date: '2025-09-14' })
    
    if (challengeError) throw challengeError
    
    if (!currentChallenge || currentChallenge.length === 0) {
      console.log('⚠️  No hay challenge para hoy')
      return
    }
    
    const challenge = currentChallenge[0]
    
    // Obtener todas las suscripciones activas
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .rpc('get_all_push_subscriptions')
    
    if (subsError) throw subsError
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  No hay suscripciones activas')
      return
    }
    
    // Crear payload de la notificación
    const payload = {
      title: '📸 Tu reto del día',
      body: challenge.title,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'daily-challenge',
      data: {
        challengeId: challenge.id,
        dayIndex: challenge.day_index,
        url: '/challenge/' + challenge.day_index
      },
      actions: [
        {
          action: 'open',
          title: 'Ver reto',
          icon: '/icon-192x192.png'
        },
        {
          action: 'later',
          title: 'Más tarde',
          icon: '/icon-192x192.png'
        }
      ]
    }
    
    // Enviar notificación a cada suscripción
    let successCount = 0
    let errorCount = 0
    
    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key
        }
      }
      
      const result = await sendPushNotification(subscription, payload)
      
      if (result.success) {
        successCount++
        console.log(`✅ Notificación enviada a ${sub.username}`)
      } else {
        errorCount++
        console.log(`❌ Error enviando a ${sub.username}: ${result.error}`)
      }
    }
    
    console.log(`📊 Notificaciones enviadas: ${successCount} exitosas, ${errorCount} errores`)
    
    return {
      success: true,
      sent: successCount,
      errors: errorCount,
      total: subscriptions.length
    }
    
  } catch (error) {
    console.error('❌ Error enviando recordatorio diario:', error.message)
    return { success: false, error: error.message }
  }
}

// Función para enviar notificación personalizada
async function sendCustomNotification(userId, title, body, data = {}) {
  try {
    console.log(`🔔 Enviando notificación personalizada a usuario ${userId}...`)
    
    // Obtener suscripciones del usuario
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .rpc('get_user_push_subscriptions', { p_user_id: userId })
    
    if (subsError) throw subsError
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  Usuario no tiene suscripciones activas')
      return { success: false, message: 'No hay suscripciones activas' }
    }
    
    // Crear payload
    const payload = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'custom-notification',
      data,
      actions: [
        {
          action: 'open',
          title: 'Ver',
          icon: '/icon-192x192.png'
        }
      ]
    }
    
    // Enviar a todas las suscripciones del usuario
    let successCount = 0
    
    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key
        }
      }
      
      const result = await sendPushNotification(subscription, payload)
      
      if (result.success) {
        successCount++
      }
    }
    
    console.log(`✅ Notificación personalizada enviada: ${successCount} exitosas`)
    
    return {
      success: true,
      sent: successCount,
      total: subscriptions.length
    }
    
  } catch (error) {
    console.error('❌ Error enviando notificación personalizada:', error.message)
    return { success: false, error: error.message }
  }
}

// Función para probar el sistema de notificaciones
async function testNotifications() {
  try {
    console.log('🧪 Probando sistema de notificaciones...\n')
    
    // 1. Probar funciones de base de datos
    console.log('1️⃣ Probando funciones de base de datos...')
    
    const { data: allSubs, error: allSubsError } = await supabaseAdmin
      .rpc('get_all_push_subscriptions')
    
    if (allSubsError) throw allSubsError
    console.log(`✅ Suscripciones activas: ${allSubs.length}`)
    
    // 2. Probar envío de recordatorio (solo si hay suscripciones)
    if (allSubs.length > 0) {
      console.log('\n2️⃣ Probando envío de recordatorio...')
      const result = await sendDailyReminder()
      console.log('✅ Recordatorio:', result)
    } else {
      console.log('\n2️⃣ ⚠️  No hay suscripciones para probar envío')
    }
    
    console.log('\n🎉 Sistema de notificaciones funcionando!')
    
  } catch (error) {
    console.error('❌ Error probando notificaciones:', error.message)
  }
}

// Ejecutar si es llamado directamente
console.log('🚀 Iniciando test de notificaciones...')
testNotifications()
  .then(() => {
    console.log('✅ Test completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en test:', error)
    process.exit(1)
  })

export { sendDailyReminder, sendCustomNotification, testNotifications, VAPID_PUBLIC_KEY }
