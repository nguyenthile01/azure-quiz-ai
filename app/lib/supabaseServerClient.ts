import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default function supabaseServerClient() {
  const cookieStore = cookies(); // sync in Route Handlers

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.then(cookies => cookies.getAll());
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.then(cookies => cookies.set(name, value, options));
          });
        },
      },
    }
  );
}