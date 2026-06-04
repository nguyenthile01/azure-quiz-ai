import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });
  }

  return new NextResponse(JSON.stringify({ user }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
