import { supabaseAdmin } from '../utils/supabase.js'

// Función para probar las API functions del frontend
async function testFrontendAPIs() {
  try {
    console.log('🧪 Probando API functions del frontend...\n')
    
    // Obtener IDs de usuarios para las pruebas
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username')
    
    if (usersError) throw usersError
    
    if (users.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos')
      return
    }
    
    console.log('👥 Usuarios encontrados:', users.map(u => u.username).join(', '))
    
    const manuelaId = users.find(u => u.username?.toLowerCase().includes('manulera'))?.id
    const felipeId = users.find(u => u.username?.toLowerCase().includes('felipe'))?.id
    
    // 1. Probar get_current_challenge
    console.log('\n1️⃣ Probando get_current_challenge...')
    const { data: currentChallenge, error: error1 } = await supabaseAdmin
      .rpc('get_current_challenge', { start_date: '2025-09-14' })
    
    if (error1) throw error1
    console.log('✅ Challenge actual:', currentChallenge[0]?.title || 'No hay challenge')
    
    // 2. Probar get_gallery_manuela (si existe Manuela)
    if (manuelaId) {
      console.log('\n2️⃣ Probando get_gallery_manuela...')
      const { data: manuelaGallery, error: error2 } = await supabaseAdmin
        .rpc('get_gallery_manuela', { p_user_id: manuelaId })
      
      if (error2) throw error2
      console.log('✅ Galería Manuela:', manuelaGallery.length, 'fotos')
    } else {
      console.log('\n2️⃣ ⚠️  No se encontró usuario Manuela')
    }
    
    // 3. Probar get_gallery_felipe (si existe Felipe)
    if (felipeId) {
      console.log('\n3️⃣ Probando get_gallery_felipe...')
      const { data: felipeGallery, error: error3 } = await supabaseAdmin
        .rpc('get_gallery_felipe', { p_user_id: felipeId })
      
      if (error3) throw error3
      console.log('✅ Galería Felipe:', felipeGallery.length, 'fotos')
    } else {
      console.log('\n3️⃣ ⚠️  No se encontró usuario Felipe')
    }
    
    // 4. Probar get_gallery_mirror
    console.log('\n4️⃣ Probando get_gallery_mirror...')
    const { data: mirrorGallery, error: error4 } = await supabaseAdmin
      .rpc('get_gallery_mirror')
    
    if (error4) throw error4
    console.log('✅ Galería Mirror:', mirrorGallery.length, 'fotos')
    
    // 5. Probar get_map_photos (con cualquier usuario)
    if (users.length > 0) {
      console.log('\n5️⃣ Probando get_map_photos...')
      const { data: mapPhotos, error: error5 } = await supabaseAdmin
        .rpc('get_map_photos', { p_user_id: users[0].id })
      
      if (error5) throw error5
      console.log('✅ Fotos con ubicación:', mapPhotos.length, 'fotos')
    }
    
    // 6. Probar get_calendar_data
    console.log('\n6️⃣ Probando get_calendar_data...')
    const { data: calendarData, error: error6 } = await supabaseAdmin
      .rpc('get_calendar_data', { start_date: '2025-09-14' })
    
    if (error6) throw error6
    console.log('✅ Datos del calendario:', calendarData.length, 'días')
    
    // Mostrar algunos ejemplos
    if (calendarData.length > 0) {
      console.log('\n📅 Ejemplo de datos del calendario:')
      const exampleDay = calendarData[0]
      console.log(`   Día ${exampleDay.day_index}: ${exampleDay.challenge_title}`)
      console.log(`   Manuela: ${exampleDay.has_manuela ? '✅' : '❌'}`)
      console.log(`   Felipe: ${exampleDay.has_felipe ? '✅' : '❌'}`)
    }
    
    // 7. Probar get_user_progress
    if (users.length > 0) {
      console.log('\n7️⃣ Probando get_user_progress...')
      const { data: progress, error: error7 } = await supabaseAdmin
        .rpc('get_user_progress', { user_uuid: users[0].id })
      
      if (error7) throw error7
      console.log('✅ Progreso usuario:', progress[0])
    }
    
    console.log('\n🎉 Todas las API functions del frontend funcionan correctamente!')
    
  } catch (error) {
    console.error('❌ Error probando API functions:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
console.log('🚀 Iniciando test desde npm script...')
testFrontendAPIs()
  .then(() => {
    console.log('✅ Test completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en test:', error)
    process.exit(1)
  })

export default testFrontendAPIs
