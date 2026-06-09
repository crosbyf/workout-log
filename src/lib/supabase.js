import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nukygytvpwcrssuyyvmk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3lneXR2cHdjcnNzdXl5dm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzc0NzEsImV4cCI6MjA4ODA1MzQ3MX0.YXdi4yZ3blxxpeVvutDFQ5XMtUvVZuaMGgprkAVIXFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
