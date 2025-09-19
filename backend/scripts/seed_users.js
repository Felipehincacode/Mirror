import { supabaseAdmin } from '../utils/supabase.js'

// Función para verificar usuarios existentes
async function seedUsers() {
  try {
    console.log('👥 Verificando usuarios en la base de datos...')
    
    // Obtener usuarios existentes
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
    
    if (error) throw error
    
    console.log(`📊 Usuarios encontrados: ${users.length}`)
    
    if (users.length > 0) {
      console.log('👤 Usuarios existentes:')
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.id})`)
      })
    } else {
      console.log('⚠️  No se encontraron usuarios')
      console.log('💡 Recuerda crear los usuarios en la sección Auth de Supabase')
    }
    
    // Verificar que existan en auth.users también
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) throw authError
    
    console.log(`🔐 Usuarios en auth: ${authUsers.users.length}`)
    
    if (authUsers.users.length > 0) {
      console.log('🔑 Usuarios autenticados:')
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`)
      })
    }
    
    console.log('✅ Verificación de usuarios completada')
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers()
}

export default seedUsers
