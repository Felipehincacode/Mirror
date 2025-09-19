import { supabaseAdmin } from '../utils/supabase.js'

// Función para reiniciar/resetear la base de datos
async function resetDatabase() {
  try {
    console.log('🔄 Reiniciando base de datos...\n')
    
    // 1. Eliminar todas las submissions (fotos)
    console.log('1️⃣ Eliminando submissions...')
    const { error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todas
    
    if (submissionsError) throw submissionsError
    console.log('✅ Submissions eliminadas')
    
    // 2. Eliminar todas las reacciones
    console.log('\n2️⃣ Eliminando reacciones...')
    const { error: reactionsError } = await supabaseAdmin
      .from('reactions')
      .delete()
      .neq('id', 0) // Eliminar todas
    
    if (reactionsError) throw reactionsError
    console.log('✅ Reacciones eliminadas')
    
    // 3. Verificar que los challenges siguen ahí
    console.log('\n3️⃣ Verificando challenges...')
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('challenges')
      .select('count')
      .limit(1)
    
    if (challengesError) throw challengesError
    console.log('✅ Challenges intactos')
    
    // 4. Verificar que los usuarios siguen ahí
    console.log('\n4️⃣ Verificando usuarios...')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username')
    
    if (usersError) throw usersError
    console.log('✅ Usuarios intactos:', users.map(u => u.username).join(', '))
    
    // 5. Verificar estado final
    console.log('\n5️⃣ Estado final:')
    const { data: finalSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('count')
      .limit(1)
    
    const { data: finalReactions } = await supabaseAdmin
      .from('reactions')
      .select('count')
      .limit(1)
    
    console.log(`   📊 Submissions: ${finalSubmissions?.length || 0}`)
    console.log(`   📊 Reacciones: ${finalReactions?.length || 0}`)
    console.log(`   📊 Challenges: 81`)
    console.log(`   📊 Usuarios: ${users.length}`)
    
    console.log('\n🎉 Base de datos reiniciada exitosamente!')
    console.log('💡 La app está lista para usar desde cero')
    
  } catch (error) {
    console.error('❌ Error reiniciando base de datos:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
console.log('🚀 Iniciando reset de base de datos...')
resetDatabase()
  .then(() => {
    console.log('✅ Reset completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en reset:', error)
    process.exit(1)
  })

export default resetDatabase
