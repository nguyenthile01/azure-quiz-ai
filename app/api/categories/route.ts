import supabaseServerClient from "@/app/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*");

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new NextResponse(JSON.stringify(categories), { status: 200 });
}