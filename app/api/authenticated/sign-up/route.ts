import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = supabaseServerClient();
  const { email, password } = await req.json();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return new NextResponse("Failed to sign up", { status: 401 });
  }

  return new NextResponse("Signed up", { status: 200 });
}