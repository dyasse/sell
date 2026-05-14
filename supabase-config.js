const runtimeEnv =
  typeof process !== "undefined" && process.env
    ? process.env
    : typeof window !== "undefined"
      ? window.NOUR_ENV || {}
      : {};

export const supabaseConfig = {
  url: runtimeEnv.SUPABASE_URL || "https://oqebxioqmcjlhkwqwktk.supabase.co",
  anonKey:
    runtimeEnv.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZWJ4aW9xbWNqbGhrd3F3a3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjkyMzUsImV4cCI6MjA5NDI0NTIzNX0.8F8qtO9solmaVf-lzyygLM-O9Ff9-LYuDf5O1Xf6wSA"
};
