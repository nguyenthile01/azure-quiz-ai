import { type NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "@/app/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Use an environment variable for the site URL in production for reliability.
  const url = process.env.PUBLIC_SITE_URL || requestUrl.origin;
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = supabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      // Redirect to an error page on failure
      return NextResponse.redirect(`${url}/auth/error`);
    }
  }

  // On success, redirect to the dashboard using the correct origin.
  return NextResponse.redirect(`${url}/dashboard`);
}