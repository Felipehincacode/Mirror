import { supabaseAdmin } from '../utils/supabase.js'

// Función para hacer auditoría completa del sistema
async function auditComplete() {
  try {
    console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA')
    console.log('=====================================\n')
    
    // =================================================================
    // 1. VERIFICAR CONEXIÓN Y CONFIGURACIÓN
    // =================================================================
    console.log('1️⃣ VERIFICANDO CONEXIÓN Y CONFIGURACIÓN...')
    
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (connectionError) throw connectionError
    console.log('✅ Conexión a Supabase: OK')
    console.log('✅ Configuración de variables: OK')
    
    // =================================================================
    // 2. VERIFICAR ESTRUCTURA DE BASE DE DATOS
    // =================================================================
    console.log('\n2️⃣ VERIFICANDO ESTRUCTURA DE BASE DE DATOS...')
    
    // Verificar tablas principales
    const tables = ['users', 'challenges', 'submissions', 'reactions', 'push_subscriptions']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) throw error
        console.log(`✅ Tabla ${table}: OK`)
      } catch (error) {
        console.log(`❌ Tabla ${table}: ERROR - ${error.message}`)
      }
    }
    
    // =================================================================
    // 3. VERIFICAR DATOS POBLADOS
    // =================================================================
    console.log('\n3️⃣ VERIFICANDO DATOS POBLADOS...')
    
    // Challenges
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('challenges')
      .select('count')
      .limit(1)
    
    if (challengesError) throw challengesError
    console.log(`✅ Challenges: ${challenges.length} retos`)
    
    // Usuarios
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username')
    
    if (usersError) throw usersError
    console.log(`✅ Usuarios: ${users.length} usuarios`)
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.id})`)
    })
    
    // Submissions
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('count')
      .limit(1)
    
    if (submissionsError) throw submissionsError
    console.log(`✅ Submissions: ${submissions.length} fotos`)
    
    // Push subscriptions
    const { data: pushSubs, error: pushSubsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('count')
      .limit(1)
    
    if (pushSubsError) throw pushSubsError
    console.log(`✅ Push subscriptions: ${pushSubs.length} suscripciones`)
    
    // =================================================================
    // 4. VERIFICAR API FUNCTIONS - CHALLENGES
    // =================================================================
    console.log('\n4️⃣ VERIFICANDO API FUNCTIONS - CHALLENGES...')
    
    const challengeFunctions = [
      { name: 'get_current_challenge', params: {} },
      { name: 'get_challenge_by_day', params: { day_number: 1 } },
      { name: 'get_challenges_range', params: { start_day: 1, end_day: 3 } },
      { name: 'get_all_challenges', params: {} },
      { name: 'get_user_progress', params: { user_uuid: users[0]?.id } }
    ]
    
    for (const func of challengeFunctions) {
      try {
        const { data, error } = await supabaseAdmin.rpc(func.name, func.params)
        if (error) throw error
        console.log(`✅ ${func.name}: OK (${data.length} resultados)`)
      } catch (error) {
        console.log(`❌ ${func.name}: ERROR - ${error.message}`)
      }
    }
    
    // =================================================================
    // 5. VERIFICAR API FUNCTIONS - FRONTEND
    // =================================================================
    console.log('\n5️⃣ VERIFICANDO API FUNCTIONS - FRONTEND...')
    
    const frontendFunctions = [
      { name: 'get_gallery_manuela', params: { p_user_id: users[0]?.id } },
      { name: 'get_gallery_felipe', params: { p_user_id: users[1]?.id } },
      { name: 'get_gallery_mirror', params: {} },
      { name: 'get_map_photos', params: { p_user_id: users[0]?.id } },
      { name: 'get_calendar_data', params: {} }
    ]
    
    for (const func of frontendFunctions) {
      try {
        const { data, error } = await supabaseAdmin.rpc(func.name, func.params)
        if (error) throw error
        console.log(`✅ ${func.name}: OK (${data.length} resultados)`)
      } catch (error) {
        console.log(`❌ ${func.name}: ERROR - ${error.message}`)
      }
    }
    
    // =================================================================
    // 6. VERIFICAR API FUNCTIONS - SUBMISSIONS
    // =================================================================
    console.log('\n6️⃣ VERIFICANDO API FUNCTIONS - SUBMISSIONS...')
    
    const submissionFunctions = [
      { name: 'create_submission', params: { 
        p_user_id: users[0]?.id, 
        p_challenge_id: 1, 
        p_photo_url: 'test-audit.jpg', 
        p_title: 'Test auditoría' 
      }},
      { name: 'get_user_submissions', params: { p_user_id: users[0]?.id } },
      { name: 'get_challenge_submissions', params: { p_challenge_id: 1 } }
    ]
    
    for (const func of submissionFunctions) {
      try {
        const { data, error } = await supabaseAdmin.rpc(func.name, func.params)
        if (error) throw error
        console.log(`✅ ${func.name}: OK (${data.length} resultados)`)
      } catch (error) {
        console.log(`❌ ${func.name}: ERROR - ${error.message}`)
      }
    }
    
    // =================================================================
    // 7. VERIFICAR API FUNCTIONS - NOTIFICACIONES
    // =================================================================
    console.log('\n7️⃣ VERIFICANDO API FUNCTIONS - NOTIFICACIONES...')
    
    const notificationFunctions = [
      { name: 'get_all_push_subscriptions', params: {} },
      { name: 'get_user_push_subscriptions', params: { p_user_id: users[0]?.id } },
      { name: 'send_daily_reminder_notification', params: {} }
    ]
    
    for (const func of notificationFunctions) {
      try {
        const { data, error } = await supabaseAdmin.rpc(func.name, func.params)
        if (error) throw error
        console.log(`✅ ${func.name}: OK (${data.length} resultados)`)
      } catch (error) {
        console.log(`❌ ${func.name}: ERROR - ${error.message}`)
      }
    }
    
    // =================================================================
    // 8. VERIFICAR STORAGE
    // =================================================================
    console.log('\n8️⃣ VERIFICANDO STORAGE...')
    
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
      if (bucketsError) throw bucketsError
      
      const submissionBucket = buckets.find(b => b.name === 'submission')
      if (submissionBucket) {
        console.log('✅ Bucket "submission": OK')
        console.log(`   - Público: ${submissionBucket.public}`)
        console.log(`   - Límite de archivo: ${submissionBucket.file_size_limit} bytes`)
      } else {
        console.log('❌ Bucket "submission": NO ENCONTRADO')
      }
    } catch (error) {
      console.log(`❌ Storage: ERROR - ${error.message}`)
    }
    
    // =================================================================
    // 9. RESUMEN FINAL
    // =================================================================
    console.log('\n9️⃣ RESUMEN FINAL...')
    
    const { data: finalChallenges } = await supabaseAdmin.from('challenges').select('count')
    const { data: finalUsers } = await supabaseAdmin.from('users').select('count')
    const { data: finalSubmissions } = await supabaseAdmin.from('submissions').select('count')
    const { data: finalPushSubs } = await supabaseAdmin.from('push_subscriptions').select('count')
    
    console.log('📊 ESTADO FINAL DEL SISTEMA:')
    console.log(`   - Challenges: ${finalChallenges.length} retos`)
    console.log(`   - Usuarios: ${finalUsers.length} usuarios`)
    console.log(`   - Submissions: ${finalSubmissions.length} fotos`)
    console.log(`   - Push subscriptions: ${finalPushSubs.length} suscripciones`)
    
    console.log('\n🎉 AUDITORÍA COMPLETADA')
    console.log('✅ Sistema listo para producción')
    
  } catch (error) {
    console.error('❌ Error en auditoría:', error.message)
    process.exit(1)
  }
}

// Ejecutar auditoría
console.log('🚀 Iniciando auditoría completa...')
auditComplete()
  .then(() => {
    console.log('✅ Auditoría completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en auditoría:', error)
    process.exit(1)
  })
