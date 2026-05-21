const runtimeEnv =
  typeof process !== "undefined" && process.env
    ? process.env
    : typeof window !== "undefined"
      ? window.NOUR_ENV || {}
      : {};

export const supabaseConfig = {
  url: runtimeEnv.SUPABASE_URL || "{{SUPABASE_URL}}",
  anonKey:
    runtimeEnv.SUPABASE_ANON_KEY ||
    "{{SUPABASE_ANON_KEY}}"
};
