import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) { 
  const supabase = supabaseServerClient();
  const { email, password } = await req.json();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return new NextResponse("Failed to sign in", { status: 401 });
  }

  return new NextResponse("Signed in", { status: 200 });  
}