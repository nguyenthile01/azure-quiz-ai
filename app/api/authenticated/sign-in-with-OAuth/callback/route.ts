import { type NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "@/app/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await supabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      // Redirect to an error page on failure
      return NextResponse.redirect(`${origin}/auth/error`);
    }
  }

  // On success, redirect to the dashboard.
  // The client-side AuthProvider will then refresh the session.
  return NextResponse.redirect(`${origin}/dashboard`);
}