import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = supabaseServerClient();
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new NextResponse("Failed to sign out", { status: 401 });
    }

    return new NextResponse("Signed out", { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error }), { status: 500 });
  }
}
