import { type NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "@/app/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Use Vercel's system environment variable for the deployment URL.
  // Fallback to localhost for local development.
  const url = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
  console.log("OAuth callback request URL:", requestUrl.toString());
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