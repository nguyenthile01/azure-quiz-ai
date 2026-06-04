import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET() { 
  const supabase = supabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse("No active session", { status: 401 });
  }

  return NextResponse.json({ session });
}