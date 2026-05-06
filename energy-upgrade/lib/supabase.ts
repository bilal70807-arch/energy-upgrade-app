import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsxurvfrdmteyjijuyva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeHVydmZyZG10ZXlqaWp1eXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzUzODUsImV4cCI6MjA5MzI1MTM4NX0._C2vZyRY_nF057_L_CKofgj-gnPnUCrWk-HC9O2kP5s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)