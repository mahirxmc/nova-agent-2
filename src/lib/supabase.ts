import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN
export const SUPABASE_TOKEN = process.env.SUPABASE_SERVICE_ROLE_KEY