import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = supabaseServerClient();
  
  // Construct a canonical origin URL.
  // Use Vercel's production URL in production, otherwise fallback to localhost.
  const origin = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : 'http://localhost:3000';

  console.log(" origin for redirect:", origin);
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
      // Use the canonical origin to build the redirect URL
      redirectTo: `${origin}/api/authenticated/sign-in-with-auth/callback`,
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