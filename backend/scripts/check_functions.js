import { supabaseAdmin } from '../utils/supabase.js'

async function checkFunctions() {
  try {
    console.log('🔍 Verificando si las functions existen...\n')
    
    // Lista de functions que deberían existir
    const functions = [
      'get_current_challenge',
      'get_gallery_manuela', 
      'get_gallery_felipe',
      'get_gallery_mirror',
      'get_map_photos',
      'get_calendar_data',
      'create_submission'
    ]
    
    for (const funcName of functions) {
      try {
        console.log(`📋 Probando ${funcName}...`)
        
        // Intentar llamar la function con parámetros mínimos
        let result
        if (funcName === 'get_current_challenge') {
          result = await supabaseAdmin.rpc(funcName)
        } else if (funcName === 'get_gallery_mirror') {
          result = await supabaseAdmin.rpc(funcName)
        } else if (funcName === 'get_calendar_data') {
          result = await supabaseAdmin.rpc(funcName)
        } else {
          // Para functions que requieren parámetros, usar un UUID dummy
          result = await supabaseAdmin.rpc(funcName, { 
            p_user_id: '00000000-0000-0000-0000-000000000000' 
          })
        }
        
        if (result.error) {
          console.log(`   ❌ ${funcName}: ${result.error.message}`)
        } else {
          console.log(`   ✅ ${funcName}: OK`)
        }
        
      } catch (error) {
        console.log(`   ❌ ${funcName}: ${error.message}`)
      }
    }
    
    console.log('\n💡 Si ves errores, necesitas ejecutar los SQL en Supabase:')
    console.log('   1. sql/api_functions.sql')
    console.log('   2. sql/submissions_functions.sql')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

checkFunctions()
