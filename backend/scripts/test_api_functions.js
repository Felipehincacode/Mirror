import { supabaseAdmin } from '../utils/supabase.js'

// Función para probar las API functions
async function testAPIFunctions() {
  try {
    console.log('🧪 Probando API functions...\n')
    
    // 1. Probar get_current_challenge
    console.log('1️⃣ Probando get_current_challenge...')
    const { data: currentChallenge, error: error1 } = await supabaseAdmin
      .rpc('get_current_challenge', { start_date: '2025-09-14' })
    
    if (error1) throw error1
    console.log('✅ Challenge actual:', currentChallenge[0]?.title || 'No hay challenge')
    
    // 2. Probar get_challenge_by_day
    console.log('\n2️⃣ Probando get_challenge_by_day(1)...')
    const { data: day1Challenge, error: error2 } = await supabaseAdmin
      .rpc('get_challenge_by_day', { day_number: 1 })
    
    if (error2) throw error2
    console.log('✅ Challenge día 1:', day1Challenge[0]?.title || 'No encontrado')
    
    // 3. Probar get_challenges_range
    console.log('\n3️⃣ Probando get_challenges_range(1, 3)...')
    const { data: rangeChallenges, error: error3 } = await supabaseAdmin
      .rpc('get_challenges_range', { start_day: 1, end_day: 3 })
    
    if (error3) throw error3
    console.log('✅ Challenges 1-3:', rangeChallenges.length, 'encontrados')
    rangeChallenges.forEach(challenge => {
      console.log(`   Día ${challenge.day_index}: ${challenge.title}`)
    })
    
    // 4. Probar get_all_challenges
    console.log('\n4️⃣ Probando get_all_challenges...')
    const { data: allChallenges, error: error4 } = await supabaseAdmin
      .rpc('get_all_challenges')
    
    if (error4) throw error4
    console.log('✅ Total challenges:', allChallenges.length)
    
    // 5. Probar get_user_progress (necesitamos un user_id real)
    console.log('\n5️⃣ Probando get_user_progress...')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) throw usersError
    
    if (users.length > 0) {
      const { data: progress, error: error5 } = await supabaseAdmin
        .rpc('get_user_progress', { user_uuid: users[0].id })
      
      if (error5) throw error5
      console.log('✅ Progreso usuario:', progress[0])
    } else {
      console.log('⚠️  No hay usuarios para probar get_user_progress')
    }
    
    console.log('\n🎉 Todas las API functions funcionan correctamente!')
    
  } catch (error) {
    console.error('❌ Error probando API functions:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPIFunctions()
}

export default testAPIFunctions
