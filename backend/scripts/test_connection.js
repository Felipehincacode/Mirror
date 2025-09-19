import { testConnection } from '../utils/supabase.js'

async function main() {
  console.log('🔍 Probando conexión a Supabase...')
  
  const isConnected = await testConnection()
  
  if (isConnected) {
    console.log('🎉 Backend configurado correctamente!')
    process.exit(0)
  } else {
    console.log('💥 Error en la configuración del backend')
    process.exit(1)
  }
}

main()
