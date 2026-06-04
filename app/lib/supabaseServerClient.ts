import { createServerClient } from "@supabase/ssr";

// IMPORTANT: This Next variant may have different cookie APIs.
// If `next/headers` cookies() is supported, this works.
// If it isn’t, tell me and I’ll adapt based on your docs.
import { cookies } from "next/headers";

export default function supabaseServerClient() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      async setAll(cookiesToSet) {
        // In some server contexts cookies are read-only. Avoid crashing.
        try {
          for (const { name, value, options } of cookiesToSet) {
            (await cookieStore).set(name, value, options);
          }
        } catch {
          console.warn("Unable to set cookies in this server context. Cookies will not be updated.");
        }
      },
    },
  });
}