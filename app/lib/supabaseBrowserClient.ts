import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing at import time in production builds; throw only when used.
  // (Some Next build steps import modules eagerly.)
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey, {
  storage: undefined,
  auth: {
    // Sync auth state across tabs/windows
    detectSessionInUrl: false,
  },
});
export default supabaseBrowserClient;