import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = supabaseServerClient();
  const url = process.env.PUBLIC_SITE_URL || request.nextUrl.origin;
  const { provider } = await request.json();

  if (!provider) {
    return NextResponse.json(
      { error: "Provider is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      // This now correctly uses the server-side request origin
      redirectTo: `${url}/api/authenticated/sign-in-with-auth/callback`,
    },
  });

  if (error || !data?.url) {
    console.error("Google Sign-In Error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to sign in with Google" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.url }, { status: 200 });
}