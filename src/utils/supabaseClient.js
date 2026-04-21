import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pofpbnbrckzlnsjhcapw.supabase.co'
const supabaseAnonKey = 'sb_publishable_5Kq46FgcTaXy85Qf7A72jw_EguoyDLT' // Nota: Verifica si esta es la "anon public key" (suele empezar con eyJ...)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
