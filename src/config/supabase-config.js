export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '{{SUPABASE_URL}}',
  anonKey: process.env.SUPABASE_ANON_KEY || '{{SUPABASE_ANON_KEY}}'
};
