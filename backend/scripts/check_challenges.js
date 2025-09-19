import { supabaseAdmin } from '../utils/supabase.js'

async function checkChallenges() {
  try {
    console.log('🔍 Verificando challenges en la base de datos...')
    
    const { data, error } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .limit(5)
    
    if (error) throw error
    
    console.log(`📊 Total de challenges: ${data.length}`)
    
    if (data.length > 0) {
      console.log('📝 Primeros challenges:')
      data.forEach(challenge => {
        console.log(`   Día ${challenge.day_index}: ${challenge.title}`)
      })
    } else {
      console.log('⚠️  No hay challenges en la base de datos')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkChallenges()
