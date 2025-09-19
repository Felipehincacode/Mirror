// Mirror Diary - Populate Daily Messages
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config({ path: '../config.env' });

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load daily messages from JSON file
const jsonPath = join(__dirname, '..', 'utils', 'daily.json');
const dailyMessages = JSON.parse(readFileSync(jsonPath, 'utf8'));

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "https://awepdardqnffaptvstrg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBkYXJkcW5mZmFwdHZzdHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjMwNTMsImV4cCI6MjA3MzI5OTA1M30.49t5rq9t6qvxmQIl_s5EmUd1SIMHaCehW1LQrA2tWgs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function populateDailyMessages() {
  try {
    console.log('🚀 Iniciando población de mensajes diarios...');
    console.log(`📅 Insertando ${dailyMessages.length} mensajes...`);

    // Insertar todos los mensajes
    const { error } = await supabase
      .from('daily_messages')
      .upsert(dailyMessages, { onConflict: 'date' });

    if (error) {
      console.error('❌ Error insertando mensajes:', error);
      return;
    }

    console.log('✅ ¡Mensajes diarios poblados exitosamente!');
    console.log(`📊 Total de mensajes insertados: ${dailyMessages.length}`);

  } catch (error) {
    console.error('❌ Error poblando mensajes:', error);
  }
}

// Ejecutar el script
populateDailyMessages();