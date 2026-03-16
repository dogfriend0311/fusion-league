import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance = null

function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'fusion-league-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  }
  return supabaseInstance
}

export const supabase = typeof window !== 'undefined'
  ? getSupabase()
  : createClient(supabaseUrl, supabaseAnonKey)