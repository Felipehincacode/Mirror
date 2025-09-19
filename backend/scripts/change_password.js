import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: './config.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function changePassword() {
  const email = 'manuela@diario.app'
  const newPassword = 'ValienteViajera'

  try {
    console.log(`🔐 Cambiando contraseña para ${email}...`)
    
    // Cambiar la contraseña usando el service role
    const { data, error } = await supabase.auth.admin.updateUserById(
      '91982cea-cea2-4e62-b5a0-56ebf62a1f2c', // UID de Manuela
      { password: newPassword }
    )

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    console.log('✅ Contraseña actualizada exitosamente!')
    console.log('📧 Email:', email)
    console.log('🔑 Nueva contraseña:', newPassword)
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message)
  }
}

// Ejecutar si se llama directamente
changePassword()
