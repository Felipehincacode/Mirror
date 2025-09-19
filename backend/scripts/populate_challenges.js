import { supabaseAdmin } from '../utils/supabase.js'
import fs from 'fs'
import path from 'path'

// Función para poblar los challenges
async function populateChallenges() {
  try {
    console.log('🚀 Iniciando población de challenges...')
    
    // Verificar si ya existen challenges
    const { data: existingChallenges, error: checkError } = await supabaseAdmin
      .from('challenges')
      .select('id')
      .limit(1)
    
    if (checkError) throw checkError
    
    if (existingChallenges && existingChallenges.length > 0) {
      console.log('⚠️  Ya existen challenges en la base de datos')
      console.log('💡 Si quieres reemplazarlos, elimina primero los existentes')
      return
    }
    
    // Leer el archivo JSON con los challenges
    const challengesPath = path.join(process.cwd(), 'challenges.json')
    
    if (!fs.existsSync(challengesPath)) {
      console.log('❌ No se encontró el archivo challenges.json')
      console.log('📝 Crea el archivo challenges.json con tus 90 retos')
      return
    }
    
    const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf8'))
    
    // Convertir a formato de Supabase
    const challenges = challengesData.map((challenge, index) => ({
      day_index: index + 1,
      title: challenge.title,
      description: challenge.description || null,
      tag: challenge.tag || null,
      // Opcional: agregar la fecha si quieres usarla después
      // date: challenge.date
    }))
    
    console.log(`📊 Preparando ${challenges.length} challenges...`)
    
    // Insertar en lote
    const { data, error } = await supabaseAdmin
      .from('challenges')
      .insert(challenges)
    
    if (error) throw error
    
    console.log('✅ Challenges insertados correctamente!')
    console.log(`📈 Total: ${challenges.length} challenges creados`)
    
  } catch (error) {
    console.error('❌ Error al poblar challenges:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateChallenges()
}

export default populateChallenges
