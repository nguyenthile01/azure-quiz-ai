import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export default function supabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.then((store) => store.get(name)?.value || null);
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.then((store) => store.set({ name, value, ...options }));
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn("Cookie set failed in Server Component:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.then((store) => store.set({ name, value: "", ...options }));
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn("Cookie delete failed in Server Component:", error);
          }
        },
      },
    }
  );
}